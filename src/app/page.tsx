import Header from "@/components/Header/Header";
import TilList, { TilListItem } from "@/components/TilList/TilList";
import { getAllTils } from "@/lib/til";
import styles from "./page.module.css";

export default function Home() {
    const tils = getAllTils();
    const tilItems: TilListItem[] = tils.map((til) => ({
        slug: til.slug,
        title: til.title,
        excerpt: til.excerpt,
        date: til.date,
        language: til.language,
        category: til.category,
        tags: til.tags,
    }));

    return (
        <>
            <Header />
            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={`container ${styles.heroContent}`}>
                        <h1 className={styles.heroTitle}>Today I Learned</h1>
                        <p className={styles.heroSubtitle}>
                            Catatan pribadi dari hal-hal yang aku pelajari setiap hari.
                        </p>
                    </div>
                </section>

                <section className={`container ${styles.section}`}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent</h2>
                    </div>
                    <TilList items={tilItems} />
                </section>

                <footer className={`container ${styles.footer}`}>
                    <p className={styles.footerText}>
                        Made with <span className={styles.heartIcon} aria-hidden="true">♥</span> by Rads
                    </p>
                </footer>
            </main>
        </>
    );
}
