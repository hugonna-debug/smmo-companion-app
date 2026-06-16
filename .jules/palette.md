## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-06-17 - Missing ARIA properties on custom switch/toggle buttons
**Learning:** Custom UI toggle buttons built without native inputs or libraries (like Radix) often lack critical ARIA attributes (e.g., `role="switch"` and `aria-checked`), rendering their state opaque to screen readers.
**Action:** When building or modifying custom toggle buttons using `div` or `button` elements, ensure `role="switch"` and `aria-checked={boolean}` are explicitly added.
