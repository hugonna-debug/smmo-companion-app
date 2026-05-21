## 2026-05-21 - Added ARIA labels to icon-only buttons
**Learning:** Icon-only buttons with contextual actions (like 'Remove from watchlist', 'Copy code') were missing ARIA labels and tooltips, making them inaccessible to screen readers and confusing to sighted users relying on tooltips.
**Action:** When creating or modifying icon-only buttons, always include 'aria-label' for accessibility and 'title' for a visual tooltip.
