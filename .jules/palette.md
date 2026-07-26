## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-07-27 - Aria-pressed for Toggle Buttons
**Learning:** Using `aria-pressed` on filter buttons (like categories or favorites only) clearly communicates to screen readers that these buttons function as toggles controlling content display rather than just triggering actions.
**Action:** Always add `aria-pressed={state}` to any button that acts as a toggle, filter, or switch, complementing the visual active/inactive styles.
