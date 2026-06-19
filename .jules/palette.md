## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-05-26 - Custom Toggle Buttons
**Learning:** Custom toggle buttons implemented with `<button>` and `<div>` for the slider need proper ARIA roles to be accessible.
**Action:** Always add `role="switch"` and `aria-checked={state}` when creating or finding custom toggle switches built with `<button>`.
