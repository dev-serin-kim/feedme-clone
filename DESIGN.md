# Design

Where design work starts. Decision contracts in `docs/decisions/` own every
rule; this file holds values and points at the contract that owns each element.

## Values

Source: `app/globals.css`. Update this section when that source changes.

| Token | Light | Dark |
| --- | --- | --- |
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |

Text roles: `--font-sans` (Inter) for body and headings, `--font-mono` (Geist Mono) for code.
Radius and spacing: `--radius` `0.625rem`; spacing follows the Tailwind scale.

## Components

Source: `components/ui/`. Update this section when it changes.

- `Button`

## Rejected patterns

- Hand-written markup for UI that shadcn already provides → [ui-composition](docs/decisions/ui-composition.md)
- Per-screen arbitrary colors instead of semantic tokens → [ui-composition](docs/decisions/ui-composition.md)
- "Cleaning up" the tacky decorations into a minimal style → [visual-direction](docs/decisions/visual-direction.md)
- Bonobono character images or original artwork → [visual-direction](docs/decisions/visual-direction.md)

## Map

- Component choice and page composition → [ui-composition](docs/decisions/ui-composition.md)
- Page shell, content width, and narrow-screen stacking → [ui-composition](docs/decisions/ui-composition.md)
- Loading, empty, error, success, and disabled states → [ui-composition](docs/decisions/ui-composition.md)
- Color palette and page background → [visual-direction](docs/decisions/visual-direction.md)
- Heading, body, and brand typography → [visual-direction](docs/decisions/visual-direction.md)
- Button, chip, card, and bar decoration → [visual-direction](docs/decisions/visual-direction.md)
- Dark-mode palette → [visual-direction](docs/decisions/visual-direction.md)
