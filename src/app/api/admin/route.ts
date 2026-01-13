import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { title, category, tags, content, password } = await request.json();

        // Simple password protection
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Create slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Format date
        const date = new Date().toISOString().split('T')[0];

        // Create frontmatter
        const frontmatter = `---
title: "${title}"
date: ${date}
category: ${category || 'TIL'}
tags:
${tags ? tags.split(',').map((t: string) => `  - ${t.trim()}`).join('\n') : '  - til'}
---

${content}`;

        // Check if GitHub token is available
        const githubToken = process.env.GITHUB_TOKEN;
        const repoOwner = process.env.GITHUB_REPO_OWNER || 'radurbae';
        const repoName = process.env.GITHUB_REPO_NAME || 'til_rads';

        if (!githubToken) {
            return NextResponse.json(
                { error: 'GitHub token not configured' },
                { status: 500 }
            );
        }

        // Create file via GitHub API
        const filePath = `content/${slug}.md`;
        const fileContent = Buffer.from(frontmatter).toString('base64');

        const response = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    message: `Add new TIL: ${title}`,
                    content: fileContent,
                    branch: 'main',
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('GitHub API error:', error);
            return NextResponse.json(
                { error: 'Failed to create file on GitHub' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            slug: slug,
            message: 'TIL created successfully! It will appear after Vercel redeploys.',
        });
    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json(
            { error: 'Failed to create TIL' },
            { status: 500 }
        );
    }
}
