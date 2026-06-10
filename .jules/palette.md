## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2026-06-10 - ARIA Switch Roles for Custom Toggles
**Learning:** Custom toggle buttons implemented with `<button>` instead of input or Radix components are completely inaccessible to screen readers without proper roles.
**Action:** Always add `role="switch"` and `aria-checked={boolean}` to custom button toggles to clearly communicate their state and function.
