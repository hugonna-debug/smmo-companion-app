## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-05-27 - Dynamic Aria-labels for Sorting
**Learning:** Adding dynamic `aria-label` attributes to sort control buttons ensures screen readers accurately convey the sort action, field, and current sort direction. Additionally, adding `aria-pressed` to filter tabs makes their active state clear to assistive technologies.
**Action:** Use dynamic `aria-label`s on generic buttons used for sorting, describing the action, field, and state, as `aria-sort` is strictly for table/grid headers. Use `aria-pressed` on filter tabs indicating content display toggling.
