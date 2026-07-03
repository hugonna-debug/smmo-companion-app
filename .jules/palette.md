## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-07-02 - Standardizing Switch Roles for Custom Toggles
**Learning:** Custom toggle controls implemented as `<button>` elements without standard native input checkboxes are completely opaque to screen readers regarding their function and state unless specifically tagged. Without `role="switch"` and `aria-checked`, a screen reader user simply hears "Button", but not what it controls or what its current state is.
**Action:** When creating custom toggle components using `<button>`, always add `role="switch"`, `aria-checked={boolean}`, and a clear `aria-label` to ensure proper screen reader accessibility.
