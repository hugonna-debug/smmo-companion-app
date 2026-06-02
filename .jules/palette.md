## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-05-19 - Accessible Custom Toggle Switches
**Learning:** Found custom `<button>` elements styled as toggle switches (e.g., using `rounded-full` and `translate-x` for a slider effect) in `PvpAssistantPage.tsx` and `PvpPage.tsx` that relied entirely on visual cues (background color/position) to convey their state. These lacked necessary ARIA attributes, making them inaccessible to screen readers.
**Action:** Always ensure custom toggle switches implemented with `<button>` include `role="switch"` and `aria-checked={booleanValue}` to properly communicate their function and current state to assistive technologies.
