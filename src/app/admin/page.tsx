"use client";

import Header from "@/components/Header/Header";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

interface Article {
    slug: string;
    sha: string;
    title: string;
    date: string;
    category: string;
    tags: string[];
    content?: string;
}

interface Category {
    name: string;
    count: number;
}

interface Tag {
    name: string;
    count: number;
}

type MainTab = "articles" | "categories" | "tags";
type ArticleSubTab = "create" | "manage";

export default function AdminPage() {
    // Auth state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Navigation state
    const [mainTab, setMainTab] = useState<MainTab>("articles");
    const [articleSubTab, setArticleSubTab] = useState<ArticleSubTab>("create");

    // Article form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [content, setContent] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Article management state
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoadingArticles, setIsLoadingArticles] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Article | null>(null);

    // Categories and Tags state
    const [categories, setCategories] = useState<Category[]>([]);
    const [tagsData, setTagsData] = useState<Tag[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(false);

    // Fetch articles
    const fetchArticles = useCallback(async () => {
        setIsLoadingArticles(true);
        try {
            const response = await fetch("/api/admin/articles", {
                headers: { "x-admin-password": password },
            });
            const data = await response.json();
            if (response.ok) {
                setArticles(data.articles || []);
            }
        } catch (error) {
            console.error("Failed to fetch articles:", error);
        } finally {
            setIsLoadingArticles(false);
        }
    }, [password]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        setIsLoadingCategories(true);
        try {
            const response = await fetch("/api/admin/categories", {
                headers: { "x-admin-password": password },
            });
            const data = await response.json();
            if (response.ok) {
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setIsLoadingCategories(false);
        }
    }, [password]);

    // Fetch tags
    const fetchTags = useCallback(async () => {
        setIsLoadingTags(true);
        try {
            const response = await fetch("/api/admin/tags", {
                headers: { "x-admin-password": password },
            });
            const data = await response.json();
            if (response.ok) {
                setTagsData(data.tags || []);
            }
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        } finally {
            setIsLoadingTags(false);
        }
    }, [password]);

    // Effects for fetching data
    useEffect(() => {
        if (isLoggedIn && mainTab === "articles" && articleSubTab === "manage") {
            fetchArticles();
        }
    }, [isLoggedIn, mainTab, articleSubTab, fetchArticles]);

    useEffect(() => {
        if (isLoggedIn && mainTab === "categories") {
            fetchCategories();
        }
    }, [isLoggedIn, mainTab, fetchCategories]);

    useEffect(() => {
        if (isLoggedIn && mainTab === "tags") {
            fetchTags();
        }
    }, [isLoggedIn, mainTab, fetchTags]);

    // Login handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError("");

        try {
            const response = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsLoggedIn(true);
            } else {
                setLoginError(data.error || "Password salah");
            }
        } catch {
            setLoginError("Gagal terhubung ke server");
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Create article handler
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    category: category || "TIL",
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
                setCategory("");
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch {
            setMessage("❌ Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    // Edit article handler
    const handleEdit = async (article: Article) => {
        try {
            const response = await fetch(`/api/admin/articles/${article.slug}`, {
                headers: { "x-admin-password": password },
            });
            const data = await response.json();
            if (response.ok) {
                setEditingArticle({
                    ...article,
                    content: data.content,
                });
            }
        } catch (error) {
            console.error("Failed to fetch article:", error);
        }
    };

    // Update article handler
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingArticle) return;

        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch(`/api/admin/articles/${editingArticle.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editingArticle.title,
                    category: editingArticle.category,
                    tags: editingArticle.tags.join(", "),
                    content: editingArticle.content,
                    password,
                    sha: editingArticle.sha,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ ${data.message}`);
                setEditingArticle(null);
                fetchArticles();
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch {
            setMessage("❌ Failed to update article");
        } finally {
            setIsLoading(false);
        }
    };

    // Delete article handler
    const handleDelete = async () => {
        if (!deleteConfirm) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/admin/articles/${deleteConfirm.slug}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password,
                    sha: deleteConfirm.sha,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ ${data.message}`);
                setDeleteConfirm(null);
                fetchArticles();
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch {
            setMessage("❌ Failed to delete article");
        } finally {
            setIsLoading(false);
        }
    };

    // Login Screen
    if (!isLoggedIn) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className={`container ${styles.loginContainer}`}>
                        <div className={styles.loginBox}>
                            <h1 className={styles.loginTitle}>🔐 Admin Login</h1>
                            <p className={styles.loginSubtitle}>
                                Masukkan password untuk mengakses halaman admin
                            </p>

                            <form onSubmit={handleLogin} className={styles.loginForm}>
                                <div className={styles.field}>
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Masukkan password admin"
                                        required
                                        autoFocus
                                    />
                                </div>

                                {loginError && (
                                    <div className={styles.loginError}>{loginError}</div>
                                )}

                                <button
                                    type="submit"
                                    className={styles.loginButton}
                                    disabled={isLoggingIn}
                                >
                                    {isLoggingIn ? "Memverifikasi..." : "Masuk"}
                                </button>
                            </form>

                            <Link href="/" className={styles.backToHome}>
                                ← Kembali ke beranda
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    // Dashboard
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={`container ${styles.dashboard}`}>
                    {/* Header */}
                    <div className={styles.dashboardHeader}>
                        <Link href="/" className={styles.backLink}>← Back</Link>
                        <h1 className={styles.dashboardTitle}>📊 Admin Dashboard</h1>
                    </div>

                    {/* Main Tabs */}
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tab} ${mainTab === "articles" ? styles.tabActive : ""}`}
                            onClick={() => setMainTab("articles")}
                        >
                            📝 Artikel
                        </button>
                        <button
                            className={`${styles.tab} ${mainTab === "categories" ? styles.tabActive : ""}`}
                            onClick={() => setMainTab("categories")}
                        >
                            📁 Kategori
                        </button>
                        <button
                            className={`${styles.tab} ${mainTab === "tags" ? styles.tabActive : ""}`}
                            onClick={() => setMainTab("tags")}
                        >
                            🏷️ Tags
                        </button>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={styles.message}>{message}</div>
                    )}

                    {/* Articles Tab */}
                    {mainTab === "articles" && (
                        <div className={styles.tabContent}>
                            {/* Sub Tabs */}
                            <div className={styles.subTabsContainer}>
                                <button
                                    className={`${styles.subTab} ${articleSubTab === "create" ? styles.subTabActive : ""}`}
                                    onClick={() => { setArticleSubTab("create"); setEditingArticle(null); }}
                                >
                                    ✏️ Tulis Baru
                                </button>
                                <button
                                    className={`${styles.subTab} ${articleSubTab === "manage" ? styles.subTabActive : ""}`}
                                    onClick={() => setArticleSubTab("manage")}
                                >
                                    📋 Kelola Artikel
                                </button>
                            </div>

                            {/* Create Form */}
                            {articleSubTab === "create" && !editingArticle && (
                                <form onSubmit={handleCreate} className={styles.form}>
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
                                            <input
                                                type="text"
                                                id="category"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                placeholder="Contoh: Book, TIL, Programming"
                                            />
                                            <span className={styles.fieldHint}>
                                                Ketik kategori bebas. Jika tidak ada, akan dibuat otomatis.
                                            </span>
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

                                    <button
                                        type="submit"
                                        className={styles.submit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Menyimpan..." : "💾 Simpan & Publish"}
                                    </button>
                                </form>
                            )}

                            {/* Edit Form */}
                            {editingArticle && (
                                <form onSubmit={handleUpdate} className={styles.form}>
                                    <div className={styles.editHeader}>
                                        <h3>Edit Artikel</h3>
                                        <button
                                            type="button"
                                            className={styles.cancelButton}
                                            onClick={() => setEditingArticle(null)}
                                        >
                                            ✕ Batal
                                        </button>
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor="editTitle">Judul</label>
                                        <input
                                            type="text"
                                            id="editTitle"
                                            value={editingArticle.title}
                                            onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className={styles.row}>
                                        <div className={styles.field}>
                                            <label htmlFor="editCategory">Kategori</label>
                                            <input
                                                type="text"
                                                id="editCategory"
                                                value={editingArticle.category}
                                                onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                                            />
                                        </div>

                                        <div className={styles.field}>
                                            <label htmlFor="editTags">Tags (comma separated)</label>
                                            <input
                                                type="text"
                                                id="editTags"
                                                value={editingArticle.tags.join(", ")}
                                                onChange={(e) => setEditingArticle({
                                                    ...editingArticle,
                                                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor="editContent">Konten (Markdown)</label>
                                        <textarea
                                            id="editContent"
                                            value={editingArticle.content || ""}
                                            onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                                            rows={20}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={styles.submit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Menyimpan..." : "💾 Update Artikel"}
                                    </button>
                                </form>
                            )}

                            {/* Article List */}
                            {articleSubTab === "manage" && !editingArticle && (
                                <div className={styles.articleList}>
                                    {isLoadingArticles ? (
                                        <div className={styles.loading}>Memuat artikel...</div>
                                    ) : articles.length === 0 ? (
                                        <div className={styles.emptyState}>Belum ada artikel</div>
                                    ) : (
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Judul</th>
                                                    <th>Kategori</th>
                                                    <th>Tanggal</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {articles.map((article) => (
                                                    <tr key={article.slug}>
                                                        <td className={styles.titleCell}>{article.title}</td>
                                                        <td>
                                                            <span className={styles.badge}>{article.category}</span>
                                                        </td>
                                                        <td className={styles.dateCell}>{article.date}</td>
                                                        <td className={styles.actionsCell}>
                                                            <button
                                                                className={styles.editButton}
                                                                onClick={() => handleEdit(article)}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                className={styles.deleteButton}
                                                                onClick={() => setDeleteConfirm(article)}
                                                            >
                                                                🗑️ Hapus
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Categories Tab */}
                    {mainTab === "categories" && (
                        <div className={styles.tabContent}>
                            <div className={styles.infoBox}>
                                ℹ️ Kategori dibuat otomatis dari artikel yang ditulis. Tidak bisa diedit secara terpisah.
                            </div>
                            {isLoadingCategories ? (
                                <div className={styles.loading}>Memuat kategori...</div>
                            ) : categories.length === 0 ? (
                                <div className={styles.emptyState}>Belum ada kategori</div>
                            ) : (
                                <div className={styles.cardGrid}>
                                    {categories.map((cat) => (
                                        <div key={cat.name} className={styles.card}>
                                            <div className={styles.cardIcon}>📁</div>
                                            <div className={styles.cardName}>{cat.name}</div>
                                            <div className={styles.cardCount}>{cat.count} artikel</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tags Tab */}
                    {mainTab === "tags" && (
                        <div className={styles.tabContent}>
                            <div className={styles.infoBox}>
                                ℹ️ Tags dibuat otomatis dari artikel yang ditulis. Tidak bisa diedit secara terpisah.
                            </div>
                            {isLoadingTags ? (
                                <div className={styles.loading}>Memuat tags...</div>
                            ) : tagsData.length === 0 ? (
                                <div className={styles.emptyState}>Belum ada tags</div>
                            ) : (
                                <div className={styles.tagCloud}>
                                    {tagsData.map((tag) => (
                                        <span key={tag.name} className={styles.tagItem}>
                                            {tag.name}
                                            <span className={styles.tagCount}>{tag.count}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className={styles.info}>
                        <p>
                            <strong>Catatan:</strong> Perubahan akan langsung di-commit ke GitHub
                            dan ter-deploy otomatis ke Vercel. Proses deploy membutuhkan
                            waktu ~1-2 menit.
                        </p>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h3>⚠️ Konfirmasi Hapus</h3>
                            <p>Apakah Anda yakin ingin menghapus artikel:</p>
                            <p className={styles.modalTitle}>&ldquo;{deleteConfirm.title}&rdquo;</p>
                            <p className={styles.modalWarning}>Tindakan ini tidak dapat dibatalkan!</p>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setDeleteConfirm(null)}
                                >
                                    Batal
                                </button>
                                <button
                                    className={styles.confirmDeleteButton}
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Menghapus..." : "Ya, Hapus"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
