## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-05-20 - Custom Switch Accessibility
**Learning:** Custom toggle components using generic `<button>` tags without Radix or native inputs are missing `role="switch"` and `aria-checked` attributes, making them inaccessible to screen readers.
**Action:** Always add `role="switch"` and `aria-checked={boolean}` to custom toggle buttons to ensure correct screen reader behavior.
