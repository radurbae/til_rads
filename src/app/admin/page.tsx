"use client";

import Header from "@/components/Header/Header";
import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

export default function AdminPage() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Book");
    const [tags, setTags] = useState("");
    const [content, setContent] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    category,
                    tags,
                    content,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ ${data.message}`);
                setTitle("");
                setContent("");
                setTags("");
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch {
            setMessage("❌ Failed to connect to server");
        } finally {
            setIsLoading(false);
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
                        <h1 className={styles.title}>📝 Tulis TIL Baru</h1>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label htmlFor="password">Password Admin</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password admin"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="title">Judul</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Judul artikel"
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="category">Kategori</label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="Book">Book</option>
                                    <option value="TIL">TIL</option>
                                    <option value="Programming">Programming</option>
                                    <option value="Life">Life</option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="tags">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="book-summary, psychology"
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="content">Konten (Markdown)</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Tulis konten dalam format Markdown..."
                                rows={20}
                                required
                            />
                        </div>

                        {message && (
                            <div className={styles.message}>{message}</div>
                        )}

                        <button
                            type="submit"
                            className={styles.submit}
                            disabled={isLoading}
                        >
                            {isLoading ? "Menyimpan..." : "💾 Simpan & Publish"}
                        </button>
                    </form>

                    <div className={styles.info}>
                        <p>
                            <strong>Catatan:</strong> Artikel akan langsung di-commit ke GitHub
                            dan ter-deploy otomatis ke Vercel. Proses deploy membutuhkan
                            waktu ~1-2 menit.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
