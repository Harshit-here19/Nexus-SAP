// src/components/Common/MarkdownPreview/MarkdownPreview.jsx
import React from 'react';
import styles from './MarkdownPreview.module.css';

const MarkdownPreview = ({
    children,
    enableParsing = true,
    className = '',
    wrapperClassName = '',
    codeTheme = "Dracula" // MacOS, Githubdark, Glass, Cyberpunk, TokyoNight
}) => {


    // Get the text content from children
    const getTextContent = () => {
        if (typeof children === 'string') {
            return children;
        }
        if (React.isValidElement(children)) {
            return children.props.children;
        }
        return '';
    };

    const content = getTextContent();

    return (
        <div className={`${styles['notes-preview-wrapper']} ${wrapperClassName}`}>
            {enableParsing ? (
                <div
                    className={`${styles['notes-preview']} ${className}`}
                    dangerouslySetInnerHTML={{
                        __html: parseMarkdown(content, codeTheme),
                    }}
                />
            ) : (
                <div className={`${styles['notes-preview']} ${className}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default MarkdownPreview;

export const parseMarkdown = (text, theme) => {
    if (!text) return '';

    const placeholders = [];

    // 1️⃣ Extract @code blocks with Copy Button
    let html = text.replace(/@code([\s\S]*?)@\/code/g, (match, code) => {
        const id = `@@CODE_BLOCK_${placeholders.length}@@`;
        const trimmedCode = code.trim();
        const safeCodeForAttr = encodeURIComponent(trimmedCode);

        placeholders.push({
            id,
            content: `
          <div class="${styles['codeContainer' + theme]}">
            <button 
                onclick="window.copyCodeSnippet(this)"
                data-code="${safeCodeForAttr}"
                class="${styles['copyButton' + theme]}"
            >Copy</button>
            <pre class="${styles['pre' + theme]}"><code class="${styles['code' + theme]}">${escapeHtml(trimmedCode)}</code></pre>
        </div>
          `
        });

        return id;
    });

    // 2️⃣ Escape remaining HTML
    html = escapeHtml(html);

    // 3️⃣ Markdown parsing
    // Dot Bullet Lists
    html = html.replace(/(?:^• .*(?:\r?\n|$))+/gm, (match) => {
        const items = match.trim().split(/\r?\n/)
            .map(item => `<li class="bullet">${item.replace(/^•\s+/, '')}</li>`)
            .join('');
        return `<ul class="bullet-list">${items}</ul>\n`; // Keep a \n to separate from next block
    });

    // Dash Bullet Lists
    html = html.replace(/(?:^- .*(?:\r?\n|$))+/gm, (match) => {
        const items = match.trim().split(/\r?\n/)
            .map(item => `<li class=${styles.arrow}>${item.replace(/^-\s+/, '')}</li>`)
            .join('');
        return `<ul class=${styles["arrow-list"]}>${items}</ul>\n`;
    });

    // Numbered Lists
    html = html.replace(/(?:^\d+\. .*(?:\r?\n|$))+/gm, (match) => {
        const items = match.trim().split(/\r?\n/)
            .map(item => `<li>${item.replace(/^\d+\.\s+/, '')}</li>`)
            .join('');
        return `<ol class="number-list">${items}</ol>\n`;
    });

    html = html
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/__(.+?)__/g, '<u>$1</u>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/==(.+?)==/g, '<mark>$1</mark>')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^---$|^___$|^\*\*\*$/gm, '<hr>')
        .replace(/^☑ (.+)$/gm, '<li class="checked">✅ $1</li>')
        .replace(/^☐ (.+)$/gm, '<li class="unchecked">⬜ $1</li>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 4px;">')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br>');

    html = html.replace(/\n(?!(?:<\/li>|<\/ul>|<\/ol>|<li>))/g, '<br>');

    return html;
};

// Utility
const escapeHtml = (str) => str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[m]));
// const escapeHtml = (str) =>
//     str
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;');