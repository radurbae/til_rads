import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Language } from '@/lib/i18n';

interface TranslateRequestBody {
    title?: string;
    content?: string;
    targetLanguage?: Language;
}

interface TranslateResult {
    title: string;
    content: string;
}

const translationCache = new Map<string, TranslateResult>();

function hashString(value: string): string {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0;
    }
    return `${hash}`;
}

function trimCache(maxItems: number) {
    while (translationCache.size > maxItems) {
        const firstKey = translationCache.keys().next().value;
        if (!firstKey) {
            break;
        }
        translationCache.delete(firstKey);
    }
}

function buildCacheKey(title: string, content: string, targetLanguage: Language): string {
    const fingerprint = hashString(`${title}\n${content}`);
    return `${targetLanguage}:${fingerprint}`;
}

function normalizeTitle(value: unknown, fallback: string): string {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim();
    return normalized || fallback;
}

function normalizeContent(value: unknown, fallback: string): string {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim();
    return normalized || fallback;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as TranslateRequestBody;
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        const content = typeof body.content === 'string' ? body.content.trim() : '';
        const targetLanguage = body.targetLanguage;

        if (!title || !content || (targetLanguage !== 'id' && targetLanguage !== 'en')) {
            return NextResponse.json(
                { error: 'Invalid translation payload' },
                { status: 400 }
            );
        }

        if (content.length > 45000) {
            return NextResponse.json(
                { error: 'Article content is too long to translate' },
                { status: 413 }
            );
        }

        const cacheKey = buildCacheKey(title, content, targetLanguage);
        const cached = translationCache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const languageLabel = targetLanguage === 'id' ? 'Bahasa Indonesia' : 'English';

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.1,
            max_tokens: 6000,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a professional translator. Return only valid JSON with keys "title" and "content".',
                },
                {
                    role: 'user',
                    content:
                        `Translate the article title and markdown content into ${languageLabel}. ` +
                        'Preserve markdown syntax exactly: headings, lists, links, blockquotes, code blocks, inline code, emphasis, and horizontal rules. ' +
                        `If the text is already mostly in ${languageLabel}, return it unchanged. ` +
                        'Do not add explanations.\n\n' +
                        `Title:\n${title}\n\nContent:\n${content}`,
                },
            ],
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) {
            throw new Error('Empty translation response');
        }

        const parsed = JSON.parse(raw) as Partial<TranslateResult>;
        const result: TranslateResult = {
            title: normalizeTitle(parsed.title, title),
            content: normalizeContent(parsed.content, content),
        };

        translationCache.set(cacheKey, result);
        trimCache(200);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Translate API error:', error);
        return NextResponse.json(
            { error: 'Failed to translate article' },
            { status: 500 }
        );
    }
}
