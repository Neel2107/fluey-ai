export const MARKDOWN_EXAMPLES = [
    {
        title: "Basic Text Formatting",
        content: `# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text* and ***bold italic text***

~~Strikethrough text~~

> Blockquote: This is a blockquote that can span multiple lines and show quoted text.
`
    },
    {
        title: "Lists and Code",
        content: `### Lists
- Unordered list item 1
- Unordered list item 2
  - Nested item
  - Another nested item

1. Ordered list item 1
2. Ordered list item 2
   1. Nested ordered item
   2. Another nested ordered item

### Code Examples
Inline code: \`console.log("Hello World")\`

\`\`\`javascript
// Code block with syntax highlighting
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`
`
    },
    {
        title: "Math Expressions",
        content: `### Inline Math
The famous equation $E = mc^2$ was proposed by Einstein.

### Block Math
The quadratic formula:
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Matrix multiplication:
$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
\\begin{bmatrix}
x \\\\
y
\\end{bmatrix} =
\\begin{bmatrix}
ax + by \\\\
cx + dy
\\end{bmatrix}
$$
`
    },
    {
        title: "Links and Images",
        content: `### Links
[Regular link](https://example.com)
[Link with title](https://example.com "Example Website")

### Images
![Alt text](https://example.com/image.jpg "Image title")

### Reference-style links
[Reference link][1]

[1]: https://example.com "Example Website"
`
    },
    {
        title: "Tables and Horizontal Rules",
        content: `### Tables
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Horizontal Rules
---
***
___
`
    },
    {
        title: "Task Lists and Footnotes",
        content: `### Task Lists
- [ ] Uncompleted task
- [x] Completed task
- [ ] Another task

### Footnotes
Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.
`
    }
]; 