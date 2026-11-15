import { Marked } from 'marked';

const safeHref = (href) => (/^(https?:|mailto:|tel:|\/|#)/i.test(href || '') ? href : '#');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const marked = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    // Raw HTML typed into the editor is shown as text, never executed.
    html({ text }) {
      return esc(text);
    },
    link({ href, tokens }) {
      const url = safeHref(href);
      const external = /^https?:/i.test(url);
      return `<a href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${this.parser.parseInline(tokens)}</a>`;
    },
    image({ href, text }) {
      return `<img src="${esc(safeHref(href))}" alt="${esc(text || '')}" loading="lazy">`;
    },
  },
});

export const renderMarkdown = (src) => marked.parse(src || '');
