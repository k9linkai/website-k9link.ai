# K9Link AI Website

A Hugo-based single-page landing site for K9Link AI — an AI-powered smart dog collar. Built with TailwindCSS v4, dark theme, and a modular blocks system for flexible page composition.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
hugo server

# Start with drafts enabled
hugo server -D

# Build for production
hugo
```

The site will be available at `http://localhost:1313/`

**Note:** When adding new TailwindCSS classes, you may need to restart the server for them to take effect. Use `hugo server -D --disableFastRender` for automatic CSS rebuilds.

## Project Structure

```
.
├── assets/
│   ├── css/
│   │   └── main.css              # TailwindCSS v4 configuration & custom styles
│   └── icons/                    # Local SVG icons (Font Awesome)
│       ├── solid/               # Solid style icons
│       ├── regular/             # Regular style icons
│       └── brands/              # Brand icons
├── content/                      # Page content (Markdown files)
│   ├── _index.md                # Homepage (single-page landing)
│   ├── privacy.md               # Privacy policy
│   └── terms.md                 # Terms & conditions
├── layouts/
│   ├── _partials/
│   │   ├── blocks/              # Block partials
│   │   │   ├── blocks.html      # Block renderer
│   │   │   └── meta/            # Block helper functions
│   │   ├── components/          # Reusable components
│   │   ├── head.html            # Conditional CSS/JS includes
│   │   ├── header.html          # Site header/navigation
│   │   └── footer.html          # Site footer
│   └── baseof.html              # Base template
├── static/
│   ├── fonts/                   # Self-hosted web fonts (Inter variable)
│   ├── js/                      # Site JavaScript
│   │   └── vendor/              # Third-party JS bundles (e.g. Swiper effects)
│   └── video/                   # MP4 assets served from /video/*
└── hugo.toml                    # Hugo configuration
```

---

## TailwindCSS v4

This project uses **TailwindCSS v4**, which has a simplified configuration approach compared to v3.

### Configuration

TailwindCSS v4 configuration lives in `assets/css/main.css`:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  /* K9Link Dark Theme */
  --color-k9-black: #0a0a0a;
  --color-k9-card: #111111;
  --color-k9-elevated: #161616;
  --color-k9-border: #222222;
  --color-k9-muted: #888888;
  --color-k9-text: #e5e5e5;
  --color-k9-accent: #6366f1;
  --color-k9-accent-light: #818cf8;
  --color-k9-green: #22c55e;

  /* Custom Font */
  --font-heading: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

### Using Custom Colors

Custom colors are available as utility classes:

```html
<div class="bg-k9-card border border-k9-border">Dark card</div>
<div class="text-k9-accent">Indigo accent text</div>
<div class="text-k9-muted">Muted gray text</div>
<div class="text-k9-green">Health green text</div>
```

**Available colors:**
- `k9-black`, `k9-card`, `k9-elevated`, `k9-border` — background tones
- `k9-text`, `k9-muted` — text tones
- `k9-accent`, `k9-accent-light` — indigo accent
- `k9-green` — health/success green

### Custom CSS Classes

| Class | Description |
|-------|-------------|
| `hero-gradient` | Radial indigo glow on black background |
| `hero-pattern` | Subtle grid line overlay |
| `video-hero-stack` | Full-screen Swiper container for the homepage video hero |
| `gradient-text` | Gradient text effect (white → indigo) |
| `card-dark` | Dark card with border and hover glow |
| `card-glass` | Frosted overlay card used on video hero slides |
| `glow-accent` | Indigo glow box-shadow |
| `collar-glow` | Pulsing glow animation for the collar illustration |
| `float-animation` | Gentle floating animation |

The Swiper Expo effect CSS is bundled into `assets/css/main.css`. There is no separate source stylesheet in `static/css/` for that effect anymore.

### Using Custom Fonts

```html
<h1 class="font-heading">Inter heading</h1>
<p class="font-body">Inter body text</p>
```

**Note:** Headings (`h1`-`h6`) automatically use `font-heading` and body text uses `font-body` via base styles.

---

## Blocks System

Pages are built using a modular **blocks system**. Each page defines an array of blocks in its front matter, and Hugo renders them in order.

### How Blocks Work

1. The `layouts/_partials/blocks/blocks.html` partial iterates through the `blocks` array in front matter
2. For each block, it loads the corresponding partial from `layouts/_partials/blocks/`
3. Block data is passed via `dict "Root" $root "Params" $blockParams`

```html
{{/* layouts/_partials/blocks/blocks.html */}}
{{- range .Params.blocks -}}
  {{- $blockName := .block -}}
  {{- $partialPath := printf "blocks/%s" $blockName -}}
  {{- partial $partialPath (dict "Root" $root "Params" .) -}}
{{- end -}}
```

### Creating a Page with Blocks

```yaml
---
title: "Page Title"

blocks:
  - block: hero
    badge: "Coming Soon"
    heading: "Product Name"
    subheading: "Product description"
    cta_text: "Join Waitlist"
    cta_url: "#preorder"

  - block: services
    heading: "Features"
    background: dark
    services:
      - title: "Feature 1"
        icon: "video"
        description: "Description here"
        features:
          - "Sub-feature A"
          - "Sub-feature B"

  - block: cta
    heading: "Get Started"
    description: "Sign up for updates."
---
```

### Available Blocks

| Block | Description | Key Parameters |
|-------|-------------|----------------|
| `hero` | Full-screen hero with radial glow background | `heading`, `subheading`, `badge`, `cta_text`, `cta_url`, `cta_secondary_text`, `cta_secondary_url` |
| `video-hero` | Full-screen video slider using Swiper + Expo effect | `videos[]` with `src`, `heading`, `subheading`, `badge`, `cta_*` |
| `services` | Feature cards grid with icons | `heading`, `subheading`, `id`, `services[]` |
| `product-visual` | Split layout with CSS collar illustration | `heading`, `description`, `features[]` |
| `list` | Bulleted list with icons | `heading`, `id`, `items[]`, `cta_text`, `cta_url` |
| `specs` | Technical specifications grid | `heading`, `subheading`, `id`, `specs[]` |
| `testimonials` | Testimonials carousel | `heading`, `subheading`, `testimonials[]` |
| `cta` | Waitlist/signup call-to-action | `heading`, `description`, `id`, `button_text`, `note` |
| `heading` | Page header with gradient background | `heading`, `subheading` |
| `text` | Text content section | `heading`, `copy`, `background` |
| `text-image` | Text with side image | `heading`, `copy`, `image`, `image_position` |

### Background Colors

All blocks support a `background` parameter. All options use dark backgrounds with white text:

| Value | Background |
|-------|------------|
| `white` | `#0a0a0a` (base black) |
| `light` | `#111111` (card) |
| `lighter` | `#161616` (elevated) |
| `dark` | `#0a0a0a` (base black) |
| `gradient` | Radial indigo glow |

---

## Creating a New Block

1. Create a new file in `layouts/_partials/blocks/`:

```html
{{/* layouts/_partials/blocks/my-block.html */}}

{{/* Get background utilities */}}
{{ $background := partial "blocks/meta/background" .Params.background }}
{{ $background = $background | default "bg-[#0a0a0a] text-white" }}

<section class="{{ $background }} py-16 md:py-20 lg:py-24">
  <div class="container">
    {{ with .Params.heading }}
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 text-white fade-in">
        {{ . }}
      </h2>
    {{ end }}

    {{ with .Params.content }}
      <div class="prose prose-lg prose-invert mx-auto">
        {{ . | markdownify }}
      </div>
    {{ end }}

    {{/* Access page-level data via .Root */}}
    {{/* Example: .Root.Title, .Root.Site.Params.*, etc. */}}
  </div>
</section>
```

2. Use it in your content:

```yaml
blocks:
  - block: my-block
    background: light
    heading: "My Custom Block"
    content: |-
      Some **markdown** content here.
```

### Block Context

Inside a block partial, you have access to:

- `.Params.*` - Block parameters from front matter
- `.Root` - The page context (access `.Root.Title`, `.Root.Params`, etc.)
- `.Root.Site.Params.*` - Site-wide parameters from `hugo.toml`

---

## Icons

The site uses **local SVG icons** from Font Awesome, stored in `assets/icons/`.

### Using Icons

```html
{{ partial "components/icon.html" (dict "name" "heart-pulse" "class" "w-12 h-12 text-k9-green") }}
```

### Icon Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `name` | (required) | Icon name without `fa-` prefix |
| `class` | `w-6 h-6` | Tailwind classes for sizing/color |
| `type` | `solid` | Icon style: `solid`, `regular`, or `brands` |

### Examples

```html
{{/* Solid icon (default) */}}
{{ partial "components/icon.html" (dict "name" "check" "class" "w-4 h-4 text-k9-green") }}

{{/* Accent colored icon */}}
{{ partial "components/icon.html" (dict "name" "brain" "class" "w-6 h-6 text-k9-accent-light") }}

{{/* Brand icon */}}
{{ partial "components/icon.html" (dict "name" "linkedin" "class" "w-8 h-8" "type" "brands") }}
```

### In Block Front Matter

```yaml
services:
  - title: "Health Monitoring"
    icon: "heart-pulse"
    description: "Description here"
```

### Adding New Icons

1. Download SVG from [Font Awesome](https://fontawesome.com/icons)
2. Place in appropriate folder: `assets/icons/solid/`, `assets/icons/regular/`, or `assets/icons/brands/`
3. Name file to match icon name (e.g., `heart-pulse.svg`)

---

## Adding Content

### Video Hero Media

The homepage currently uses the `video-hero` block defined in `content/_index.md`.

- Video files should live in `static/video/`.
- Reference them in front matter with site-root paths like `/video/cafe.mp4`.
- Supporting slider styles live in `assets/css/main.css`.
- The Expo effect JavaScript bundle lives at `static/js/vendor/effect-expo.min.js`.

Do not keep source video assets at the repository root. Hugo will not publish those files as part of the normal site build.

### Homepage Sections

The homepage (`content/_index.md`) is a single-page layout with these sections:

1. **Video Hero** — full-screen Swiper/Expo slider with MP4 files from `static/video/`
2. **Features** — 6 feature cards (services block)
3. **Product Visual** — collar description + CSS illustration
4. **How It Works** — 3-step list
5. **Specs** — 8-item technical specifications grid
6. **Testimonials** — 5 beta tester reviews (carousel)
7. **CTA** — waitlist email signup

### Adding a New Page

1. Create a new `.md` file in `content/`
2. Add front matter with blocks or markdown content:

```yaml
---
title: "New Page"
description: "Page description for SEO"

blocks:
  - block: heading
    heading: "Page Title"
    subheading: "Optional subtitle"

  - block: text
    background: light
    heading: "Section Title"
    copy: |-
      Your **markdown** content here.
---
```

Pages without blocks will render markdown content with the dark prose theme.

---

## Block Examples

### Video Hero Block

```yaml
- block: video-hero
  videos:
    - src: "/video/1.mp4"
      badge: "Coming Soon — Join the Waitlist"
      heading: "A Smartphone for Your Dog"
      subheading: "The world's first AI-powered smart collar."
      cta_text: "Join the Waitlist"
      cta_url: "#preorder"
    - src: "/video/cafe.mp4"
      heading: "Smart Obedience in Cafe"
      subheading: "Behavior guidance in real-world situations."
```

### Hero Block

```yaml
- block: hero
  badge: "Coming Soon — Join the Waitlist"
  heading: "A Smartphone for Your Dog"
  subheading: "AI-powered smart collar description"
  cta_text: "Join the Waitlist"
  cta_url: "#preorder"
  cta_secondary_text: "See Features"
  cta_secondary_url: "#features"
```

### Services Block

```yaml
- block: services
  id: features
  heading: "Everything Your Dog Needs"
  subheading: "Six integrated systems"
  background: dark
  services:
    - title: "360° Vision"
      icon: "video"
      description: "Two wide-angle cameras"
      features:
        - "Live HD streaming"
        - "AI-powered activity recognition"
    - title: "Health Monitoring"
      icon: "heart-pulse"
      description: "Continuous biometric tracking"
      features:
        - "Heart rate monitoring"
        - "Temperature tracking"
```

### Specs Block

```yaml
- block: specs
  id: specs
  heading: "Technical Specifications"
  subheading: "Built with precision"
  background: light
  specs:
    - icon: "microchip"
      label: "Processor"
      value: "Quad-core AI SoC"
    - icon: "battery-full"
      label: "Battery"
      value: "5-day life"
```

### CTA Block

```yaml
- block: cta
  id: preorder
  heading: "Be First in Line"
  description: "Join the waitlist for early access."
  button_text: "Join Waitlist"
  note: "No spam, ever."
```

### Testimonials Block

```yaml
- block: testimonials
  heading: "What Beta Testers Are Saying"
  subheading: "Early access feedback"
  background: dark
  testimonials:
    - name: "Sarah M."
      title: "Dog Trainer"
      company: "Portland, OR"
      quote: "The behavior recognition is shockingly accurate."
      stars: 5
```

### List Block

```yaml
- block: list
  id: how-it-works
  background: dark
  heading: "Up and Running in Minutes"
  items:
    - icon: "box-open"
      text: |
        **1. Unbox & Attach.** Snap the module onto the collar band.
    - icon: "mobile-screen"
      text: |
        **2. Connect the App.** Pair via Bluetooth and set up your dog's profile.
```

---

## Animations

The site uses progressive-enhancement fade-in animations:

- Content is visible by default (so strict CSP or blocked JS never makes sections "disappear").
- `static/js/site.js` uses `IntersectionObserver` (when available) to set `data-reveal="pending|visible"` on elements with animation classes.

### Animation Classes

Add these classes to elements for scroll-triggered animations:

| Class | Effect |
|-------|--------|
| `fade-in` | Fade in and slide up slightly |
| `seq` | Sequential fade-in for lists |

### Usage

```html
<h2 class="fade-in">This will animate when scrolled into view</h2>

<div class="grid">
  {{ range .items }}
    <div class="seq">Each item animates sequentially</div>
  {{ end }}
</div>
```

---

## Configuration

### Hugo Configuration (`hugo.toml`)

Key configuration options:

```toml
baseURL = 'https://k9link.ai/'
languageCode = 'en-us'
title = 'K9Link AI'

[params]
description = "K9Link AI - The world's first AI-powered smart dog collar."
company_name = "K9Link AI"
email = "hello@k9link.ai"

[markup.goldmark.renderer]
unsafe = true  # Allow raw HTML in markdown
```

### Menu Configuration

Menus are configured in `hugo.toml`. There are two menus:

- **`main`** - Header navigation (anchor links to homepage sections)
- **`footer`** - Footer navigation links

#### pageRef vs url

Use `pageRef` for internal pages and `url` for anchor links:

- **`pageRef`** - Links to pages, enables Hugo's `.IsActive` for showing the active state on the current page
- **`url`** - Links to anchor sections (e.g., `/#features`), active state handled by JavaScript scroll spy

```toml
# Main menu (anchor links to single-page sections)
[[menus.main]]
name = "Features"
url = "/#features"
weight = 1

[[menus.main]]
name = "How It Works"
url = "/#how-it-works"
weight = 2

[[menus.main]]
name = "Specs"
url = "/#specs"
weight = 3

[[menus.main]]
name = "Pre-Order"
url = "/#preorder"
weight = 4

# Footer menu
[[menus.footer]]
name = "Home"
pageRef = "/"
weight = 1

[[menus.footer]]
name = "Privacy Policy"
pageRef = "/privacy"
weight = 2
```

#### Active Menu States

The header navigation shows an underline on the active menu item:

- **Page links** (using `pageRef`): Hugo automatically detects the current page and adds the `active` class
- **Anchor links** (using `url`): JavaScript scroll spy adds the `active` class when the corresponding section is in view

---

## Tips & Troubleshooting

### Escaping Quotes in YAML

Use single quotes and escape inner single quotes with `''`:

```yaml
items:
  - 'My dog doesn''t even notice it.'
```

### Multi-line Content

Use `|-` for multi-line strings (preserves newlines, strips trailing whitespace):

```yaml
copy: |-
  First paragraph.

  Second paragraph with **markdown**.

  - List item 1
  - List item 2
```

### Debugging Blocks

If a block doesn't render, check:

1. Block name matches a file in `layouts/_partials/blocks/`
2. YAML syntax is valid (check indentation)
3. Hugo console for warnings: `warnf "Partial not found for block type: %s"`

### CSS Not Updating

If new Tailwind classes don't appear:

1. Restart Hugo server with `--disableFastRender`
2. Or use: `hugo server -D --disableFastRender --noHTTPCache`

### Anchor Links Not Scrolling Correctly

The site uses `scroll-padding-top` to account for the fixed navbar. If issues persist, check:

1. The `--navbar-height` CSS variable is set correctly
2. Target elements have valid `id` attributes

---

## Deployment

### Netlify

Primary deployment config is in `netlify.toml`.

- **Build command:** `hugo`
- **Publish directory:** `public`
- **Environment variable:** `HUGO_VERSION = 0.160.1`

### Cloudflare Workers (Wrangler)

An alternate deployment path is configured in `wrangler.jsonc`.

- **Build command:** `hugo build --gc --minify`
- **Assets directory:** `public/`

### Manual Deployment

1. Build the site: `hugo build --gc --minify --cleanDestinationDir`
2. Deploy the `public/` directory to your web server

`--cleanDestinationDir` is recommended when publishing from `public/` so removed static files do not linger in old build output.

---

## SEO

### robots.txt

`robots.txt` is generated by Hugo (`enableRobotsTXT = true`)

---

## Fonts

The site uses a single self-hosted variable font for performance:

- **Inter** — Headings and body text (variable weight: 100–900)

The font file is located at `static/fonts/inter-latin-variable.woff2` and loaded via `@font-face` in `main.css`.

---

## Components

Reusable components in `layouts/_partials/components/`:

| Component | Description |
|-----------|-------------|
| `icon.html` | SVG icon loader |
| `image-responsive.html` | Responsive image with srcset |
