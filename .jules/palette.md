## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-05-24 - Accessibility for Custom Toggle Buttons
**Learning:** Custom UI toggle switches implemented using standard `<button>` elements across the dashboard lacked proper ARIA attributes, meaning screen readers would incorrectly announce them as standard push buttons rather than switch inputs.
**Action:** When creating custom toggle components using `<button>` instead of Radix or native inputs, always add `role="switch"` and `aria-checked={boolean}` to ensure screen reader accessibility.
