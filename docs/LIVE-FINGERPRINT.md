# Live portfolio fingerprint

Baseline captured November 18, 2026 from the public portfolio homepage.
Vercel deployment `dpl_2cqWrqJxv2WqJsrstKYgujtYHaxe`, source commit
`e15dd337ea9bd11fcbeca4e507c44e5ae04dc20d` on `feat/hero-role-switcher`.

- [ ] The HTML theme color is `#070911`.
- [ ] The three hero pills read **Software Engineer**, **Quants**, and **Strategy & Product**, in that order. The requested copy update changes only the middle pill name to **Data & Markets** and the corresponding panel text.
- [ ] The page uses inline CSS and individual stylesheet links. It does not request `portfolio.css`.
- [ ] On desktop, `#home` has a transparent background color and a dark violet background image. Its base is a 122-degree linear gradient with stops `#100b20`, `#171027` (68%), and `#0c0b1a`. A violet radial gradient at 73% 44% overlays it. The hero's `.mk-unified-gradient` adds a left-to-right `#0e0b1c` fade.
- [ ] On desktop, `#contact` has a transparent background color and a pale rose background image. Its base is a 140-degree linear gradient from `#fff9fa` to `#f9ebf0`. It has rose and peach radial highlights and a lavender `::before` overlay. The Contact header underline fades from `#be9cda` through `#e8d8f5`.
- [ ] Compare the known-good deployment and the candidate at desktop and at 375px in the same browser mode. The desktop values above were measured from computed styles. The 375px comparison remains to be recorded before promotion.

## Build requirements checked by CI

- Theme color: `#070911`
- Stylesheet setup: `inline-and-linked`
- Forbidden stylesheet: `portfolio.css`
