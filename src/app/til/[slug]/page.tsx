import Header from "@/components/Header/Header";
import TextSelectionHandler from "@/components/TextSelectionHandler/TextSelectionHandler";
import { parseMarkdown } from "@/lib/markdown";
import { getTilBySlug, getAllSlugs } from "@/lib/til";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostStats from "./PostStats";
import CommentSection from "./CommentSection";
import styles from "./page.module.css";

export async function generateStaticParams() {
    const slugs = getAllSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const til = getTilBySlug(slug);

    if (!til) {
        return { title: "Not Found" };
    }

    return {
        title: `${til.title} | TIL`,
        description: til.excerpt,
    };
}

export default async function TilPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const til = getTilBySlug(slug);

    if (!til) {
        notFound();
    }

    const htmlContent = parseMarkdown(til.content);
    const wordCount = til.content.trim().split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <>
            <Header />
            <main className={styles.main}>
                <article className={`container ${styles.article}`}>
                    <header className={styles.articleHeader}>
                        <Link href="/" className={styles.backLink}>
                            ← Back to all posts
                        </Link>
                        <div className={styles.meta}>
                            <span className={styles.category}>{til.category}</span>
                            <span className={styles.date}>{til.date}</span>
                        </div>
                        <h1 className={styles.title}>{til.title}</h1>
                        <PostStats
                            slug={til.slug}
                            readTimeMinutes={readTimeMinutes}
                            className={styles.postStats}
                        />
                        {til.tags.length > 0 && (
                            <div className={styles.tags}>
                                {til.tags.map((tag) => (
                                    <span key={tag} className={styles.tag}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>
                    <div
                        className={styles.content}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                    <CommentSection slug={til.slug} />
                </article>
            </main>
            <TextSelectionHandler articleTitle={til.title} />
        </>
    );
}
