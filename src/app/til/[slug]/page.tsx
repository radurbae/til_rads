import Header from "@/components/Header/Header";
import Text from "@/components/I18n/Text";
import LocalizedArticle from "@/components/LocalizedArticle/LocalizedArticle";
import { getTilBySlug, getAllSlugs } from "@/lib/til";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

// Generate static params for all TIL posts
export async function generateStaticParams() {
    const slugs = getAllSlugs();
    return slugs.map((slug) => ({ slug }));
}

// Generate metadata for SEO
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

    return (
        <>
            <Header />
            <main className={styles.main}>
                <article className={`container ${styles.article}`}>
                    <header className={styles.articleHeader}>
                        <Link href="/" className={styles.backLink}>
                            <Text id="til.backAllPosts" />
                        </Link>
                        <div className={styles.meta}>
                            <span className={styles.category}>{til.category}</span>
                            <span className={styles.date}>{til.date}</span>
                        </div>
                    </header>
                    <LocalizedArticle
                        slug={til.slug}
                        title={til.title}
                        content={til.content}
                        tags={til.tags}
                        titleClassName={styles.title}
                        tagsClassName={styles.tags}
                        tagClassName={styles.tag}
                        contentClassName={styles.content}
                    />
                </article>
            </main>
        </>
    );
}
