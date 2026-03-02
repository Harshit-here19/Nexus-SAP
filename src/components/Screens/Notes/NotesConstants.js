// src/components/Screens/Notes/NotesConstants.js

// Note Categories
export const NOTE_CATEGORIES = [
  { value: 'personal', label: '👤 Personal', color: '#9c27b0', icon: '👤' },
  { value: 'work', label: '💼 Work', color: '#2196f3', icon: '💼' },
  { value: 'ideas', label: '💡 Ideas', color: '#ff9800', icon: '💡' },
  { value: 'todo', label: '✅ To-Do', color: '#4caf50', icon: '✅' },
  { value: 'meeting', label: '📅 Meeting', color: '#e91e63', icon: '📅' },
  { value: 'reference', label: '📚 Reference', color: '#795548', icon: '📚' },
  { value: 'journal', label: '📔 Journal', color: '#607d8b', icon: '📔' },
  { value: 'project', label: '🚀 Project', color: '#00bcd4', icon: '🚀' },
  { value: 'learning', label: '🎓 Learning', color: '#673ab7', icon: '🎓' },
  { value: 'other', label: '📁 Other', color: '#9e9e9e', icon: '📁' }
];

// Note Priority
export const PRIORITY_OPTIONS = [
  { value: 'low', label: '🟢 Low', color: '#4caf50' },
  { value: 'medium', label: '🟡 Medium', color: '#ff9800' },
  { value: 'high', label: '🔴 High', color: '#f44336' },
  { value: 'urgent', label: '🔥 Urgent', color: '#d32f2f' }
];

// Note Status
export const STATUS_OPTIONS = [
  { value: 'draft', label: '📝 Draft', color: '#9e9e9e' },
  { value: 'active', label: '✅ Active', color: '#4caf50' },
  { value: 'archived', label: '📦 Archived', color: '#607d8b' },
  { value: 'pinned', label: '📌 Pinned', color: '#e91e63' }
];

export const VERTICAL_FORMATTING_OPTIONS = [
  { 
    action: 'bold', 
    icon: 'B', 
    title: 'Bold', 
    label: 'Bold',
    shortcut: 'Ctrl+B',
    style: { fontWeight: 'bold' } 
  },
  { 
    action: 'italic', 
    icon: 'I', 
    title: 'Italic', 
    label: 'Italic',
    shortcut: 'Ctrl+I',
    style: { fontStyle: 'italic' } 
  },
  { 
    action: 'underline', 
    icon: 'U', 
    title: 'Underline', 
    label: 'Underline',
    shortcut: 'Ctrl+U',
    style: { textDecoration: 'underline' } 
  },
  { 
    action: 'strikethrough', 
    icon: 'S', 
    title: 'Strikethrough', 
    label: 'Strike',
    shortcut: 'Ctrl+Shift+S',
    style: { textDecoration: 'line-through' } 
  },
  { action: 'separator' },
  { 
    action: 'h1', 
    icon: 'H1', 
    title: 'Heading 1', 
    label: 'Heading 1',
    shortcut: 'Ctrl+1'
  },
  { 
    action: 'h2', 
    icon: 'H2', 
    title: 'Heading 2', 
    label: 'Heading 2',
    shortcut: 'Ctrl+2'
  },
  { 
    action: 'h3', 
    icon: 'H3', 
    title: 'Heading 3', 
    label: 'Heading 3',
    shortcut: 'Ctrl+3'
  },
  { action: 'separator' },
  { 
    action: 'bullet', 
    icon: '•', 
    title: 'Bullet List', 
    label: 'Bullets',
    shortcut: 'Ctrl+Shift+8'
  },
  { 
    action: 'number', 
    icon: '1.', 
    title: 'Numbered List', 
    label: 'Numbers',
    shortcut: 'Ctrl+Shift+7'
  },
  { 
    action: 'checklist', 
    icon: '☐', 
    title: 'Checklist', 
    label: 'Tasks',
    shortcut: 'Ctrl+Shift+9'
  },
  { 
    action: 'checkdone', 
    icon: '☑', 
    title: 'Checklist Done', 
    label: 'Tasks',
    shortcut: 'Ctrl+Shift+9'
  },
  { 
    action: 'arrow', 
    icon: '➤', 
    title: 'Arrow', 
    label: 'Tasks',
    shortcut: 'Ctrl+Shift+9'
  },
  { action: 'separator' },
  { 
    action: 'quote', 
    icon: '❝', 
    title: 'Quote', 
    label: 'Quote',
    shortcut: 'Ctrl+Shift+.'
  },
  { 
    action: 'code', 
    icon: '</>', 
    title: 'Code Block', 
    label: 'Code',
    shortcut: 'Ctrl+`'
  },
  { 
    action: 'codeinline', 
    icon: '{ }', 
    title: 'Inline Code Block', 
    label: 'CodeInline',
    shortcut: 'Ctrl+`'
  },
  { 
    action: 'link', 
    icon: '🔗', 
    title: 'Insert Link', 
    label: 'Link',
    shortcut: 'Ctrl+K'
  },
  { 
    action: 'image', 
    icon: '🖼️', 
    title: 'Insert Image', 
    label: 'Image',
    shortcut: 'Ctrl+Shift+I'
  },
  { action: 'separator' },
  { 
    action: 'table', 
    icon: '▦', 
    title: 'Insert Table', 
    label: 'Table'
  },
  { 
    action: 'hr', 
    icon: '—', 
    title: 'Horizontal Line', 
    label: 'Divider'
  },
];

// Color options for notes
export const COLOR_OPTIONS = [
  '',
  '#ffeb3b',
  '#ff9800',
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#00bcd4',
  '#4caf50',
  '#8bc34a',
  '#795548',
  '#607d8b'
];

// Demo note content
export const DEMO_NOTE_CONTENT = `# 📝 Welcome to Notes - Feature Demo

This demo note showcases all the formatting features available in the Notes app.

---

## 📋 Text Formatting

You can make text **bold**, *italic*, __underlined__, or ~~strikethrough~~.

Combine them for ***bold and italic*** text!

---

## 📑 Headings

# Heading 1 - Main Title
## Heading 2 - Section Title  
### Heading 3 - Subsection
#### Heading 4 - Small Heading

---

## 📝 Lists

### Bullet Points:
• First item
• Second item
  • Nested item
  • Another nested item
• Third item

### Numbered List:
1. First step
2. Second step
   a. Sub-step A
   b. Sub-step B
3. Third step

### Checklist:
☑ Completed task
☐ Pending task
☐ Another task to do
☑ Done with this one

---

## 💬 Quotes & Callouts

> "This is a blockquote. Use it for important quotes or highlighting key information."
> — Author Name

> 💡 **Pro Tip:** You can use quotes to highlight tips and important notes!

> ⚠️ **Warning:** This is a warning callout.

> ✅ **Success:** Operation completed successfully!

---

## 💻 Code Blocks

Inline code: \`const greeting = "Hello World";\`

Code block:
\`\`\`javascript
function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);
console.log(result); // Output: 8
\`\`\`

---

## 🔗 Links & References

[Click here to visit Google](https://google.com)

Reference link: See [Documentation][1] for more info.

[1]: https://docs.example.com

---

## 📊 Tables

| Feature     | Status    | Priority |
|-------------|-----------|----------|
| Rich Text   | ✅ Done   | High     |
| Lists       | ✅ Done   | High     |
| Tables      | ✅ Done   | Medium   |
| Images      | 🔄 WIP    | Low      |

---

## 🖼️ Images

![Placeholder Image](https://via.placeholder.com/400x200?text=Sample+Image)

---

## ✨ Special Formatting

### Highlight:
==This text is highlighted==

### Keyboard Keys:
Press \`Ctrl\` + \`S\` to save
Press \`Ctrl\` + \`Shift\` + \`P\` to print

---

## 📐 Horizontal Rules

Use three dashes or underscores:

---

___

***

---

## 🎨 Color Indicators

🔴 Red - Error/Danger
🟠 Orange - Warning  
🟡 Yellow - Caution
🟢 Green - Success
🔵 Blue - Information
🟣 Purple - Special

---

## ✏️ Quick Notes

- Use \`#tags\` to categorize notes
- Press \`Ctrl+S\` to save
- Use \`Ctrl+F\` to search
- Pin important notes with 📌

---

## 📅 Date & Time Stamps

Created: 2024-01-15 10:30 AM
Modified: 2024-01-15 02:45 PM
Due: 2024-01-20

---

**End of Demo Note** 🎉

Feel free to edit this note or create new ones!`;

// Initial form data state
export const INITIAL_FORM_DATA = {
  noteNumber: '',
  category: 'personal',
  title: '',
  content: '',
  summary: '',
  status: 'active',
  priority: 'medium',
  tags: '',
  color: '',
  isPinned: false,
  isFavorite: false,
  isLocked: false,
  password: '',
  reminder: '',
  dueDate: '',
  attachments: [],
  linkedNotes: [],
  wordCount: 0,
  charCount: 0,
  createdBy: ''
};