## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-05-18 - Accessibility on Custom Toggles
**Learning:** The app frequently uses custom `<button>` elements styled as switches instead of the Radix `<Switch>` component for performance or minimal styling reasons. These custom toggles were missing `role="switch"` and `aria-checked` attributes, causing screen readers to announce them as generic buttons without state.
**Action:** For future custom toggles across this app, always ensure `role="switch"` and `aria-checked={boolean}` are explicitly provided if not using Radix primitives.
