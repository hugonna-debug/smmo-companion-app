## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-08-02 - Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like favorite/delete) in compact list views often lack accessible names, making them difficult for screen reader users to understand.
**Action:** Always add descriptive `aria-label`s to icon-only buttons, and use `aria-pressed` for filter/toggle buttons to explicitly communicate state.
