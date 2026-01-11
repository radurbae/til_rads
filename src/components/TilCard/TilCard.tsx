import Link from "next/link";
import styles from "./TilCard.module.css";

export interface TilCardProps {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    tags?: string[];
}

export default function TilCard({
    slug,
    title,
    excerpt,
    date,
    category,
    tags,
}: TilCardProps) {
    return (
        <Link href={`/til/${slug}`} className={styles.card}>
            <div className={styles.meta}>
                <span className={styles.category}>{category}</span>
                <span className={styles.date}>{date}</span>
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.excerpt}>{excerpt}</p>
            {tags && tags.length > 0 && (
                <div className={styles.tags}>
                    {tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}
