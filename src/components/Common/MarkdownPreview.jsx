// src/components/Common/MarkdownPreview/MarkdownPreview.jsx
import React from 'react';
import styles from './MarkdownPreview.module.css';

const MarkdownPreview = ({
    children,
    enableParsing = true,
    className = '',
    wrapperClassName = '',
    codeTheme = "Dracula", // MacOS, Githubdark, Glass, Cyberpunk, TokyoNight
    tableTheme = "Nord"
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
                        __html: parseMarkdown(content, codeTheme, tableTheme),
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

export const parseMarkdown = (text, codeTheme, tableTheme) => {
    if (!text) return '';

    const placeholders = [];

    // 1️⃣ Unified Code Extraction (Blocks & Inline)
    let html = text.replace(
        /@(codeinline|code)(?:\s+([a-zA-Z0-9#+.-]+))?\n?([\s\S]*?)\s*@\/\1/g,
        (match, type, language, code) => {
            // If no newline after language, treat it as code instead
            if (language && !match.includes('\n')) {
                code = language + (code ? ' ' + code : '');
                language = null;
            }

            const id = `@@CODE_PLACEHOLDER_${placeholders.length}@@`;
            const trimmedCode = code.trim();
            const safeCodeForAttr = encodeURIComponent(trimmedCode);
            const isInline = type === 'codeinline';

            // Dynamic Class Selection
            const containerClass = styles['codeContainer' + codeTheme];
            const btnClass = styles['copyButton' + codeTheme];
            const preClass = styles['pre' + codeTheme];
            const codeClass = styles['code' + codeTheme];

            let content = '';

            if (isInline) {
                // RENDER INLINE VERSION
                content = `
                <span class="${styles.inlineWrapper} ${containerClass}">
                    <div class="${styles.inlineCodeHeader} ${!language ? styles.noLang : ''}">
                        ${language ? `<span class="${styles.inlineLang}">${language.toUpperCase()}</span>` : ''}
                        <button 
                            onclick="window.copyCodeSnippet(this)"
                            data-code="${safeCodeForAttr}"
                            class="${btnClass} ${styles.inlineCopyBtn}"
                        >Copy</button>
                    </div>
                    <code class="${styles.inlineContent} ${codeClass}">${escapeHtml(trimmedCode)}</code>
                </span>`;
            } else {
                // RENDER BLOCK VERSION
                content = `
                <div class="${containerClass}">
                    <div class="${styles.codeHeader} ${!language ? styles.noLang : ''}">
                        ${language ? `<span>${language.toUpperCase()}</span>` : ''}
                        <button 
                            onclick="window.copyCodeSnippet(this)"
                            data-code="${safeCodeForAttr}"
                            class="${btnClass}"
                        >Copy</button>
                    </div>
                    <pre class="${preClass}"><code class="${codeClass}">${escapeHtml(trimmedCode)}</code></pre>
                </div>`;
            }

            placeholders.push({ id, content });
            return id;
        }
    );
    // 0️⃣ Parse tables first
    html = parseCustomTable(html, placeholders, tableTheme);

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

    // ✅ Restore code blocks LAST
    placeholders.forEach(({ id, content }) => {
        html = html.replaceAll(id, content);
    });

    return html;
};

// Utility
const escapeHtml = (str) => str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[m]));


export const parseCustomTable = (text, placeholders, theme) => {
    if (!text) return text;
    let tableStyle, thStyle, tdStyle;

    switch (theme) {
        case "Nord":
            tableStyle = 'border-collapse: collapse; width: 100%; margin: 16px 0; background: #2e3440; border-radius: 8px; overflow: hidden;';
            thStyle = 'padding: 12px 16px; background: #3b4252; color: #88c0d0; font-weight: 600; text-align: left; border-bottom: 2px solid #4c566a;';
            tdStyle = 'padding: 12px 16px; color: #d8dee9; border-bottom: 1px solid #4c566a;';
            break;
        case "CyberPunk":
            tableStyle = 'border-collapse: collapse; width: 100%; margin: 16px 0; border-radius: 8px; overflow: hidden; background: #0a0a0f; border: 1px solid #ff00ff; box-shadow: 0 0 20px rgba(255,0,255,0.2);';
            thStyle = 'padding: 14px 18px; background: transparent; color: #00ffff; font-weight: 600; text-align: left; border-bottom: 2px solid #ff00ff; text-shadow: 0 0 10px rgba(0,255,255,0.5);';
            tdStyle = 'padding: 12px 18px; color: #ffffff; border-bottom: 1px solid #330033;';
            break;
        case "ElevatedCard":
            tableStyle = 'border-collapse: collapse; width: 100%; margin: 16px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.12); background: white;';
            thStyle = 'padding: 18px 24px; background: #1e293b; color: white; font-weight: 700; text-align: left; font-size: 14px;';
            tdStyle = 'padding: 16px 24px; color: #334155; border-bottom: 1px solid #e2e8f0;';
            break;
        case "Material":
            tableStyle = 'border-collapse: collapse; width: 100%; margin: 16px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden;';
            thStyle = 'padding: 16px; background: #f5f5f5; color: #212121; font-weight: 500; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;';
            tdStyle = 'padding: 16px; color: #424242; border-bottom: 1px solid #e0e0e0;';
            break;
    }



    return text.replace(/@table\s*([\s\S]*?)\s*@\/table/g, (tableMatch, tableContent) => {
        const rows = [];
        let headers = [];

        tableContent.replace(/@(head|data)\s+([\s\S]*?)\s*@\/\1/g, (match, type, content) => {
            const values = content.trim().split(/\s+/);
            if (type === 'head') headers = values;
            else if (type === 'data') rows.push(values);
        });

        const thead = headers.length
            ? `<thead><tr>${headers.map(h => `<th style="${thStyle}">${h}</th>`).join('')}</tr></thead>`
            : '';

        const tbody = rows.length
            ? `<tbody>${rows.map(row => `<tr>${row.map(cell => `<td style="${tdStyle}">${cell}</td>`).join('')}</tr>`).join('')}</tbody>`
            : '';

        const tableHTML = `<table style="${tableStyle}">${thead}${tbody}</table>`;

        // Create placeholder
        const id = `@@TABLE_PLACEHOLDER_${placeholders.length}@@`;
        placeholders.push({ id, content: tableHTML });
        return id;
    });
};