---
title: "Cara Menggunakan Git Rebase untuk Merapikan Commit History"
date: 2026-01-11
category: Git
tags:
  - git
  - version-control
  - workflow
---

## Apa itu Git Rebase?

Git rebase adalah perintah yang digunakan untuk mengubah basis commit dari sebuah branch. Ini sangat berguna untuk merapikan commit history sebelum merge ke branch utama.

## Kapan Menggunakan Rebase?

Gunakan rebase ketika:
- Ingin menjaga history yang linear dan bersih
- Perlu mengupdate branch fitur dengan perubahan terbaru dari main
- Ingin menggabungkan beberapa commit menjadi satu (squash)

## Contoh Penggunaan

```bash
# Pindah ke branch fitur
git checkout feature-branch

# Rebase dengan main
git rebase main

# Interactive rebase untuk squash commits
git rebase -i HEAD~3
```

## Tips Penting

> Jangan pernah rebase commit yang sudah di-push ke remote dan digunakan orang lain!

Rebase akan menulis ulang commit history, jadi hanya gunakan pada commit lokal atau branch pribadi.

## Kesimpulan

Git rebase adalah tool yang powerful untuk menjaga commit history tetap bersih dan mudah dibaca. Dengan workflow yang tepat, tim bisa memiliki history yang informatif dan terstruktur.
