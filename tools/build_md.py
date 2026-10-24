#!/usr/bin/env python3
"""Build Markdown copies of the site's content from index.html.

Every <section class="kb"> in index.html becomes md/<id>.md, and the whole
site becomes index.md. Run this after editing index.html:

    python3 tools/build_md.py

Standard library only. The converter only handles the markup used in the
knowledge-base sections (headings, paragraphs, lists, links, emphasis).
"""
import html
import os
import re
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://www.davidisquick.com"
NOTICE = "<!-- Generated from index.html by tools/build_md.py. Edit index.html, then rerun the script. -->"


class Section:
    def __init__(self, attrs):
        self.id = attrs.get("id")
        self.label = html.unescape(attrs.get("data-label", ""))
        self.ask = html.unescape(attrs.get("data-ask", ""))
        self.group = attrs.get("data-group", "")
        self.blocks = []  # list of Markdown blocks


class KBParser(HTMLParser):
    """Collects each .kb section and converts its contents to Markdown."""

    BLOCKS = {"h2", "h3", "p", "li"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections = []
        self.hero = None
        self.cur = None       # current Section
        self.depth = 0        # element depth inside the current section
        self.buf = None       # text of the block being built
        self.block = None     # tag of the block being built
        self.links = []       # stack of open <a> hrefs
        self.classes = []     # stack of class lists for open elements
        self.in_hero = False
        self.hero_buf = []

    # -- helpers --
    def _cls(self, attrs):
        return (attrs.get("class") or "").split()

    def _start_block(self, tag):
        self.block, self.buf = tag, []

    def _end_block(self):
        text = re.sub(r"[ \t\r\n]+", " ", "".join(self.buf)).strip()
        tag, self.block, self.buf = self.block, None, None
        if not text:
            return
        if tag == "h2":
            self.cur.blocks.append("## " + text)
        elif tag == "h3":
            self.cur.blocks.append("### " + text)
        elif tag == "li":
            # consecutive list items join into one block
            if self.cur.blocks and self.cur.blocks[-1].startswith("- ") and self.cur.blocks[-1].endswith("\x00"):
                self.cur.blocks[-1] += "\n- " + text + "\x00"
                self.cur.blocks[-1] = self.cur.blocks[-1].replace("\x00\n", "\n")
            else:
                self.cur.blocks.append("- " + text + "\x00")
        else:
            self.cur.blocks.append(text)

    def _href(self, href):
        if href.startswith("#") and len(href) > 1:
            return href[1:] + ".md"          # link to the sibling Markdown topic
        if href.startswith("/"):
            return SITE + href
        if re.match(r"^[a-z]+:", href):
            return href
        return SITE + "/" + href

    # -- parser hooks --
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        cls = self._cls(attrs)
        if tag == "header" and "kb-hero" in cls:
            self.in_hero = True
        if self.cur is None:
            if tag == "section" and "kb" in cls:
                self.cur, self.depth = Section(attrs), 0
                self.classes = []
            elif self.in_hero and tag == "p":
                self.hero_buf = []
            return

        if tag not in ("img", "br", "hr", "input", "meta", "link"):  # void tags never close
            self.depth += 1
            self.classes.append(cls)
        if tag in self.BLOCKS and self.block is None:
            self._start_block(tag)
            if tag == "p" and ("kicker" in cls or "meta" in cls):
                self.buf.append("_")
            if tag == "p" and "tags" in cls:
                self.buf.append("Tags: ")
        elif self.buf is not None:
            if tag == "a":
                self.links.append(self._href(attrs.get("href", "")))
                self.buf.append("[")
            elif tag in ("strong", "b"):
                self.buf.append("**")
            elif tag == "span" and "meta" in cls:
                self.buf.append(" — _")
            elif tag == "span" and "tag" in cls:
                pass
            elif tag == "span" and self.block == "li":
                self.buf.append(" — ")
            elif tag == "img" and attrs.get("src"):
                self.buf.append("![%s](%s)" % (attrs.get("alt", ""), self._href(attrs["src"])))

    def handle_endtag(self, tag):
        if self.in_hero and tag == "header":
            self.in_hero = False
        if self.cur is None:
            return
        if tag == "section" and self.depth == 0:
            self.cur.blocks = [b.rstrip("\x00") for b in self.cur.blocks]
            self.sections.append(self.cur)
            self.cur = None
            return
        cls = self.classes.pop() if self.classes else []
        self.depth -= 1
        if self.buf is not None:
            if tag == "a" and self.links:
                self.buf.append("](%s)" % self.links.pop())
            elif tag in ("strong", "b"):
                self.buf.append("**")
            elif tag == "span" and "meta" in cls:
                self.buf.append("_")
            elif tag == "span" and "tag" in cls:
                self.buf.append(", ")
            elif tag == "p" and ("kicker" in cls or "meta" in cls):
                self.buf.append("_")
        if tag == self.block:
            if self.block == "p" and "tags" in cls and self.buf and self.buf[-1] == ", ":
                self.buf.pop()
            self._end_block()

    def handle_data(self, data):
        if self.buf is not None:
            self.buf.append(data)
        elif self.in_hero and self.cur is None:
            self.hero_buf.append(data)


def tidy(text):
    text = re.sub(r"\*\*\s+", "** ", text)
    text = re.sub(r"\s+\*\*(?=[.,;: ])", "**", text)
    text = text.replace("_ — _", " — _")
    text = re.sub(r"\[\s+", "[", text)
    text = re.sub(r"\s+\]", "]", text)
    text = re.sub(r" +— _", " — _", text)
    text = re.sub(r"\) \[", ") · [", text)  # side-by-side buttons
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def front_matter(title, description, url):
    return "---\ntitle: %s\ndescription: %s\nurl: %s\n---\n" % (title, description, url)


def main():
    with open(os.path.join(ROOT, "index.html"), encoding="utf-8") as f:
        source = f.read()

    parser = KBParser()
    parser.feed(source)
    sections = parser.sections
    description = re.search(r'<meta name="description" content="([^"]+)"', source).group(1)
    description = html.unescape(description)

    out_dir = os.path.join(ROOT, "md")
    os.makedirs(out_dir, exist_ok=True)
    for name in os.listdir(out_dir):
        if name.endswith(".md"):
            os.remove(os.path.join(out_dir, name))

    # One file per topic
    for s in sections:
        body = "\n\n".join(s.blocks)
        doc = (front_matter(s.label, s.ask, "%s/#%s" % (SITE, s.id)) + NOTICE + "\n\n" + body + "\n\n"
               "---\n\n[All topics](../index.md) · [Chat with David's agent about this](%s/#%s)\n" % (SITE, s.id))
        with open(os.path.join(out_dir, s.id + ".md"), "w", encoding="utf-8") as f:
            f.write(tidy(doc))

    # Everything in one file
    parts = [front_matter("David Isquick", description, SITE + "/"), NOTICE, "",
             "# David Isquick", "",
             "Product marketing leader across AI, developer platforms, and enterprise SaaS. "
             "Principal Product Marketer at Mintlify and founder of Muttgrams.", "",
             "This is the Markdown version of " + SITE + "/, a chat-style personal agent. "
             "Each section below is one answer the agent gives.", "",
             "## Topics", ""]
    for s in sections:
        parts.append("- [%s](md/%s.md) — %s" % (s.label, s.id, s.ask))
    parts += ["", "## Documents", "",
              "- [Resume](resume.md)",
              "- [Stop Launching. Start Rolling Out.](md/samples/stop-launching-start-rolling-out.md) — Optimizely blog post",
              "- [Getting Started with Product Experimentation](md/samples/getting-started-with-product-experimentation.md) — Optimizely whitepaper",
              ""]
    for s in sections:
        blocks = [("#" + b) if b.startswith("#") else b for b in s.blocks]  # nest one level
        body = "\n\n".join(blocks).replace("](", "](").replace(".md)", ".md)")
        body = re.sub(r"\]\(([a-z0-9-]+)\.md\)", r"](md/\1.md)", body)
        parts += ["---", "", body, ""]
    with open(os.path.join(ROOT, "index.md"), "w", encoding="utf-8") as f:
        f.write(tidy("\n".join(parts)))

    print("Wrote index.md and %d files in md/" % len(sections))


if __name__ == "__main__":
    main()
