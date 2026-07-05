## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-07-05 - Custom Toggle Accessibility
**Learning:** Custom `<button>` elements visually styled as toggles lack native screen reader semantics for their active state and may lack keyboard focus styles, leading to poor accessibility.
**Action:** Always add `role="switch"` and `aria-checked={boolean}` to custom toggle buttons, and include `focus-visible` utility classes for keyboard navigation visibility.
