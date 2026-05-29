## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-05-30 - Custom Toggles need Switch Role
**Learning:** When using `<button>` to create custom toggles (like turning filters on/off), screen readers will just announce them as "button" unless they have `role="switch"` and an `aria-checked` attribute matching the state.
**Action:** Always add `role="switch"` and `aria-checked={boolean}` to custom toggle buttons built without Radix/native inputs.
