# Multiple Elements

Highlight multiple elements in a single tour step.

Highlight multiple elements in a single step by assigning them the same `data-tour-step` attribute.

## Example

**app/page.tsx**

```tsx
export default function Page() {
  return (
    <div>
      <header data-tour-step="navigation">
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>

      <aside data-tour-step="navigation">
        <ul>
          <li>Dashboard</li>
          <li>Settings</li>
        </ul>
      </aside>

      <main>
        <h1>Welcome</h1>
      </main>
    </div>
  );
}
```

**lib/step.ts**

```ts
import { type Step } from "@/components/ui/tour";

export const steps = [
  {
    id: "navigation",
    title: "Navigation Areas",
    content: "Both the header and sidebar will be highlighted.",
  },
] satisfies Step[];
```
