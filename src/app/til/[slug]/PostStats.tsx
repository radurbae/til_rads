"use client";

import { useEffect, useState } from "react";

interface PostStatsProps {
    slug: string;
    readTimeMinutes: number;
    className?: string;
}

const VIEW_STORAGE_KEY = "til-post-views";

function parseViewMap(rawValue: string | null): Record<string, number> {
    if (!rawValue) {
        return {};
    }

    try {
        const parsed = JSON.parse(rawValue);
        if (parsed && typeof parsed === "object") {
            return parsed as Record<string, number>;
        }
    } catch {
        return {};
    }

    return {};
}

export default function PostStats({ slug, readTimeMinutes, className }: PostStatsProps) {
    const [views, setViews] = useState(0);

    useEffect(() => {
        try {
            const viewMap = parseViewMap(window.localStorage.getItem(VIEW_STORAGE_KEY));
            const currentViews = Number(viewMap[slug]) || 0;
            const nextViews = currentViews + 1;

            viewMap[slug] = nextViews;
            window.localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(viewMap));
            setViews(nextViews);
        } catch {
            setViews(0);
        }
    }, [slug]);

    const viewLabel = `${views.toLocaleString()} ${views === 1 ? "view" : "views"}`;

    return (
        <p className={className}>
            <span>{viewLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{readTimeMinutes} min read</span>
        </p>
    );
}
