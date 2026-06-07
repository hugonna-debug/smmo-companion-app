## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2026-06-07 - Accessible Toggle Switches
**Learning:** Custom toggles using `<button>` lack implicit semantic meaning for screen readers without specific roles.
**Action:** Always add `role="switch"` and `aria-checked={boolean}` to custom button toggles, along with descriptive dynamic `aria-label`s.
