## 2026-05-24 - Add ARIA Labels and Titles to Icon-Only Buttons
**Learning:** Icon-only buttons (like Favorite and Trash icons in lists) often lack accessibility context and hover tooltips for sighted users. In `PersonalItemsPage`, these were implemented purely with icons, requiring users to guess their function and providing zero context to screen readers.
**Action:** Always add dynamic `aria-label` and `title` attributes to icon-only `Button` components. Ensure the labels update based on state (e.g., 'Add to favorites' vs 'Remove from favorites') to provide accurate context at all times.
