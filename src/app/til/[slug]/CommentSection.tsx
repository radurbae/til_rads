"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

interface CommentSectionProps {
    slug: string;
}

interface CommentItem {
    id: string;
    name: string;
    message: string;
    createdAt: string;
}

const COMMENT_STORAGE_KEY = "til-post-comments";

function parseCommentMap(rawValue: string | null): Record<string, CommentItem[]> {
    if (!rawValue) {
        return {};
    }

    try {
        const parsed = JSON.parse(rawValue);
        if (parsed && typeof parsed === "object") {
            return parsed as Record<string, CommentItem[]>;
        }
    } catch {
        return {};
    }

    return {};
}

function formatCommentDate(dateValue: string): string {
    return new Date(dateValue).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function createCommentId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CommentSection({ slug }: CommentSectionProps) {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        try {
            const commentMap = parseCommentMap(window.localStorage.getItem(COMMENT_STORAGE_KEY));
            const storedComments = Array.isArray(commentMap[slug]) ? commentMap[slug] : [];
            setComments(storedComments);
        } catch {
            setComments([]);
        }
    }, [slug]);

    const commentCountLabel = useMemo(() => {
        return `${comments.length} ${comments.length === 1 ? "Comment" : "Comments"}`;
    }, [comments.length]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const cleanName = name.trim();
        const cleanMessage = message.trim();

        if (!cleanName || !cleanMessage) {
            return;
        }

        const nextComment: CommentItem = {
            id: createCommentId(),
            name: cleanName,
            message: cleanMessage,
            createdAt: new Date().toISOString(),
        };

        const nextComments = [nextComment, ...comments];
        setComments(nextComments);
        setName("");
        setMessage("");

        try {
            const commentMap = parseCommentMap(window.localStorage.getItem(COMMENT_STORAGE_KEY));
            commentMap[slug] = nextComments;
            window.localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(commentMap));
        } catch {
            // Skip persistence errors and keep in-memory state.
        }
    };

    return (
        <section className={styles.commentsSection} aria-labelledby="comments-heading">
            <div className={styles.commentsHeader}>
                <h2 id="comments-heading" className={styles.commentsTitle}>
                    {commentCountLabel}
                </h2>
                <p className={styles.commentsSubtitle}>Share your thoughts about this post.</p>
            </div>

            <form className={styles.commentForm} onSubmit={handleSubmit}>
                <label className={styles.commentLabel} htmlFor="comment-name">
                    Name
                </label>
                <input
                    id="comment-name"
                    className={styles.commentInput}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={40}
                    placeholder="Your name"
                    required
                />

                <label className={styles.commentLabel} htmlFor="comment-message">
                    Comment
                </label>
                <textarea
                    id="comment-message"
                    className={styles.commentTextarea}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Write your comment..."
                    required
                />

                <div className={styles.commentFormFooter}>
                    <span className={styles.commentHint}>Be respectful and constructive.</span>
                    <button type="submit" className={styles.commentButton}>
                        Post Comment
                    </button>
                </div>
            </form>

            <div className={styles.commentList}>
                {comments.length === 0 && (
                    <p className={styles.commentEmpty}>No comments yet. Be the first to comment.</p>
                )}

                {comments.map((comment) => (
                    <article key={comment.id} className={styles.commentCard}>
                        <div className={styles.commentCardHeader}>
                            <strong className={styles.commentAuthor}>{comment.name}</strong>
                            <time className={styles.commentDate} dateTime={comment.createdAt}>
                                {formatCommentDate(comment.createdAt)}
                            </time>
                        </div>
                        <p className={styles.commentMessage}>{comment.message}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
