'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppSettings } from '@/components/AppSettings/AppSettingsProvider';
import TextSelectionHandler from '@/components/TextSelectionHandler/TextSelectionHandler';
import { parseMarkdown } from '@/lib/markdown';
import { t } from '@/lib/i18n';
import styles from './LocalizedArticle.module.css';

const TRANSLATION_CACHE_VERSION = 'v3';

interface LocalizedArticleProps {
    slug: string;
    title: string;
    content: string;
    tags?: string[];
    titleClassName: string;
    tagsClassName?: string;
    tagClassName?: string;
    contentClassName: string;
}

interface TranslationPayload {
    fingerprint: string;
    title: string;
    content: string;
}

function normalizeText(value: string): string {
    return value.replace(/\r\n/g, '\n').trim();
}

function hashString(value: string): string {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0;
    }
    return `${hash}`;
}

async function requestTranslation(
    title: string,
    content: string,
    targetLanguage: 'id' | 'en',
    signal: AbortSignal
): Promise<{ title: string; content: string }> {
    const response = await fetch('/api/translate-article', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title,
            content,
            targetLanguage,
        }),
        signal,
    });

    if (!response.ok) {
        throw new Error('Failed to translate article');
    }

    const data = await response.json();
    return {
        title: typeof data.title === 'string' && data.title.trim() ? data.title : title,
        content: typeof data.content === 'string' && data.content.trim() ? data.content : content,
    };
}

export default function LocalizedArticle({
    slug,
    title,
    content,
    tags = [],
    titleClassName,
    tagsClassName,
    tagClassName,
    contentClassName,
}: LocalizedArticleProps) {
    const { language } = useAppSettings();
    const [translated, setTranslated] = useState<{ title: string; content: string } | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    const sourceText = useMemo(() => `${title}\n${content}`, [title, content]);
    const sourceFingerprint = useMemo(() => hashString(normalizeText(sourceText)), [sourceText]);

    useEffect(() => {
        let isCancelled = false;
        const controller = new AbortController();
        const cacheKey = `til:translation:${TRANSLATION_CACHE_VERSION}:${slug}:${language}`;

        const cached = window.localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached) as TranslationPayload;
                if (
                    parsed.fingerprint === sourceFingerprint &&
                    typeof parsed.title === 'string' &&
                    typeof parsed.content === 'string'
                ) {
                    setTranslated({ title: parsed.title, content: parsed.content });
                    return () => {
                        controller.abort();
                    };
                }
            } catch {
                window.localStorage.removeItem(cacheKey);
            }
        }

        setTranslated(null);
        setIsTranslating(true);

        requestTranslation(title, content, language, controller.signal)
            .then((result) => {
                if (isCancelled) return;
                setTranslated(result);
                const payload: TranslationPayload = {
                    fingerprint: sourceFingerprint,
                    title: result.title,
                    content: result.content,
                };
                window.localStorage.setItem(cacheKey, JSON.stringify(payload));
            })
            .catch(() => {
                if (isCancelled) return;
                setTranslated(null);
            })
            .finally(() => {
                if (isCancelled) return;
                setIsTranslating(false);
            });

        return () => {
            isCancelled = true;
            controller.abort();
        };
    }, [content, language, slug, sourceFingerprint, title]);

    const resolvedTitle = translated?.title ?? title;
    const resolvedContent = translated?.content ?? content;
    const htmlContent = useMemo(() => parseMarkdown(resolvedContent), [resolvedContent]);

    return (
        <>
            <h1 className={titleClassName}>{resolvedTitle}</h1>
            {tags.length > 0 && tagsClassName && tagClassName && (
                <div className={tagsClassName}>
                    {tags.map((tag) => (
                        <span key={tag} className={tagClassName}>
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
            {isTranslating && (
                <p className={styles.translationStatus}>{t(language, 'til.translating')}</p>
            )}
            <div
                className={contentClassName}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
            <TextSelectionHandler
                key={`${slug}-${language}-${resolvedTitle}`}
                articleTitle={resolvedTitle}
            />
        </>
    );
}
