## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-06-25 - ARIA Labels on Icon-only Dialog Close Buttons
**Learning:** Found that `DialogPrimitive.Close` buttons in Radix components, which use an X icon to close modals, lack proper descriptive labels for screen readers. Using `sr-only` is sometimes not enough or is bypassed in some component structures; providing `aria-label` directly on the button ensures correct announcement.
**Action:** Always add `aria-label="Close"` directly to `DialogPrimitive.Close` elements containing only an X icon.
