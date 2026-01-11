# TIL - Today I Learned

Website pribadi untuk mencatat hal-hal yang dipelajari setiap hari.

**Live:** https://radurbae.github.io/til_rads/

## Quick Start

```bash
npm install      # Install dependencies
npm run dev      # Development server (localhost:3000)
npm run deploy   # Deploy ke GitHub Pages
```

---

## 📝 Cara Menulis TIL Baru

### 1. Buat File Markdown

Buat file `.md` baru di folder `content/`:

```
content/
├── git-rebase-basics.md
├── react-useeffect-behavior.md
└── nama-til-baru.md  ← file baru
```

**Nama file** akan menjadi URL slug. Contoh:
- `git-rebase-basics.md` → `/til/git-rebase-basics`

### 2. Struktur File

Setiap file TIL harus memiliki **frontmatter** (metadata) di bagian atas:

```markdown
---
title: "Judul TIL Anda"
date: 2026-01-11
category: JavaScript
tags:
  - react
  - hooks
  - tips
---

Konten TIL dimulai di sini...
```

| Field | Wajib | Deskripsi |
|-------|-------|-----------|
| `title` | ✅ | Judul yang tampil di website |
| `date` | ✅ | Tanggal (YYYY-MM-DD) |
| `category` | ✅ | Kategori utama (akan muncul di menu) |
| `tags` | ❌ | Tags opsional untuk filtering |

---

## 📖 Panduan Markdown

### Heading

```markdown
## Heading 2
### Heading 3
```

### Teks

```markdown
Teks biasa, **bold**, *italic*, dan `inline code`.
```

### List

```markdown
- Item 1
- Item 2
- Item 3
```

### Code Block

````markdown
```javascript
function hello() {
  console.log("Hello World!");
}
```
````

**Bahasa yang didukung:** `javascript`, `typescript`, `python`, `bash`, `css`, `html`, `json`, dll.

### Link

```markdown
Baca lebih lanjut di [dokumentasi React](https://react.dev).
```

### Blockquote

```markdown
> Ini adalah catatan penting yang perlu diingat.
```

---

## 📄 Contoh TIL Lengkap

```markdown
---
title: "Cara Menggunakan Array.reduce() di JavaScript"
date: 2026-01-11
category: JavaScript
tags:
  - javascript
  - array
  - functional
---

## Apa itu reduce()?

`reduce()` adalah method array yang menggabungkan semua elemen menjadi satu nilai.

## Sintaks Dasar

```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log(sum); // 15
```

## Kapan Menggunakan?

Gunakan `reduce()` ketika:
- Menghitung total dari array angka
- Mengubah array menjadi object
- Menggabungkan array nested

> Tips: Jika hanya perlu transformasi sederhana, gunakan `map()` atau `filter()` yang lebih readable.

## Referensi

- [MDN: Array.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
```

---

## 🚀 Deploy

Setelah menambah/edit TIL:

```bash
git add .
git commit -m "add: judul til baru"
npm run deploy
```

Website akan otomatis terupdate dalam 1-2 menit.

---

## 📁 Struktur Project

```
til_rads/
├── content/          # File TIL Markdown
├── src/
│   ├── app/          # Halaman Next.js
│   ├── components/   # Komponen UI
│   └── lib/til.ts    # Parser Markdown
└── package.json
```

## License

MIT
