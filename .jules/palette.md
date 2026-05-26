## 2026-05-22 - Adding aria-labels to icon-only buttons
**Learning:** Found several icon-only buttons in the application (like delete, copy, toggle) without aria-labels which makes them inaccessible for screen readers.
**Action:** Always verify that every icon-only button contains descriptive 'aria-label' attribute to improve accessibility, dynamically updating the label when button state changes.
