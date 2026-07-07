## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-07-07 - Accessible Custom Switch Toggles
**Learning:** When building custom toggle components out of standard `<button>` tags (often seen in settings or filter panels like PvP targets), screen readers cannot natively announce their toggled state if only CSS classes change.
**Action:** Always add `role="switch"` and `aria-checked={state}` to `<button>` elements that act as boolean toggles so assistive technologies can correctly announce their purpose and current state.
