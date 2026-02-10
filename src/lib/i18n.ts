export type Language = "id" | "en";

export type TranslationValues = {
    count?: number;
};

type TranslationEntry = string | ((values?: TranslationValues) => string);

type TranslationMap = {
    [key: string]: TranslationEntry;
};

const translations: Record<Language, TranslationMap> = {
    id: {
        "nav.categories": "Kategori",
        "nav.about": "Tentang",
        "settings.theme.toggle": "Ubah tema",
        "settings.language.switch": "Ganti bahasa",
        "settings.theme.dark": "Gelap",
        "settings.theme.light": "Terang",
        "home.title": "Hari Ini Saya Belajar",
        "home.subtitle": "Catatan pribadi dari hal-hal yang aku pelajari setiap hari.",
        "home.recent": "Terbaru",
        "home.footer": "Dibuat dengan hati oleh Rads",
        "about.back": "<- Kembali",
        "about.title": "Tentang",
        "about.p1": "TIL (Today I Learned) adalah kumpulan catatan singkat tentang hal-hal yang saya pelajari setiap hari.",
        "about.p2": "Setiap catatan berisi pembelajaran kecil yang mungkin berguna untuk referensi di masa depan atau bermanfaat bagi orang lain.",
        "about.p3": "Website ini dibangun dengan Next.js dan di-host sebagai proyek open source.",
        "categories.back": "<- Kembali",
        "categories.title": "Kategori",
        "category.posts": "Tulisan",
        "category.count": (values?: TranslationValues) => `${values?.count ?? 0} catatan dalam kategori ini`,
        "til.backAllPosts": "<- Kembali ke semua tulisan",
        "til.translating": "Menerjemahkan artikel...",
        "quote.selectionButton": "Buat Quote",
        "quote.previewTitle": "Preview Quote",
        "quote.shuffle": "Warna Lain",
        "quote.download": "Download",
        "quote.copy": "Salin",
        "quote.copySuccess": "Gambar berhasil disalin ke clipboard!",
        "quote.copyError": "Gagal menyalin gambar. Coba download langsung.",
        "chat.headerTitle": "Tanya Rads",
        "chat.headerSubtitle": "Tanyakan apa pun tentang tulisanku di sini",
        "chat.welcomeHello": "Halo!",
        "chat.welcomeBody": "Saya Rads, AI yang punya pengetahuan dari tulisan-tulisan di website ini. Silakan tanya apa saja.",
        "chat.typing": "Mengetik...",
        "chat.inputPlaceholder": "Ketik pertanyaan...",
        "chat.errorGeneric": "Maaf, terjadi kesalahan. Silakan coba lagi.",
        "chat.errorConnection": "Maaf, terjadi kesalahan koneksi. Silakan coba lagi."
    },
    en: {
        "nav.categories": "Categories",
        "nav.about": "About",
        "settings.theme.toggle": "Toggle theme",
        "settings.language.switch": "Switch language",
        "settings.theme.dark": "Dark",
        "settings.theme.light": "Light",
        "home.title": "Today I Learned",
        "home.subtitle": "Personal notes on things I learn every day.",
        "home.recent": "Recent",
        "home.footer": "Made with care by Rads",
        "about.back": "<- Back",
        "about.title": "About",
        "about.p1": "TIL (Today I Learned) is a collection of short notes about things I learn every day.",
        "about.p2": "Each note captures a small lesson that might be useful for future reference or helpful to others.",
        "about.p3": "This website is built with Next.js and hosted as an open source project.",
        "categories.back": "<- Back",
        "categories.title": "Categories",
        "category.posts": "Posts",
        "category.count": (values?: TranslationValues) => `${values?.count ?? 0} notes in this category`,
        "til.backAllPosts": "<- Back to all posts",
        "til.translating": "Translating article...",
        "quote.selectionButton": "Create Quote",
        "quote.previewTitle": "Quote Preview",
        "quote.shuffle": "New Colors",
        "quote.download": "Download",
        "quote.copy": "Copy",
        "quote.copySuccess": "Image copied to clipboard!",
        "quote.copyError": "Failed to copy image. Please download it directly.",
        "chat.headerTitle": "Ask Rads",
        "chat.headerSubtitle": "Ask anything about my writing here",
        "chat.welcomeHello": "Hello!",
        "chat.welcomeBody": "I am Rads, an AI trained on the writing on this website. Feel free to ask anything.",
        "chat.typing": "Typing...",
        "chat.inputPlaceholder": "Type your question...",
        "chat.errorGeneric": "Sorry, something went wrong. Please try again.",
        "chat.errorConnection": "Sorry, connection error. Please try again."
    }
};

export type TranslationKey = keyof (typeof translations)["id"];

export function t(
    language: Language,
    key: TranslationKey,
    values?: TranslationValues
): string {
    const entry = translations[language][key] ?? translations.id[key] ?? key;
    if (typeof entry === "function") {
        return entry(values);
    }
    return entry;
}
