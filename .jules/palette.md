## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-06-08 - Accessible Accordion and Toggle states
**Learning:** Enhancing custom interactive components with robust ARIA attributes makes them comprehensible to screen readers. Specifically, accordion toggles benefit from `aria-expanded` and `aria-controls`, while custom button toggles must specify `role="switch"`, `aria-checked`, and a state-dependent `aria-label`.
**Action:** Always add appropriate roles and explicit state declarations to generic `<button>` elements that functionally act as structural components or specialized inputs.
