"""Check the built homepage against docs/LIVE-FINGERPRINT.md."""
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Homepage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.theme_colors = []
        self.inline_styles = 0
        self.stylesheets = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'meta' and attrs.get('name') == 'theme-color':
            self.theme_colors.append(attrs.get('content'))
        if tag == 'style':
            self.inline_styles += 1
        if tag == 'link' and 'stylesheet' in attrs.get('rel', '').split():
            self.stylesheets.append(urlsplit(attrs['href']))


def main():
    checklist = (ROOT / 'docs/LIVE-FINGERPRINT.md').read_text(encoding='utf-8')
    expected = dict(re.findall(r'^- (Theme color|Stylesheet setup|Forbidden stylesheet): `([^`]+)`$', checklist, re.M))
    page = Homepage()
    page.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
    if page.theme_colors != [expected['Theme color']]:
        raise SystemExit(f'Theme color differs: {page.theme_colors}')
    local = [url.path for url in page.stylesheets if not url.scheme and not url.netloc]
    if expected['Stylesheet setup'] != 'inline-and-linked' or not page.inline_styles or not local:
        raise SystemExit('Expected inline styles and linked local stylesheets.')
    if any(Path(url.path).name == expected['Forbidden stylesheet'] for url in page.stylesheets):
        raise SystemExit('The homepage loads a forbidden stylesheet bundle.')
    print('Live fingerprint passed: theme color, inline CSS, and linked stylesheets.')


if __name__ == '__main__':
    main()
