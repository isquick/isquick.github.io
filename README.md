# isquick.github.io

David Isquick's website — www.davidisquick.com

The home page is a chat-style personal agent. Visitors ask questions (or tap
suggestions) and get answers from David's own content.

## How it works

- `index.html` holds everything the agent knows. Each `<section class="kb">`
  is one answer. Without JavaScript (and for search engines and AI crawlers)
  these sections render as a normal, readable page.
- `agent.js` turns those sections into a chat. It routes a question to the
  best-matching section using each section's `data-keys`. There is no server
  and no AI model, so it never makes anything up.
- `agent.css` styles both the chat and the plain page (light and dark mode).

### Adding or changing an answer

Edit or add a `<section class="kb">` in `index.html`:

| Attribute    | What it does                                                     |
|--------------|------------------------------------------------------------------|
| `id`         | Topic id. Also a shareable link: `davidisquick.com/#muttgrams`   |
| `data-ask`   | The question shown on suggestion chips                           |
| `data-label` | Name in the Topics menu                                          |
| `data-group` | Heading it sits under in the Topics menu                         |
| `data-keys`  | Comma-separated words/phrases that route here (first counts double) |
| `data-next`  | Follow-up topic ids suggested after this answer                  |

Links to `#topic-id` inside an answer become follow-up questions in the chat.
Keep `llms.txt` in sync when content changes.

### Links

- `/#topic` opens the chat on that topic, e.g. `/#resume`
- `/?ask=your+question` opens the chat and asks it
- `/portfolio.html` redirects to `/#portfolio`

## Discoverability

- Schema.org `ProfilePage`/`Person`, `WebSite` (with search action), and
  `MobileApplication` (Muttgrams) structured data in `index.html`
- `sitemap.xml`, `robots.txt`, and `llms.txt` (a summary for AI assistants)

## The retro desktop

The previous Windows 95-style site lives on at `retro.html` and
`retro-portfolio.html` (`desktop.js`, `retro.css`), linked from the agent
("Can I see the old site?"). They're marked `noindex` so they don't compete
with the home page.
