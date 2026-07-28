## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-05-27 - Proper roles for custom toggles
**Learning:** Custom toggle buttons (using rounded full designs with sliding indicator) without `role="switch"` and `aria-checked` are announced as standard buttons to screen readers, making their state (on/off) invisible.
**Action:** Always add `role="switch"` and `aria-checked={boolean}` when creating custom toggle switches instead of native inputs.
