## 2024-08-04 - Custom Switch Buttons Require Role Attribute
**Learning:** Custom toggle buttons implemented with `div` or generic `button` elements instead of native inputs lack semantic meaning for screen readers.
**Action:** When implementing custom toggle/switch UI with a generic `<button>`, always add `role="switch"` and `aria-checked={boolean}` to correctly expose the state to assistive technologies.
