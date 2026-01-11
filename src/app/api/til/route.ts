import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Password untuk admin - ganti sesuai keinginan
const ADMIN_PASSWORD = "admin123";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password, title, category, tags, content } = body;

        // Verify password
        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: "Password salah" },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!title || !category || !content) {
            return NextResponse.json(
                { error: "Title, category, dan content wajib diisi" },
                { status: 400 }
            );
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();

        // Create frontmatter
        const date = new Date().toISOString().split("T")[0];
        const tagsArray = tags
            ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : [];

        const frontmatter = `---
title: "${title}"
date: ${date}
category: ${category}
${tagsArray.length > 0 ? `tags:\n${tagsArray.map((t: string) => `  - ${t}`).join("\n")}` : ""}
---

${content}`;

        // Save to content folder
        const contentDir = path.join(process.cwd(), "content");
        if (!fs.existsSync(contentDir)) {
            fs.mkdirSync(contentDir, { recursive: true });
        }

        const filePath = path.join(contentDir, `${slug}.md`);

        // Check if file already exists
        if (fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: "Post dengan judul serupa sudah ada" },
                { status: 409 }
            );
        }

        fs.writeFileSync(filePath, frontmatter, "utf-8");

        return NextResponse.json({
            success: true,
            slug,
            message: "TIL berhasil disimpan!",
        });
    } catch (error) {
        console.error("Error creating TIL:", error);
        return NextResponse.json(
            { error: "Gagal menyimpan TIL" },
            { status: 500 }
        );
    }
}
