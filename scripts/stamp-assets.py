"""Replace fixed ?v= tokens on local CSS and JavaScript with content hashes."""
import argparse
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Also cover the quote-escaped URLs used by the desktop document.write scripts.
VERSIONED_ASSET = re.compile(
    r'(?<=["\'])(?P<path>(?:[\w.-]+/)*[\w.-]+\.(?:css|js))\?v=(?P<version>[\w.-]+)'
)
PAGES = [ROOT / 'index.html', *sorted((ROOT / 'presentations').glob('*.html'))]


def update_page(page):
    html = page.read_text(encoding='utf-8')

    def stamp(match):
        path = (page.parent / match['path']).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            raise ValueError(f'{page.relative_to(ROOT)} references missing local asset {match["path"]}')
        version = hashlib.sha256(path.read_bytes()).hexdigest()[:16]
        return f'{match["path"]}?v={version}'

    return html, VERSIONED_ASSET.sub(stamp, html)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if a token is stale.')
    args = parser.parse_args()
    changed = []
    for page in PAGES:
        html, stamped = update_page(page)
        if html != stamped:
            changed.append(str(page.relative_to(ROOT)))
            if not args.check:
                page.write_text(stamped, encoding='utf-8')
    if args.check and changed:
        parser.exit(1, 'Stale asset versions: ' + ', '.join(changed) + '\n')
    print('Asset versions current.')


if __name__ == '__main__':
    main()
