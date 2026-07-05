## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2026-07-05 - Accessible Sort and Filter Toggles
**Learning:** Using aria-sort on generic <button> elements is invalid. State must be encoded into dynamic aria-label attributes (e.g., 'Sort by Name (ascending)'). Similarly, toggle-like filter tabs need aria-pressed to communicate active state to screen readers.
**Action:** Use aria-pressed for filter/category toggle buttons and dynamic aria-label attributes for sort controls.
