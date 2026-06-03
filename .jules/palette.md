## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2026-06-03 - Toggle Buttons Require Accessibility Roles
**Learning:** Custom toggle buttons implemented with plain `<button>` tags (e.g., using Tailwind for the sliding pill effect) are not recognized as switches by screen readers by default.
**Action:** When creating custom toggle components using `<button>` instead of Radix or native inputs, always add `role="switch"` and `aria-checked={boolean}` to ensure correct screen reader accessibility.
