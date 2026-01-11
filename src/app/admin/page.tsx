"use client";

import { useState } from "react";
import Header from "@/components/Header/Header";
import Link from "next/link";
import styles from "./page.module.css";

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [createdSlug, setCreatedSlug] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password) {
            setIsLoggedIn(true);
            setError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/til", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, title, category, tags, content }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Gagal menyimpan");
                if (res.status === 401) {
                    setIsLoggedIn(false);
                }
                return;
            }

            setSuccess(data.message);
            setCreatedSlug(data.slug);
            setTitle("");
            setCategory("");
            setTags("");
            setContent("");
        } catch {
            setError("Terjadi kesalahan jaringan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={`container ${styles.page}`}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.backLink}>
                            ← Back
                        </Link>
                        <h1 className={styles.title}>New TIL</h1>
                    </div>

                    {!isLoggedIn ? (
                        <form onSubmit={handleLogin} className={styles.loginForm}>
                            <div className={styles.field}>
                                <label className={styles.label}>Password</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                />
                                <span className={styles.hint}>Default: admin123</span>
                            </div>
                            <button type="submit" className={styles.button} style={{ marginTop: "1rem" }}>
                                Login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && <div className={styles.error}>{error}</div>}
                            {success && (
                                <div className={styles.success}>
                                    {success}{" "}
                                    <Link href={`/til/${createdSlug}`} className={styles.successLink}>
                                        Lihat post →
                                    </Link>
                                </div>
                            )}

                            <div className={styles.field}>
                                <label className={styles.label}>Title</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Judul TIL"
                                    required
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Category</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="e.g. JavaScript"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="e.g. react, hooks"
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Content (Markdown)</label>
                                <textarea
                                    className={styles.textarea}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="## Heading&#10;&#10;Tulis konten TIL di sini menggunakan Markdown..."
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.button} disabled={loading}>
                                {loading ? "Menyimpan..." : "Publish TIL"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </>
    );
}
