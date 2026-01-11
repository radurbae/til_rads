---
title: "CSS Container Queries: Responsive Based on Parent"
date: 2026-01-09
category: CSS
tags:
  - css
  - responsive
  - layout
---

## Apa itu Container Queries?

Container queries memungkinkan kita untuk menerapkan style berdasarkan ukuran **container parent**, bukan viewport seperti media queries.

## Setup Container

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}
```

## Menggunakan Container Query

```css
@container card (min-width: 400px) {
  .card {
    display: flex;
    gap: 1rem;
  }
  
  .card-image {
    width: 200px;
  }
}
```

## Keuntungan

- Komponen menjadi truly reusable
- Tidak tergantung pada viewport
- Design system yang lebih modular

## Browser Support

Container queries sudah didukung di semua browser modern! 🎉

Cek [caniuse.com](https://caniuse.com/css-container-queries) untuk detail lengkap.
