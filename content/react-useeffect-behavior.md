---
title: "Cara Kerja useEffect di React 18"
date: 2026-01-10
category: React
tags:
  - react
  - hooks
  - javascript
---

## Perubahan di React 18

Di React 18 dengan Strict Mode, `useEffect` akan dipanggil dua kali saat development. Ini untuk membantu menemukan bug yang berkaitan dengan cleanup effect.

## Anatomy of useEffect

```javascript
useEffect(() => {
  // Setup code
  const subscription = dataSource.subscribe();
  
  return () => {
    // Cleanup code
    subscription.unsubscribe();
  };
}, [dataSource]);
```

## Best Practices

- Selalu sertakan cleanup function jika setup membuat subscription
- Gunakan dependency array dengan benar
- Hindari object/array baru di dependency (gunakan useMemo)

## Kapan Tidak Perlu useEffect

Beberapa kasus di mana kamu **tidak** perlu useEffect:
- Transformasi data yang bisa dilakukan saat render
- Event handlers
- Inisialisasi state dari props

## Referensi

Baca lebih lanjut di [dokumentasi resmi React](https://react.dev/learn/synchronizing-with-effects).
