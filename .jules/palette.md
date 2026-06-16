## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-06-16 - Make custom toggle buttons accessible
**Learning:** Found several custom toggle switches using plain `<button>` elements with visually indicated state (via CSS classes like `bg-primary`/`translate-x-5`) but lacking proper semantic ARIA attributes.
**Action:** When implementing custom toggle components using `<button>`, always add `role="switch"` and dynamically set `aria-checked={booleanState}` to ensure screen readers announce the element as a switch and correctly report its state.
