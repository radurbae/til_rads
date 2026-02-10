import Header from "@/components/Header/Header";
import Text from "@/components/I18n/Text";
import { getTilBySlug, getAllSlugs } from "@/lib/til";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import TextSelectionHandler from "@/components/TextSelectionHandler/TextSelectionHandler";

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

// Simple Markdown to HTML converter
function parseMarkdown(content: string): string {
    let html = content;

    // Headers
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Code blocks
    html = html.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre><code class="language-$1">$2</code></pre>'
    );

    // Lists (unordered and ordered)
    html = html.replace(/^\s*[-*+] (.+)$/gm, '<li data-list="ul">$1</li>');
    html = html.replace(/^\s*\d+\. (.+)$/gm, '<li data-list="ol">$1</li>');
    html = html.replace(/(<li data-list="ul">.*<\/li>\n?)+/g, (match) => {
        return `<ul>${match.replace(/ data-list="ul"/g, "")}</ul>`;
    });
    html = html.replace(/(<li data-list="ol">.*<\/li>\n?)+/g, (match) => {
        return `<ol>${match.replace(/ data-list="ol"/g, "")}</ol>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

    // Horizontal rules
    html = html.replace(/^---$/gm, "<hr>");

    // Paragraphs
    html = html
        .split("\n\n")
        .map((block) => {
            if (
                block.startsWith("<h") ||
                block.startsWith("<ul") ||
                block.startsWith("<ol") ||
                block.startsWith("<pre") ||
                block.startsWith("<blockquote") ||
                block.startsWith("<hr")
            ) {
                return block;
            }
            return `<p>${block}</p>`;
        })
        .join("\n");

    return html;
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
                        <h1 className={styles.title}>{til.title}</h1>
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
                </article>
            </main>
            <TextSelectionHandler articleTitle={til.title} />
        </>
    );
}
