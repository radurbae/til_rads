import Header from "@/components/Header/Header";
import Text from "@/components/I18n/Text";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
    title: "About | TIL",
    description: "Tentang website Today I Learned",
};

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={`container ${styles.page}`}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.backLink}>
                            <Text id="about.back" />
                        </Link>
                        <h1 className={styles.title}>
                            <Text id="about.title" />
                        </h1>
                    </div>
                    <div className={styles.content}>
                        <p>
                            <Text id="about.p1" />
                        </p>
                        <p>
                            <Text id="about.p2" />
                        </p>
                        <p>
                            <Text id="about.p3" />
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
