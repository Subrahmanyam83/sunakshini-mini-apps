# Skill: UI Consistency

Every mini app must look and feel like it belongs to the same family. Apply these rules to every component you write or edit.

## Typography — use these sizes everywhere, no exceptions

| Element | Class |
|---|---|
| Page/section title | `text-base font-semibold text-gray-800` |
| Body text | `text-sm text-gray-700` |
| Secondary / helper text | `text-xs text-gray-400` |
| Labels (inputs, badges) | `text-xs font-medium text-gray-500` |
| Numbers / stats (large) | `text-2xl font-bold` or `text-3xl font-bold` |

Never use `text-lg` for body copy. Never go below `text-xs` for readable content.

## Colors

- Page background: always `bg-[#f8f9fc]`
- Cards: always `bg-white rounded-2xl shadow-sm border border-gray-100`
- Dividers: `divide-gray-50` or `border-gray-50`
- Destructive actions: `text-red-500`, `bg-red-50`, `border-red-100`
- Success / positive: use the app's accent color
- Each mini app has its own unique accent color — never reuse another app's color:
  - Alcohol: `#4f46e5` (indigo)
  - Groceries: `#059669` (emerald)
  - My Nutrition: `#16a34a` (green)
  - New apps: pick a clearly distinct color and add it here

## App Header (fixed, per-app)

Every app header must:
- Use `fixed` positioning (not `sticky`)
- Use the app's own accent color as background
- Show the back arrow + app name in white
- Height: `h-14`

```tsx
<div className="fixed top-0 left-0 right-0 z-10 w-full" style={{ background: "APP_COLOR" }}>
  <div className="w-full px-2 h-14 flex items-center">
    <Link href="/" className="flex items-center gap-3 text-white active:opacity-70 h-full px-3 py-2">
      <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="text-base font-semibold tracking-tight">App Name</span>
    </Link>
  </div>
</div>
```

## Home Page Card (src/app/page.tsx)

Every app is registered in the `apps` array with these required fields:
```ts
{
  href: "/your-app",
  name: "App Name",
  description: "One line description",
  icon: "emoji",
  color: "#hexcolor",
}
```
The home page renders the icon in a colored tile + app name + description. Do not change the card layout.

## Cards

Always use this pattern for content cards:
```tsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
```

For cards with a bottom action row (buttons), separate with:
```tsx
<div className="flex border-t border-gray-50">
  <button className="flex-1 py-2.5 text-xs font-medium text-center active:bg-gray-50">Action</button>
</div>
```

## Buttons

| Type | Classes |
|---|---|
| Primary | `h-11 rounded-xl text-sm font-semibold text-white active:scale-95 transition-all` + inline `style={{ background: APP_COLOR }}` |
| Secondary / ghost | `h-11 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 active:scale-95` |
| Destructive | `h-11 rounded-xl text-sm font-medium text-red-500 bg-red-50 active:scale-95` |
| Icon-only | `w-11 h-11 flex items-center justify-center rounded-xl active:scale-95` |

Always `active:scale-95` on buttons for tap feedback.

## Inputs & Selects

```tsx
<input
  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[APP_COLOR] focus:bg-white transition-all"
  style={{ fontSize: "16px" }}
/>
```

- Always `style={{ fontSize: "16px" }}` — prevents iOS zoom
- Always `rounded-xl` minimum
- Focus ring uses the app's accent color

## Empty States

```tsx
<div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center space-y-3">
  <div className="text-4xl">EMOJI</div>
  <p className="text-sm font-semibold text-gray-700">Heading</p>
  <p className="text-xs text-gray-400">Subtext</p>
  {/* optional CTA button */}
</div>
```

## Loading State

```tsx
<div className="flex items-center justify-center py-20">
  <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-[APP_COLOR] animate-spin" />
</div>
```

## Error State

```tsx
<div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center space-y-2">
  <p className="text-sm text-red-600">Error message</p>
  <button className="text-xs text-red-500 underline">Retry</button>
</div>
```
