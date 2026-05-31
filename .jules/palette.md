## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2026-05-31 - Switch Toggles Accessibility\n**Learning:** Custom toggle controls implemented as plain `<button>` tags (often with moving thumb indicators) are announced only as generic buttons without additional context.\n**Action:** Always include `role="switch"` and `aria-checked={booleanValue}` when creating custom toggle switches using standard buttons, so screen readers can accurately interpret their state and intent.
