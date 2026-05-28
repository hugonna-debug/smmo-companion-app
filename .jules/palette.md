## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-05-28 - Dynamic Aria-labels for State changes (Favorites)
**Learning:** Adding dynamic `aria-label`s to dynamically toggled buttons like Favorites (e.g. `aria-label={item.isFavorite ? "Remove from favorites" : "Add to favorites"}`) gives critical context to screen readers where visual icons (Star/StarOff) are the only visual indication.
**Action:** Always verify if toggle buttons that use icon-only states have corresponding state-aware ARIA attributes.
