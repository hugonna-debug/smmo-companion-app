## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-05-27 - Dynamic Aria-labels for Sort controls
**Learning:** Adding dynamic aria-labels for ascending/descending states is crucial when 'aria-sort' cannot be used because the elements are generic buttons, rather than table/grid headers.
**Action:** Use conditional logic within aria-labels on standard sort buttons to replicate the semantic context of 'aria-sort'.
