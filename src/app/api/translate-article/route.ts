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

const TRANSLATION_CACHE_VERSION = 'v3';
const DEFAULT_TRANSLATION_MODEL = 'gpt-4o-mini';
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
    return `${TRANSLATION_CACHE_VERSION}:${targetLanguage}:${fingerprint}`;
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

function countMatches(text: string, regex: RegExp): number {
    const matches = text.match(regex);
    return matches ? matches.length : 0;
}

function hasCriticalMarkdownDrift(source: string, translated: string): boolean {
    const checks = [
        /^#{1,3}\s/gm,
        /^\s*[-*+]\s/gm,
        /^\s*\d+\.\s/gm,
        /^>\s/gm,
        /```/g,
        /\[[^\]]+\]\([^)]+\)/g,
    ];

    return checks.some((pattern) => {
        const sourceCount = countMatches(source, pattern);
        if (sourceCount === 0) {
            return false;
        }
        const translatedCount = countMatches(translated, pattern);
        const allowedDiff = Math.max(1, Math.floor(sourceCount * 0.25));
        return Math.abs(sourceCount - translatedCount) > allowedDiff;
    });
}

function buildUserPrompt(title: string, content: string, languageLabel: string, strictMode = false): string {
    const strictSuffix = strictMode
        ? 'You changed markdown structure in the previous output. Redo translation and keep markdown structure exactly intact.'
        : '';

    return (
        `Translate the article title and markdown content into ${languageLabel}. ` +
        'Keep the translation natural, idiomatic, and publication-ready. ' +
        'Do not summarize or omit any part.\n\n' +
        'Hard rules:\n' +
        '- Preserve markdown structure and symbols.\n' +
        '- Preserve headings, bullet lists, numbered lists, blockquotes, links, and horizontal rules.\n' +
        '- Keep URLs unchanged.\n' +
        '- Do not translate text inside inline code (`...`) and fenced code blocks (```...```).\n' +
        '- Keep names and proper nouns unless there is a standard localized form.\n' +
        '- Return strict JSON with exactly two keys: "title" and "content".\n\n' +
        `${strictSuffix}\n\n` +
        `Title:\n${title}\n\nContent:\n${content}`
    );
}

async function performTranslation(
    openai: OpenAI,
    model: string,
    title: string,
    content: string,
    languageLabel: string,
    strictMode = false
): Promise<TranslateResult> {
    const completion = await openai.chat.completions.create({
        model,
        temperature: 0,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content:
                    'You are an expert bilingual translator and editor. Return only valid JSON with keys "title" and "content".',
            },
            {
                role: 'user',
                content: buildUserPrompt(title, content, languageLabel, strictMode),
            },
        ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
        throw new Error('Empty translation response');
    }

    const parsed = JSON.parse(raw) as Partial<TranslateResult>;
    return {
        title: normalizeTitle(parsed.title, title),
        content: normalizeContent(parsed.content, content),
    };
}

function getTranslationModels(): string[] {
    const primary = process.env.ARTICLE_TRANSLATION_MODEL?.trim();
    const candidates = [primary, DEFAULT_TRANSLATION_MODEL].filter(Boolean) as string[];
    return [...new Set(candidates)];
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
        const models = getTranslationModels();

        let result: TranslateResult | null = null;
        let lastError: unknown = null;

        for (const model of models) {
            try {
                let candidate = await performTranslation(
                    openai,
                    model,
                    title,
                    content,
                    languageLabel,
                    false
                );

                if (hasCriticalMarkdownDrift(content, candidate.content)) {
                    try {
                        candidate = await performTranslation(
                            openai,
                            model,
                            title,
                            content,
                            languageLabel,
                            true
                        );
                    } catch (strictError) {
                        lastError = strictError;
                    }
                }

                if (hasCriticalMarkdownDrift(content, candidate.content)) {
                    candidate = {
                        title: candidate.title,
                        content,
                    };
                }

                result = candidate;
                break;
            } catch (error) {
                lastError = error;
            }
        }

        if (!result) {
            throw lastError ?? new Error('All translation models failed');
        }

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
