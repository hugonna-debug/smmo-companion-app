## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-07-31 - Accessibility for Custom Toggles
**Learning:** Custom toggle switches built with `<button>` elements lack proper accessibility attributes, causing screen readers to announce them as generic buttons without state.
**Action:** Always add `role="switch"` and `aria-checked={booleanState}` to custom toggle buttons to ensure their state is correctly communicated to assistive technologies.
