## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2025-02-15 - ARIA Role for Custom Toggle Switches
**Learning:** The app frequently uses standard `<button>` elements styled visually as pill-shaped toggle switches (e.g., in PvP pages). Without `role="switch"`, screen readers announce them only as generic buttons, making it unclear they represent a binary state.
**Action:** When creating or modifying custom toggle components using `<button>`, always add `role="switch"` and dynamically bind `aria-checked={booleanState}` to ensure proper accessibility.
