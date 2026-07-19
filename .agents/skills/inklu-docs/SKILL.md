---
name: inklu-docs
description: "Guidelines and patterns for using the @inklu/docs package to build Marketing and Documentation sites in Next.js"
---

# Inklu Docs Package Guidelines

`@inklu/docs` is a zero-dependency (from the consumer's perspective) abstraction package that encapsulates layouts, UI components, context providers, and syntax highlighting for building beautifully consistent marketing and documentation sites in Next.js.

When building a site with this package, **never** build custom layouts, theme switchers, or complex wrappers in the consuming application. The application should act strictly as a routing and data-fetching layer, delegating all UI rendering and component composition to the library.

## 0. Creating a New Project

To scaffold a new Next.js application pre-configured with `@inklu/docs`, use the initialization script:

```bash
curl -sSL https://inklu-docs.vercel.app/create-inklu-docs.sh | bash -s my-app
```

## 1. Root Layout & Context Providers (`app/layout.tsx`)

Every application using this library must wrap its `<body>` contents in the `<SiteProvider>` to automatically inject `next-themes`, directionality, and toast providers.
You must also add `suppressHydrationWarning` to the `<html>` tag to prevent Next.js from throwing warnings when `next-themes` mutates the document.

```tsx
import { SiteProvider } from "@inklu/docs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
```

## 2. Page Transitions (`app/template.tsx`)

To ensure a smooth, accessible fade-in animation across page navigations, use `<SiteTemplate>`. Do not implement Framer Motion directly in the app.

```tsx
import { SiteTemplate } from "@inklu/docs";

export default function Template({ children }: { children: React.ReactNode }) {
  return <SiteTemplate>{children}</SiteTemplate>;
}
```

## 3. Marketing Pages (`app/page.tsx`)

For landing pages and marketing content, compose the `<SiteLayout>` and `<SiteHeader>`.

```tsx
import { SiteLayout, SiteHeader } from "@inklu/docs";

export default function Home() {
  return (
    <SiteLayout
      header={<SiteHeader navItems={[{ label: "Docs", href: "/docs" }]} />}
      footer={<p>Your custom footer here.</p>}
    >
      {/* Your marketing content, hero sections, etc. */}
    </SiteLayout>
  );
}
```

## 4. Documentation Pages (`app/(docs)/layout.tsx` & `page.tsx`)

For nested documentation routes, use `<DocsLayout>` to render a sticky minimalist sidebar, scrollspy navigation, and the `<DocsNavbar>`.

**Docs Layout (`layout.tsx`)**
```tsx
import { DocsLayout, DocsNavbar, BrandLogo, ThemeSwitcher } from "@inklu/docs";

const LINKS = [
  {
    group: "Getting Started",
    items: [
      { title: "Overview", url: "/docs#overview", isAnchor: true },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      links={LINKS}
      header={
        <DocsNavbar
          logo={<BrandLogo />}
          right={<ThemeSwitcher />}
        />
      }
    >
      {children}
    </DocsLayout>
  );
}
```

**Docs Content (`page.tsx`)**
Use the `DocsFrame`, `DocsHeader`, `DocsOverview`, `DocsSection`, `DocsInstallation`, and `DocsCode` components to construct the content cleanly.

## 5. Syntax Highlighting (`@inklu/docs/shiki`)

When you need to highlight code snippets, **do not** import `shiki` directly in the Next.js app. Instead, use the `highlightSnippets` utility from the isolated `/shiki` subpath to prevent Node.js APIs from bleeding into client components.

```tsx
import { highlightSnippets } from "@inklu/docs/shiki";

const SNIPPETS = {
  example: { lang: "tsx", code: `const a = 1;` },
};

export default async function DocsPage() {
  // Highlight runs on the server
  const highlighted = await highlightSnippets(SNIPPETS);

  return (
    <DocsCode code={SNIPPETS.example.code} html={highlighted.example} />
  );
}
```

## Core Principles to Remember
1. **Composition over Configuration**: Pass React nodes (like `<ThemeSwitcher />` or `<SiteHeader />`) into layouts rather than massive configuration objects.
2. **Strict Boundaries**: Keep server-side node dependencies (like `shiki`) imported strictly from `@inklu/docs/shiki`.
3. **Pristine Apps**: If you find yourself writing custom CSS, wrappers, or animations in `apps/docs-site`, step back and abstract it into `packages/docs` instead.
