import Header from "@/components/Header/Header";
import TilCard from "@/components/TilCard/TilCard";
import Text from "@/components/I18n/Text";
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
                        <h1 className={styles.heroTitle}>
                            <Text id="home.title" />
                        </h1>
                        <p className={styles.heroSubtitle}>
                            <Text id="home.subtitle" />
                        </p>
                    </div>
                </section>

                {/* TIL List */}
                <section className={`container ${styles.section}`}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <Text id="home.recent" />
                        </h2>
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
                        <Text id="home.footer" />
                    </p>
                </footer>
            </main>
        </>
    );
}
