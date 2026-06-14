## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2026-06-14 - Custom Toggle Components Accessibility
**Learning:** Custom toggle switches implemented with native `<button>` tags (instead of standard inputs or Radix switches) lack implicit state context for screen readers. Users interacting with these elements might not understand they function as toggles or know their current state.
**Action:** When building custom toggle switches using standard `<button>` elements, always include `role="switch"` and bind `aria-checked={booleanState}` to ensure screen reader users receive proper feedback about the component's purpose and active state.
