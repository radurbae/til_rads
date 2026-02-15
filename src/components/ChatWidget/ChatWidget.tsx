"use client";

import styles from "./ChatWidget.module.css";

function getWhatsAppUrl(): string {
    const presetMessage = encodeURIComponent("Hi Rads, I want to chat with you.");
    const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
    const sanitizedNumber = rawNumber.replace(/\D/g, "");

    if (sanitizedNumber) {
        return `https://wa.me/${sanitizedNumber}?text=${presetMessage}`;
    }

    return `https://wa.me/?text=${presetMessage}`;
}

export default function ChatWidget() {
    return (
        <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.chatButton}
            aria-label="Chat with me on WhatsApp"
            title="Chat with me"
        >
            <svg
                className={styles.chatIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className={styles.chatLabel}>Chat with me</span>
        </a>
    );
}
