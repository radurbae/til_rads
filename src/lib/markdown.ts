export function parseMarkdown(content: string): string {
    let html = content;

    // Headers
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Code blocks
    html = html.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre><code class="language-$1">$2</code></pre>'
    );

    // Lists (unordered and ordered)
    html = html.replace(/^\s*[-*+] (.+)$/gm, '<li data-list="ul">$1</li>');
    html = html.replace(/^\s*\d+\. (.+)$/gm, '<li data-list="ol">$1</li>');
    html = html.replace(/(<li data-list="ul">.*<\/li>\n?)+/g, (match: string) => {
        return `<ul>${match.replace(/ data-list="ul"/g, "")}</ul>`;
    });
    html = html.replace(/(<li data-list="ol">.*<\/li>\n?)+/g, (match: string) => {
        return `<ol>${match.replace(/ data-list="ol"/g, "")}</ol>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

    // Horizontal rules
    html = html.replace(/^---$/gm, "<hr>");

    // Paragraphs
    html = html
        .split("\n\n")
        .map((block: string) => {
            if (
                block.startsWith("<h") ||
                block.startsWith("<ul") ||
                block.startsWith("<ol") ||
                block.startsWith("<pre") ||
                block.startsWith("<blockquote") ||
                block.startsWith("<hr")
            ) {
                return block;
            }
            return `<p>${block}</p>`;
        })
        .join("\n");

    return html;
}
