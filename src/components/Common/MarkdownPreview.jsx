// src/components/Common/MarkdownPreview/MarkdownPreview.jsx
import React from "react";
import styles from "./MarkdownPreview.module.css";

const MarkdownPreview = ({
  children,
  enableParsing = true,
  className = "",
  wrapperClassName = "",
  codeTheme = "Dracula", // MacOS, Githubdark, Glass, Cyberpunk, TokyoNight
  tableTheme = "Nord",
}) => {
  // Get the text content from children
  const getTextContent = () => {
    if (typeof children === "string") {
      return children;
    }
    if (React.isValidElement(children)) {
      return children.props.children;
    }
    return "";
  };

  const content = getTextContent();

  return (
    <div className={`${styles["notes-preview-wrapper"]} ${wrapperClassName}`}>
      {enableParsing ? (
        <div
          className={`${styles["notes-preview"]} ${className}`}
          dangerouslySetInnerHTML={{
            __html: parseMarkdown(content, codeTheme, tableTheme),
          }}
        />
      ) : (
        <div className={`${styles["notes-preview"]} ${className}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default MarkdownPreview;

export const parseMarkdown = (text, codeTheme, tableTheme) => {
  if (!text) return "";

  const placeholders = [];

  // 1️⃣ Unified Code Extraction (Blocks & Inline)
  let html = text.replace(
    /@(codeinline|code)(?:\s+([a-zA-Z0-9#+.-]+))?\n?([\s\S]*?)\s*@\/\1/g,
    (match, type, language, code) => {
      // If no newline after language, treat it as code instead
      if (language && !match.includes("\n")) {
        code = language + (code ? " " + code : "");
        language = null;
      }

      const id = `@@CODE_PLACEHOLDER_${placeholders.length}@@`;
      const trimmedCode = code.trim();
      const safeCodeForAttr = encodeURIComponent(trimmedCode);
      const isInline = type === "codeinline";

      // Dynamic Class Selection
      const containerClass = styles["codeContainer" + codeTheme];
      const btnClass = styles["copyButton" + codeTheme];
      const preClass = styles["pre" + codeTheme];
      const codeClass = styles["code" + codeTheme];

      let content = "";

      if (isInline) {
        // RENDER INLINE VERSION
        content = `
                <span class="${styles.inlineWrapper} ${containerClass}">
                    <div class="${styles.inlineCodeHeader} ${!language ? styles.noLang : ""}">
                        ${language ? `<span class="${styles.inlineLang}">${language.toUpperCase()}</span>` : ""}
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
                    <div class="${styles.codeHeader} ${!language ? styles.noLang : ""}">
                        ${language ? `<span>${language.toUpperCase()}</span>` : ""}
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
    },
  );
  // 0️⃣ Parse tables first
  html = parseCustomTable(html, placeholders, tableTheme);

  // 2️⃣ Escape remaining HTML
  html = escapeHtml(html);

  // 3️⃣ Markdown parsing
  // Dot Bullet Lists
  html = html.replace(/(?:^• .*(?:\r?\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split(/\r?\n/)
      .map((item) => `<li class="bullet">${item.replace(/^•\s+/, "")}</li>`)
      .join("");
    return `<ul class="bullet-list">${items}</ul>\n`; // Keep a \n to separate from next block
  });

  // Dash Bullet Lists
  html = html.replace(/(?:^- .*(?:\r?\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split(/\r?\n/)
      .map(
        (item) => `<li class=${styles.arrow}>${item.replace(/^-\s+/, "")}</li>`,
      )
      .join("");
    return `<ul class=${styles["arrow-list"]}>${items}</ul>\n`;
  });

  // Numbered Lists
  html = html.replace(/(?:^\d+\. .*(?:\r?\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split(/\r?\n/)
      .map((item) => `<li>${item.replace(/^\d+\.\s+/, "")}</li>`)
      .join("");
    return `<ol class="number-list">${items}</ol>\n`;
  });

  html = html
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<u>$1</u>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/==(.+?)==/g, "<mark>$1</mark>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^---$|^___$|^\*\*\*$/gm, "<hr>")
    .replace(/^☑ (.+)$/gm, '<li class="checked">✅ $1</li>')
    .replace(/^☐ (.+)$/gm, '<li class="unchecked">⬜ $1</li>')
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 4px;">',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );

  html = html.replace(/\n(?!(?:<\/li>|<\/ul>|<\/ol>|<li>))/g, "<br>");

  // ✅ Restore code blocks LAST
  placeholders.forEach(({ id, content }) => {
    html = html.replaceAll(id, content);
  });

  return html;
};

// Utility
const escapeHtml = (str) =>
  str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m],
  );

export const parseCustomTable = (text, placeholders, theme) => {
  if (!text) return text;
  let tableStyle, thStyle, tdStyle;

  switch (theme) {
    case "ElevatedCard":
      tableStyle =
        "border-collapse: collapse; width: fit-content; margin: 16px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.12); background: white;";
      thStyle =
        "padding: 18px 24px; background: #1e293b; color: white; font-weight: 700; text-align: left; font-size: 14px;";
      tdStyle =
        "padding: 16px 24px; color: #334155; border-bottom: 1px solid #e2e8f0;";
      break;

    case "Nord":
      // Premium dark with gold accents.
      tableStyle =
        "border-collapse: separate; border-spacing: 0; width: fit-content; margin: 16px 0; background: #1b1d24; border: 2px solid #d9a600; border-radius: 8px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.22);";

      thStyle =
        "padding: 14px 18px; background: linear-gradient(180deg,#2b2f3a,#242833); color:#f8cb2e; font-weight:700; text-align:left; font-size:13px; text-transform:uppercase; letter-spacing:0.8px; border-bottom:2px solid #d9a600;";

      tdStyle =
        "padding:14px 18px; background:#1b1d24; color:#ececf3; font-size:14px; font-weight:500; border-bottom:1px solid rgba(217,166,0,0.18);";

      break;

    case "CyberPunk":
      // Keep your glass look and existing shadow.
      tableStyle =
        "border-collapse:separate;border-spacing:0;width:fit-content;margin:16px 0;background:linear-gradient(135deg,rgba(59,130,246,.28),rgba(139,92,246,.32));border-radius:8px;overflow:hidden;border:1px solid rgba(139,92,246,.35);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 0 0 1px rgba(99,102,241,.15),0 8px 24px rgba(99,102,241,.35),0 4px 12px rgba(0,0,0,.12);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);";

      thStyle =
        "padding:14px 18px;background:linear-gradient(135deg,#60a5fa,#8b5cf6) !important;color:#ffffff;font-weight:700;text-align:left;font-size:13px;text-transform:uppercase;letter-spacing:.7px;border-bottom:1px solid rgba(255,255,255,.18);";

      tdStyle =
        "padding:14px 18px;background:rgba(255,255,255,.02) !important;color:#111827;font-size:14px;font-weight:500;border-bottom:1px solid rgba(255,255,255,.10);";

      break;

    case "Material":
      // Neo-brutalist inspired by your button style.
      tableStyle =
        "border-collapse: separate; border-spacing:0; width:fit-content; margin:16px 0; background:#ffffff; border:2px solid #111827; border-radius:4px; overflow:hidden; box-shadow:4px 4px 0 #111827;";

      thStyle =
        "padding:15px 18px; background:#f3f4f6; color:#111827; font-weight:700; text-align:left; font-size:13px; text-transform:uppercase; letter-spacing:0.8px; border-bottom:2px solid #111827;";

      tdStyle =
        "padding:15px 18px; background:#ffffff; color:#1f2937; font-size:14px; font-weight:500; border-bottom:1px solid #d1d5db;";

      break;
  }

  return text.replace(
    /@table\s*([\s\S]*?)\s*@\/table/g,
    (tableMatch, tableContent) => {
      const rows = [];
      let headers = [];

      tableContent.replace(
        /@(head|data)\s+([\s\S]*?)\s*@\/\1/g,
        (match, type, content) => {
          // const values = content.trim().split(/\s+/);
          const values = content
            .split(/\s*\|\|\s*/)
            .map((v) => v.trim())
            .filter(Boolean);
          if (type === "head") headers = values;
          else if (type === "data") rows.push(values);
        },
      );

      const thead = headers.length
        ? `<thead><tr>${headers.map((h) => `<th style="${thStyle}">${h}</th>`).join("")}</tr></thead>`
        : "";

      const tbody = rows.length
        ? `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td style="${tdStyle}">${cell}</td>`).join("")}</tr>`).join("")}</tbody>`
        : "";

      const tableHTML = `<table style="${tableStyle}">${thead}${tbody}</table>`;

      // Create placeholder
      const id = `@@TABLE_PLACEHOLDER_${placeholders.length}@@`;
      placeholders.push({ id, content: tableHTML });
      return id;
    },
  );
};
