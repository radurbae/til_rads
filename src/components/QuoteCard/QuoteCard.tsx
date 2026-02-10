'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './QuoteCard.module.css';
import { useAppSettings } from '@/components/AppSettings/AppSettingsProvider';
import { t } from '@/lib/i18n';

interface QuoteCardProps {
    quote: string;
    source: string;
    isOpen: boolean;
    onClose: () => void;
}

// Beautiful gradient color palettes
const gradientPalettes = [
    { start: '#667eea', end: '#764ba2' }, // Purple Dream
    { start: '#f093fb', end: '#f5576c' }, // Pink Sunset
    { start: '#4facfe', end: '#00f2fe' }, // Cool Blue
    { start: '#43e97b', end: '#38f9d7' }, // Fresh Mint
    { start: '#fa709a', end: '#fee140' }, // Warm Glow
    { start: '#a18cd1', end: '#fbc2eb' }, // Soft Lavender
    { start: '#ff9a9e', end: '#fecfef' }, // Peach Blossom
    { start: '#667eea', end: '#43e97b' }, // Aurora
    { start: '#f857a6', end: '#ff5858' }, // Sunset Red
    { start: '#00c6fb', end: '#005bea' }, // Ocean Blue
    { start: '#1a1a2e', end: '#16213e' }, // Dark Navy (original)
    { start: '#0f0c29', end: '#302b63' }, // Deep Purple
    { start: '#232526', end: '#414345' }, // Dark Slate
    { start: '#2c3e50', end: '#4ca1af' }, // Sea Gradient
    { start: '#8e2de2', end: '#4a00e0' }, // Violet
];

function getRandomGradient() {
    const palette = gradientPalettes[Math.floor(Math.random() * gradientPalettes.length)];
    return palette;
}

export default function QuoteCard({ quote, source, isOpen, onClose }: QuoteCardProps) {
    const { language } = useAppSettings();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [currentGradient, setCurrentGradient] = useState(gradientPalettes[0]);

    const regenerateQuote = () => {
        setCurrentGradient(getRandomGradient());
    };

    useEffect(() => {
        if (!isOpen) return;
        setCurrentGradient(getRandomGradient());
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Canvas size (9:16 portrait for Stories/Reels)
        const width = 1080;
        const height = 1920;
        canvas.width = width;
        canvas.height = height;

        // Background gradient with random colors
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, currentGradient.start);
        gradient.addColorStop(1, currentGradient.end);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add subtle pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < width; i += 40) {
            for (let j = 0; j < height; j += 40) {
                ctx.fillRect(i, j, 1, 1);
            }
        }

        // Quote marks decoration
        ctx.font = 'bold 300px Georgia';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillText('"', 60, 350);
        ctx.fillText('"', width - 220, height - 200);

        // Draw quote text
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 48px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Word wrap the quote
        const maxWidth = width - 160;
        const lineHeight = 72;
        const words = quote.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) lines.push(currentLine);

        // Calculate starting Y position to center text
        const totalTextHeight = lines.length * lineHeight;
        const startY = (height - totalTextHeight) / 2;

        // Draw text with shadow for better readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + (index + 0.5) * lineHeight);
        });

        // Reset shadow for other elements
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Source/attribution
        ctx.font = '400 32px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const sourceY = startY + totalTextHeight + 80;
        ctx.fillText(`— ${source}`, width / 2, sourceY);

        // Branding
        ctx.font = '500 28px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('TIL by Rads', width / 2, height - 100);

        // Decorative line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(200, height - 150);
        ctx.lineTo(width - 200, height - 150);
        ctx.stroke();

        // Generate image URL
        setImageUrl(canvas.toDataURL('image/png'));
    }, [isOpen, quote, source, currentGradient]);

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.download = `quote-${Date.now()}.png`;
        link.href = imageUrl;
        link.click();
    };

    const handleCopyToClipboard = async () => {
        if (!canvasRef.current) return;
        try {
            const blob = await new Promise<Blob>((resolve) => {
                canvasRef.current!.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/png');
            });
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            alert(t(language, 'quote.copySuccess'));
        } catch {
            alert(t(language, 'quote.copyError'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>
                <h3 className={styles.title}>{t(language, 'quote.previewTitle')}</h3>

                <div className={styles.previewContainer}>
                    <canvas ref={canvasRef} className={styles.canvas} />
                    {imageUrl && (
                        <img src={imageUrl} alt="Quote preview" className={styles.preview} />
                    )}
                </div>

                <div className={styles.actions}>
                    <button onClick={regenerateQuote} className={styles.shuffleButton}>
                        🎨 {t(language, 'quote.shuffle')}
                    </button>
                    <button onClick={handleDownload} className={styles.downloadButton}>
                        📥 {t(language, 'quote.download')}
                    </button>
                    <button onClick={handleCopyToClipboard} className={styles.copyButton}>
                        📋 {t(language, 'quote.copy')}
                    </button>
                </div>
            </div>
        </div>
    );
}
