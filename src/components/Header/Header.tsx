"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import { useAppSettings } from "@/components/AppSettings/AppSettingsProvider";
import { t } from "@/lib/i18n";

export default function Header() {
    const { language, setLanguage, theme, toggleTheme } = useAppSettings();

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContent}`}>
                <Link href="/" className={styles.logo}>
                    TIL
                </Link>
                <nav className={styles.nav} aria-label="Primary">
                    <Link href="/categories" className={styles.navLink}>
                        {t(language, "nav.categories")}
                    </Link>
                    <Link href="/about" className={styles.navLink}>
                        {t(language, "nav.about")}
                    </Link>
                </nav>
                <div className={styles.controls}>
                    <div className={styles.languageSwitch} role="group" aria-label={t(language, "settings.language.switch")}>
                        <button
                            type="button"
                            onClick={() => setLanguage("id")}
                            className={`${styles.languageButton} ${language === "id" ? styles.activeLanguage : ""}`}
                        >
                            ID
                        </button>
                        <button
                            type="button"
                            onClick={() => setLanguage("en")}
                            className={`${styles.languageButton} ${language === "en" ? styles.activeLanguage : ""}`}
                        >
                            EN
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={styles.themeButton}
                        aria-label={t(language, "settings.theme.toggle")}
                    >
                        {theme === "light"
                            ? t(language, "settings.theme.dark")
                            : t(language, "settings.theme.light")}
                    </button>
                </div>
            </div>
        </header>
    );
}
