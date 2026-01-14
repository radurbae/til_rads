# 📚 Panduan Teknis Website TIL (Today I Learned)

> **Dokumen ini menjelaskan arsitektur, cara kerja, dan pemeliharaan website TIL secara komprehensif.**

---

## 1. Arsitektur & Tech Stack

### 🛠️ Teknologi yang Digunakan

| Layer | Teknologi | Versi | Fungsi |
|-------|-----------|-------|--------|
| **Framework** | Next.js | 16.1.1 | Full-stack React framework dengan App Router |
| **Frontend** | React | 19.2.3 | Library UI berbasis komponen |
| **Bahasa** | TypeScript | 5.9.3 | JavaScript dengan type safety |
| **Styling** | CSS Modules | - | CSS yang ter-scope per komponen |
| **AI Chat** | OpenAI API | 6.16.0 | GPT-4o-mini untuk chatbot |
| **Markdown** | gray-matter | 4.0.3 | Parser frontmatter markdown |
| **Markdown Render** | react-markdown | 10.1.0 | Render markdown di React |
| **Hosting** | Vercel | - | Platform deployment otomatis |
| **Database** | GitHub (File-based) | - | Artikel disimpan sebagai file markdown |

### 🤝 Mengapa Kombinasi Ini Bekerja Baik?

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARSITEKTUR SISTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [User Browser]                                                │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────┐                                          │
│   │    Vercel CDN   │  ◄── Static files served from edge       │
│   └────────┬────────┘                                          │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────┐     ┌─────────────────┐                  │
│   │   Next.js App   │────▶│   API Routes    │                  │
│   │  (React + SSG)  │     │ /api/admin/*    │                  │
│   └────────┬────────┘     │ /api/chat       │                  │
│            │              └────────┬────────┘                  │
│            │                       │                            │
│            ▼                       ▼                            │
│   ┌─────────────────┐     ┌─────────────────┐                  │
│   │  content/*.md   │     │   GitHub API    │                  │
│   │ (Local Build)   │     │  (CRUD Ops)     │                  │
│   └─────────────────┘     └────────┬────────┘                  │
│                                    │                            │
│                                    ▼                            │
│                           ┌─────────────────┐                  │
│                           │   OpenAI API    │                  │
│                           │  (AI Chat)      │                  │
│                           └─────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Penjelasan Arsitektur:**

1. **Next.js + Vercel** = Pasangan sempurna. Vercel adalah pencipta Next.js, jadi optimasi deployment otomatis maksimal.

2. **File-based Content (Markdown)** = Tidak butuh database tradisional. Artikel disimpan sebagai file `.md` di folder `content/`. Ini seperti menyimpan dokumen Word, tapi untuk website.

3. **GitHub sebagai Backend** = Admin membuat/edit/hapus artikel via GitHub API. Setiap perubahan memicu Vercel redeploy otomatis. Gratis dan version-controlled!

4. **OpenAI untuk Chat** = AI membaca semua konten artikel dan bisa menjawab pertanyaan pengunjung tentang isi website.

---

## 2. Peta Struktur Folder (File Map)

```
til_rads/
├── 📁 content/                    # KONTEN ARTIKEL
│   ├── emotional-intelligence-daniel-goleman.md
│   ├── learning-how-to-learn-barbara-oakley.md
│   ├── thinking-fast-and-slow-daniel-kahneman.md
│   └── tips-membangun-komunikasi-asertif.md
│
├── 📁 src/                        # SOURCE CODE
│   ├── 📁 app/                    # HALAMAN & ROUTES (Next.js App Router)
│   │   ├── 📁 about/              # Halaman /about
│   │   │   ├── page.tsx
│   │   │   └── page.module.css
│   │   │
│   │   ├── 📁 admin/              # Halaman /admin (Dashboard)
│   │   │   ├── page.tsx           # UI admin lengkap (login, CRUD, tabs)
│   │   │   └── page.module.css
│   │   │
│   │   ├── 📁 api/                # API ROUTES (Backend)
│   │   │   ├── 📁 admin/
│   │   │   │   ├── route.ts                    # Login & Create artikel
│   │   │   │   ├── 📁 articles/
│   │   │   │   │   ├── route.ts                # GET list artikel
│   │   │   │   │   └── 📁 [slug]/
│   │   │   │   │       └── route.ts            # GET/PUT/DELETE artikel
│   │   │   │   ├── 📁 categories/
│   │   │   │   │   ├── route.ts                # GET list kategori
│   │   │   │   │   └── 📁 [name]/
│   │   │   │   │       └── route.ts            # PUT/DELETE kategori
│   │   │   │   └── 📁 tags/
│   │   │   │       ├── route.ts                # GET list tags
│   │   │   │       └── 📁 [name]/
│   │   │   │           └── route.ts            # PUT/DELETE tag
│   │   │   │
│   │   │   └── 📁 chat/
│   │   │       └── route.ts       # AI Chat endpoint
│   │   │
│   │   ├── 📁 categories/         # Halaman /categories
│   │   ├── 📁 category/[category] # Halaman /category/:name
│   │   ├── 📁 til/[slug]          # Halaman artikel /til/:slug
│   │   │
│   │   ├── layout.tsx             # Root layout (wrapper semua halaman)
│   │   ├── page.tsx               # Homepage
│   │   ├── globals.css            # CSS global & design tokens
│   │   └── icon.svg               # Favicon
│   │
│   ├── 📁 components/             # KOMPONEN REUSABLE
│   │   ├── 📁 ChatWidget/         # Floating chat AI
│   │   ├── 📁 Header/             # Header navigasi
│   │   ├── 📁 QuoteCard/          # Card untuk generate quote image
│   │   ├── 📁 TextSelectionHandler/ # Handler seleksi teks
│   │   └── 📁 TilCard/            # Card preview artikel
│   │
│   └── 📁 lib/                    # UTILITY FUNCTIONS
│       └── til.ts                 # Fungsi untuk baca artikel dari markdown
│
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
└── next.config.ts                 # Next.js configuration
```

### Penjelasan Folder Kunci:

| Folder | Analogi | Fungsi |
|--------|---------|--------|
| `content/` | Lemari arsip | Tempat semua artikel markdown disimpan |
| `src/app/` | Ruang tamu | Halaman-halaman yang dilihat pengunjung |
| `src/app/api/` | Dapur | "Memasak" data - proses backend |
| `src/components/` | Furnitur | Bagian-bagian UI yang bisa dipakai ulang |
| `src/lib/` | Toolbox | Fungsi-fungsi helper |

---

## 3. Penjelasan Fitur & Logika (Core Logic)

### Fitur 1: Menampilkan Artikel

**Alur Kerja:**

```
User buka homepage → Next.js baca folder content/ → Parse markdown files 
→ Extract frontmatter & content → Render sebagai HTML → Tampilkan di browser
```

**Bedah Kode (`src/lib/til.ts`):**

```typescript
// 1. Import library yang dibutuhkan
import fs from "fs";           // Untuk baca file dari disk
import path from "path";       // Untuk manipulasi path folder
import matter from "gray-matter"; // Untuk parse frontmatter markdown

// 2. Definisikan struktur data artikel
export interface TilData {
    slug: string;      // URL-friendly identifier (misal: "thinking-fast-and-slow")
    title: string;     // Judul artikel
    excerpt: string;   // Ringkasan singkat
    date: string;      // Tanggal, format Indonesia
    category: string;  // Kategori artikel
    tags: string[];    // Array tag
    content: string;   // Isi artikel (markdown)
}

// 3. Fungsi untuk ambil semua artikel
export function getAllTils(): TilData[] {
    // Tentukan lokasi folder content
    const contentDirectory = path.join(process.cwd(), "content");
    
    // Baca semua nama file di folder
    const fileNames = fs.readdirSync(contentDirectory);
    
    // Filter hanya file .md dan proses masing-masing
    const allTils = fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => {
            // Buat slug dari nama file (hapus .md)
            const slug = fileName.replace(/\.md$/, "");
            
            // Baca isi file
            const fullPath = path.join(contentDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            
            // Parse frontmatter (bagian antara --- dan ---)
            // data = metadata, content = isi artikel
            const { data, content } = matter(fileContents);
            
            // Return objek artikel
            return {
                slug,
                title: data.title,
                excerpt: content.slice(0, 150) + "...",
                date: new Date(data.date).toLocaleDateString("id-ID"),
                category: data.category,
                tags: data.tags,
                content,
            };
        });
    
    // Urutkan berdasarkan tanggal terbaru
    return allTils.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}
```

---

### Fitur 2: Admin CRUD via GitHub

**Alur Kerja Create Artikel:**

```
Admin login → Isi form artikel → Submit → API encode ke base64 
→ Kirim ke GitHub API → GitHub simpan file → Vercel redeploy 
→ Artikel muncul di website
```

**Bedah Kode (`src/app/api/admin/route.ts`):**

```typescript
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { password, title, content, category, tags } = body;

    // 1. Validasi password admin
    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // 2. Buat slug dari judul
    // "Thinking Fast and Slow" → "thinking-fast-and-slow"
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // Hapus karakter spesial
        .replace(/\s+/g, '-')           // Spasi jadi dash
        .trim();

    // 3. Format tanggal hari ini (2026-01-14)
    const date = new Date().toISOString().split('T')[0];

    // 4. Buat isi file markdown dengan frontmatter
    const frontmatter = `---
title: "${title}"
date: ${date}
category: ${category}
tags:
  - ${tags.split(',').join('\n  - ')}
---

${content}`;

    // 5. Encode ke base64 (format yang diminta GitHub)
    const fileContent = Buffer.from(frontmatter).toString('base64');

    // 6. Kirim ke GitHub API
    const response = await fetch(
        `https://api.github.com/repos/owner/repo/contents/content/${slug}.md`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
            },
            body: JSON.stringify({
                message: `Add new TIL: ${title}`,  // Commit message
                content: fileContent,              // File content (base64)
                branch: 'main',
            }),
        }
    );

    return NextResponse.json({ success: true });
}
```

---

### Fitur 3: AI Chat

**Alur Kerja:**

```
User ketik pertanyaan → Kirim ke /api/chat → API baca semua artikel 
→ Gabungkan dengan system prompt → Kirim ke OpenAI → Dapat jawaban 
→ Render sebagai markdown → Tampilkan di chat
```

**Bedah Kode (`src/app/api/chat/route.ts`):**

```typescript
// 1. Fungsi untuk mengumpulkan semua konten artikel
function getContentContext(): string {
    const contentDir = path.join(process.cwd(), 'content');
    const files = fs.readdirSync(contentDir);

    // Baca semua file .md dan gabungkan isinya
    const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const fileContent = fs.readFileSync(path.join(contentDir, file), 'utf8');
            const { data, content } = matter(fileContent);
            return `## ${data.title}\n${content}`;
        })
        .join('\n\n---\n\n');  // Pisahkan antar artikel

    return content;
}

// 2. System prompt = instruksi untuk AI
const systemPrompt = `Kamu adalah asisten AI yang mewakili Rads...`;

// 3. Handler untuk POST request
export async function POST(request: NextRequest) {
    const { messages } = await request.json();

    // 4. Kumpulkan konteks dari semua artikel
    const contentContext = getContentContext();

    // 5. Kirim ke OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: systemPrompt + contentContext  // Gabung instruksi + isi artikel
            },
            ...messages  // Riwayat chat user
        ],
        max_tokens: 1000,
        temperature: 0.7,  // Tingkat "kreativitas" AI (0=kaku, 1=kreatif)
    });

    return NextResponse.json({
        message: response.choices[0].message.content,
    });
}
```

---

## 4. Skema Database & Data Flow

### "Database" = File Markdown

Website ini **tidak menggunakan database tradisional** (MySQL, PostgreSQL, MongoDB). Sebagai gantinya, data disimpan sebagai **file markdown** dengan format:

```markdown
---
title: "Judul Artikel"
date: 2026-01-14
category: Book
tags:
  - psychology
  - self-improvement
---

Isi artikel dalam format markdown...
```

**Bagian `---` di awal disebut "Frontmatter"** - ini adalah metadata artikel.

### Struktur Data

```
┌─────────────────────────────────────────────────────────┐
│                    ARTIKEL (TilData)                    │
├─────────────────────────────────────────────────────────┤
│  slug: string        │ "thinking-fast-and-slow"        │
│  title: string       │ "Thinking Fast and Slow"        │
│  date: string        │ "14 Jan 2026"                   │
│  category: string    │ "Book"                          │
│  tags: string[]      │ ["psychology", "economics"]     │
│  content: string     │ "Buku ini membahas..."          │
│  excerpt: string     │ "Buku ini membahas cara..."     │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │  Admin  │───▶│  Form   │───▶│   API   │───▶│ GitHub  │       │
│  │  Input  │    │  Data   │    │ Route   │    │   API   │       │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘       │
│                                                     │            │
│                                                     ▼            │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │ Website │◀───│  Build  │◀───│ Vercel  │◀───│  Repo   │       │
│  │ Reader  │    │ Process │    │ Deploy  │    │ content/│       │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘       │
│                                                                  │
│  ALUR:                                                           │
│  1. Admin isi form → 2. Data dikirim ke API                     │
│  3. API commit ke GitHub → 4. Vercel auto-deploy                │
│  5. Website rebuild dengan konten baru → 6. User bisa baca      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Konsep Penting yang Digunakan

### 📖 Glosarium Istilah

| Istilah | Penjelasan | Analogi |
|---------|------------|---------|
| **API Route** | Endpoint yang menangani request HTTP (`/api/admin`, `/api/chat`). Seperti "pintu khusus" untuk komunikasi data. | Loket pelayanan di kantor |
| **SSG (Static Site Generation)** | Halaman di-render saat build, bukan saat user akses. Lebih cepat! | Memasak makanan sebelum restoran buka, bukan saat dipesan |
| **Frontmatter** | Metadata di awal file markdown (antara `---`). Berisi title, date, tags, dll. | Label di luar kotak yang menjelaskan isinya |
| **Slug** | Versi URL-friendly dari judul. "My Article!!" → "my-article" | Nama file yang aman disimpan |
| **Middleware** | Kode yang dijalankan sebelum request sampai ke handler. Untuk auth, logging, dll. | Satpam yang periksa ID sebelum masuk gedung |
| **State** | Data yang disimpan dalam komponen React dan bisa berubah. | Catatan yang terus di-update |
| **useState** | Hook React untuk membuat state. `const [count, setCount] = useState(0)` | Membuat whiteboard yang bisa dihapus-tulis |
| **useEffect** | Hook React untuk side effects (fetch data, subscribe, dll). | Alarm yang otomatis berbunyi saat kondisi tertentu |
| **useCallback** | Hook untuk memoize fungsi, mencegah re-render tidak perlu. | Menyimpan resep agar tidak ditulis ulang setiap hari |
| **async/await** | Cara menulis kode asynchronous yang mudah dibaca. | Memesan makanan dan menunggu, baru makan setelah datang |
| **CSS Modules** | CSS yang ter-scope per komponen. `.button` di file A berbeda dari `.button` di file B. | Memberi nama unik setiap furnitur di tiap ruangan |
| **Environment Variables** | Variabel rahasia yang disimpan di server, tidak di kode. | Brankas untuk kunci rumah |

---

## 6. Catatan Pemeliharaan (Maintenance)

### 🔧 Menambah Fitur Baru

| Tujuan | File yang Diubah |
|--------|-----------------|
| Tambah halaman baru | Buat folder di `src/app/` dengan `page.tsx` |
| Tambah komponen UI | Buat folder di `src/components/` |
| Tambah API endpoint | Buat folder di `src/app/api/` dengan `route.ts` |
| Ubah styling global | Edit `src/app/globals.css` |
| Tambah utility function | Tambah di `src/lib/` |

### 📝 Contoh: Menambah Halaman Baru `/contact`

1. Buat folder `src/app/contact/`
2. Buat file `page.tsx`:
```tsx
export default function ContactPage() {
    return <h1>Contact Me</h1>;
}
```
3. Done! Halaman langsung bisa diakses di `/contact`

### ⚠️ Potensi Error & Solusi

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `500 Internal Server Error` pada API | Environment variable tidak di-set | Tambahkan di Vercel Dashboard → Settings → Environment Variables |
| Artikel tidak muncul setelah create | Vercel belum selesai redeploy | Tunggu 1-2 menit, refresh halaman |
| Chat AI error | `OPENAI_API_KEY` tidak valid atau habis quota | Cek API key di OpenAI Dashboard, topup jika perlu |
| GitHub API error | `GITHUB_TOKEN` expired | Generate token baru di GitHub Settings → Developer Settings → Personal Access Tokens |
| Build gagal | Syntax error di kode | Jalankan `npm run build` lokal untuk debug |

### 🔐 Environment Variables yang Dibutuhkan

Tambahkan di Vercel Dashboard → Settings → Environment Variables:

| Variable | Deskripsi |
|----------|-----------|
| `ADMIN_PASSWORD` | Password untuk login admin dashboard |
| `GITHUB_TOKEN` | Personal Access Token untuk GitHub API (perlu permission: `repo`) |
| `GITHUB_REPO_OWNER` | Username GitHub (default: radurbae) |
| `GITHUB_REPO_NAME` | Nama repository (default: til_rads) |
| `OPENAI_API_KEY` | API Key dari platform.openai.com |

---

## 🎓 Penutup

Website TIL ini dibangun dengan filosofi **simplicity**:
- **Tidak ada database** - cukup file markdown
- **Tidak ada backend server** - API Routes berjalan di edge
- **Tidak ada auth system kompleks** - cukup password sederhana
- **Tidak ada CMS** - GitHub adalah CMS-nya

Semua ini membuat website:
- ✅ **Gratis** di-host di Vercel
- ✅ **Cepat** karena static generation
- ✅ **Version controlled** - setiap perubahan tercatat di Git
- ✅ **Mudah dimaintain** - struktur sederhana dan terorganisir

Selamat belajar! 🚀

---

*Dokumen ini dibuat pada 14 Januari 2026*
