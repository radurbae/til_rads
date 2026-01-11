import Header from "@/components/Header/Header";
import TilCard from "@/components/TilCard/TilCard";
import { getAllTils } from "@/lib/til";
import { notFound } from "next/navigation";
import styles from "../../page.module.css";

export async function generateStaticParams() {
    const tils = getAllTils();
    const categories = [...new Set(tils.map((til) => til.category.toLowerCase()))];
    return categories.map((category) => ({ category }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    return {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} | TIL`,
        description: `Catatan TIL dalam kategori ${category}`,
    };
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    const allTils = getAllTils();
    const tils = allTils.filter(
        (til) => til.category.toLowerCase() === category.toLowerCase()
    );

    if (tils.length === 0) {
        notFound();
    }

    const categoryName = tils[0].category;

    return (
        <>
            <Header />
            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={`container ${styles.heroContent}`}>
                        <h1 className={styles.heroTitle}>{categoryName}</h1>
                        <p className={styles.heroSubtitle}>
                            {tils.length} catatan dalam kategori ini
                        </p>
                    </div>
                </section>

                <section className={`container ${styles.section}`}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Posts</h2>
                    </div>
                    <div className={styles.grid}>
                        {tils.map((til) => (
                            <TilCard
                                key={til.slug}
                                slug={til.slug}
                                title={til.title}
                                excerpt={til.excerpt}
                                date={til.date}
                                category={til.category}
                                tags={til.tags}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
