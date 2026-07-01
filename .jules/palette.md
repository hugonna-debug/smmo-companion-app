## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-05-18 - Missing Accessibility on Custom Toggle Switches
**Learning:** Custom UI controls built with standard `<button>` elements (like the pill-shaped toggle switches in PvP pages) look great but are inaccessible to screen readers without specific roles and attributes. Screen readers just announce them as "Button" rather than a toggleable state.
**Action:** Always add `role="switch"` and `aria-checked={booleanState}` to custom `<button>` elements that visually behave as switches. This ensures assistive technologies announce them correctly as switches and read their current on/off status.
