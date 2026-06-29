## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2026-06-29 - Accessibility for custom switch toggles
**Learning:** Custom UI toggles built with `<button>` elements lack semantic meaning for screen readers and are announced simply as "button" instead of reflecting their true state.
**Action:** Always apply `role="switch"` and `aria-checked={booleanState}` to `<button>` elements that visually act as toggles.
