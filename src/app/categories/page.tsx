import Header from "@/components/Header/Header";
import { getAllTils } from "@/lib/til";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
    title: "Categories | TIL",
    description: "Semua kategori catatan TIL",
};

export default function CategoriesPage() {
    const tils = getAllTils();

    // Group by category and count
    const categoryMap = new Map<string, number>();
    tils.forEach((til) => {
        const count = categoryMap.get(til.category) || 0;
        categoryMap.set(til.category, count + 1);
    });

    const categories = Array.from(categoryMap.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
    );

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={`container ${styles.page}`}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.backLink}>
                            ← Back
                        </Link>
                        <h1 className={styles.title}>Categories</h1>
                    </div>
                    <div className={styles.list}>
                        {categories.map(([name, count]) => (
                            <Link
                                key={name}
                                href={`/category/${name.toLowerCase()}`}
                                className={styles.categoryItem}
                            >
                                <span className={styles.categoryName}>{name}</span>
                                <span className={styles.categoryCount}>{count}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
