import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';


// Get all content from markdown files
function getContentContext(): string {
    const contentDir = path.join(process.cwd(), 'content');
    const files = fs.readdirSync(contentDir);

    const content = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const filePath = path.join(contentDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContent);
            return `## ${data.title}\n${content}`;
        })
        .join('\n\n---\n\n');

    return content;
}

const systemPrompt = `Kamu adalah asisten AI yang mewakili pengetahuan dan pembelajaran Rads. Kamu memiliki akses ke semua tulisan dan ringkasan buku yang ada di website TIL (Today I Learned) milik Rads.

Peran kamu:
- Menjawab pertanyaan berdasarkan konten yang ada di website
- Menjelaskan konsep-konsep dari buku yang sudah diringkas (Emotional Intelligence, Learning How to Learn, Thinking Fast and Slow)
- Membantu pengunjung memahami materi dengan cara yang mudah dipahami
- Berbicara dalam Bahasa Indonesia yang natural dan ramah

Gaya komunikasi:
- Ramah dan helpful
- Gunakan contoh-contoh praktis
- Jika ditanya tentang sesuatu yang tidak ada di konten, akui dengan jujur dan berikan jawaban umum sebaik mungkin
- Keep responses concise but informative

Berikut adalah konteks dari semua tulisan di website:

`;

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const contentContext = getContentContext();

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt + contentContext
                },
                ...messages
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        return NextResponse.json({
            message: response.choices[0].message.content,
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response' },
            { status: 500 }
        );
    }
}
