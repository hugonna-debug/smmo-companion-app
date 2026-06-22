## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2026-06-22 - Custom Toggle Switch Accessibility
**Learning:** Custom `<button>` elements styled visually as toggle switches are not inherently recognized as switches by screen readers.
**Action:** Always add `role="switch"` and `aria-checked={boolean}` to custom toggle buttons to ensure proper state communication for assistive technologies.
