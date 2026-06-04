## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2026-06-04 - Screen Reader States for Custom Toggles
**Learning:** Standard `<button>` elements used as custom UI toggles (e.g., pill-shaped switches) do not communicate their active/inactive state to screen readers natively, which hides critical functionality from visually impaired users.
**Action:** Always add `role="switch"` and the corresponding `aria-checked={boolean}` attribute when creating custom toggle buttons to ensure the interaction model and current state are announced correctly.
