import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface TilData {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    tags: string[];
    content: string;
}

const contentDirectory = path.join(process.cwd(), "content");

export function getAllTils(): TilData[] {
    // Check if content directory exists
    if (!fs.existsSync(contentDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(contentDirectory);
    const allTils = fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, "");
            const fullPath = path.join(contentDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const { data, content } = matter(fileContents);

            // Generate excerpt from content (first 150 chars)
            const excerpt =
                data.excerpt ||
                content.replace(/[#*`\n]/g, " ").trim().slice(0, 150) + "...";

            return {
                slug,
                title: data.title || slug,
                excerpt,
                date: data.date
                    ? new Date(data.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })
                    : "Unknown",
                category: data.category || "General",
                tags: data.tags || [],
                content,
            } as TilData;
        });

    // Sort by date (newest first)
    return allTils.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getTilBySlug(slug: string): TilData | null {
    const fullPath = path.join(contentDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const excerpt =
        data.excerpt ||
        content.replace(/[#*`\n]/g, " ").trim().slice(0, 150) + "...";

    return {
        slug,
        title: data.title || slug,
        excerpt,
        date: data.date
            ? new Date(data.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            : "Unknown",
        category: data.category || "General",
        tags: data.tags || [],
        content,
    };
}

export function getAllSlugs(): string[] {
    if (!fs.existsSync(contentDirectory)) {
        return [];
    }

    return fs
        .readdirSync(contentDirectory)
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => fileName.replace(/\.md$/, ""));
}
