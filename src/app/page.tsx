import Header from "@/components/Header/Header";
import TilCard from "@/components/TilCard/TilCard";
import { getAllTils } from "@/lib/til";
import styles from "./page.module.css";

export default function Home() {
    const tils = getAllTils();

    return (
        <>
            <Header />
            <main className={styles.main}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={`container ${styles.heroContent}`}>
                        <h1 className={styles.heroTitle}>Today I Learned</h1>
                        <p className={styles.heroSubtitle}>
                            Catatan pribadi dari hal-hal yang saya pelajari setiap hari.
                        </p>
                    </div>
                </section>

                {/* TIL List */}
                <section className={`container ${styles.section}`}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent</h2>
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

                {/* Footer */}
                <footer className={`container ${styles.footer}`}>
                    <p className={styles.footerText}>
                        Made with ❤️ by Rads
                    </p>
                </footer>
            </main>
        </>
    );
}
