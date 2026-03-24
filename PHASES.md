# LifeOS — Phased Build Plan

> **How to use this file:** Each phase is a self-contained unit of work with a clear goal, exact file list, Firestore schema changes, and a ready-to-paste AI prompt. Complete phases in order. Do not start a phase until the previous one passes all quality gates in RULES.md.

---

## Phase 0 — Bug Fixes & Foundation (Do First, Always)

**Goal:** Eliminate all known bugs that will block future phases. No new features — just a stable foundation.

**Estimated effort:** Small (1–2 hours)

### Files to change

| File | Change |
|------|--------|
| `firestore.rules` | Fix `lifeAreas` rule: remove `icon` from `hasAll`, add `description` |
| `src/lib/components/ConvertModal.svelte` | Fix `{     /each}` typo → `{/each}` |
| `src/routes/life-areas/+page.svelte` | Replace `confirm()` with `ConfirmSheet` |
| `src/routes/projects/+page.svelte` | Replace `confirm()` with `ConfirmSheet` |
| `src/lib/stores/settings.js` | Fix circular imports — lazy-load stores inside `exportData()` |

### New files to create

| File | Purpose |
|------|---------|
| `src/lib/components/ConfirmSheet.svelte` | Reusable bottom sheet delete confirmation |

### ConfirmSheet spec
```
Props: open (bool), message (string), confirmLabel (string = 'Delete'), onconfirm, oncancel
Style: bottom sheet, destructive red confirm button, cancel secondary button
Behaviour: backdrop tap = cancel, no browser confirm() anywhere
```

### Firestore rules fix
```
lifeAreas rule change:
BEFORE: hasAll(['name', 'icon', 'color'])
AFTER:  hasAll(['name', 'color']) and request.resource.data.name is string
```

### AI Prompt for Phase 0
```
CONTEXT:
You are working on LifeOS, a SvelteKit 5 + Firebase app. Load RULES.md first.
Use Svelte 5 Runes syntax exclusively ($state, $derived, $effect, $props).
Do not use browser confirm() — create and use ConfirmSheet instead.

TASK:
Fix the following bugs in the LifeOS codebase:

1. firestore.rules — lifeAreas rule incorrectly requires 'icon' field. 
   Fix: change hasAll(['name', 'icon', 'color']) to hasAll(['name', 'color']).

2. ConvertModal.svelte — fix typo: {     /each} should be {/each}.

3. settings.js — the module-level imports of followups, brainDump, lifeAreas, 
   projects create circular dependency risk. Move them inside the exportData() 
   function as dynamic lazy references using get() called at runtime, not import time.

4. Create src/lib/components/ConfirmSheet.svelte — a reusable bottom sheet 
   confirmation dialog with props: open, message, confirmLabel='Delete', 
   onconfirm, oncancel. Use destructive red styling for the confirm button.

5. Replace all confirm() calls in life-areas/+page.svelte and projects/+page.svelte 
   with the new ConfirmSheet component.

CONSTRAINTS:
- Svelte 5 Runes only
- ConfirmSheet must be a bottom sheet (not centered modal)
- No new CSS variable names — use existing ones from layout.css
- Show full file content for every changed file
```

---

## Phase 1 — Tasks & Actions (Core Hierarchy)

**Goal:** Extend the data model and UI to support the full 4-level hierarchy: Life Areas → Projects → Tasks → Actions.

**Estimated effort:** Medium (4–6 hours)

### New Firestore collections

**tasks**
```js
{
  id: string,           // auto
  name: string,
  description: string,  // optional
  projectId: string,    // parent reference
  priority: 'high' | 'medium' | 'low',
  flagged: boolean,
  status: 'active' | 'pending' | 'done',
  dueDate: string | null,  // ISO date string YYYY-MM-DD
  createdAt: Timestamp
}
```

**actions**
```js
{
  id: string,         // auto
  name: string,
  taskId: string,     // parent reference
  flagged: boolean,
  status: 'todo' | 'done',
  createdAt: Timestamp
}
```

### Firestore rules additions
```
match /tasks/{taskId} {
  allow read: if true;
  allow create, update: if request.resource.data.keys().hasAll(['name', 'projectId', 'status', 'priority', 'createdAt'])
                       && request.resource.data.status in ['active', 'pending', 'done']
                       && request.resource.data.priority in ['high', 'medium', 'low'];
  allow delete: if true;
}

match /actions/{actionId} {
  allow read: if true;
  allow create, update: if request.resource.data.keys().hasAll(['name', 'taskId', 'status', 'createdAt'])
                       && request.resource.data.status in ['todo', 'done'];
  allow delete: if true;
}
```

### New files to create

| File | Purpose |
|------|---------|
| `src/lib/stores/tasks.js` | Store for tasks, filtered by projectId |
| `src/lib/stores/actions.js` | Store for actions, filtered by taskId |
| `src/lib/components/TaskCard.svelte` | Task card with flag, priority badge, swipe-delete |
| `src/lib/components/TaskModal.svelte` | Bottom sheet for create/edit task |
| `src/lib/components/ActionCard.svelte` | Action card (simpler, checkbox + swipe-delete) |
| `src/lib/components/ActionModal.svelte` | Bottom sheet for create/edit action |
| `src/routes/life-areas/[areaId]/+page.svelte` | Projects within an area |
| `src/routes/life-areas/[areaId]/[projectId]/+page.svelte` | Tasks within a project |
| `src/routes/life-areas/[areaId]/[projectId]/[taskId]/+page.svelte` | Actions within a task |

### Files to modify

| File | Change |
|------|--------|
| `src/lib/components/BottomNav.svelte` | Change 'Projects' tab → remove it (Projects now only accessible via drill-down) |
| `src/lib/components/LifeAreaCard.svelte` | Card tap navigates to `/life-areas/{areaId}` instead of opening modal |
| `src/lib/components/ProjectCard.svelte` | Card tap navigates to `/life-areas/{areaId}/{projectId}` |
| `firestore.rules` | Add tasks and actions rules (above) |
| `src/firebase/database.js` | Already has tasks/actions collections — confirm they're used correctly |

### Breadcrumb component (new)
```
src/lib/components/Breadcrumb.svelte
Props: crumbs = [{ label, href }]
Position: sticky, above bottom nav (bottom: calc(var(--nav-height) + var(--safe-bottom)))
Style: horizontal scroll if overflow, chevron separators, last item non-linked
```

### AI Prompt for Phase 1
```
CONTEXT:
You are working on LifeOS, a SvelteKit 5 + Firebase app. Load RULES.md first.
The app currently has Life Areas and Projects (2 levels). We are adding Tasks and 
Actions (completing the 4-level hierarchy). All syntax must be Svelte 5 Runes.
Follow the store factory pattern exactly as in src/lib/stores/projects.js.

TASK:
Add Tasks and Actions to LifeOS:

1. Create src/lib/stores/tasks.js using the same factory pattern as projects.js.
   Tasks have: name, description, projectId, priority, flagged, status, dueDate, createdAt.
   The store's init() must accept a projectId parameter and query only tasks 
   where projectId matches (use Firestore where() clause).

2. Create src/lib/stores/actions.js similarly.
   Actions have: name, taskId, flagged, status ('todo'|'done'), createdAt.
   init() accepts taskId and filters accordingly.

3. Create TaskCard.svelte — shows task name, priority badge, flag icon (toggleable), 
   status chip, due date if set. Tap opens TaskModal. Swipe left reveals delete button.

4. Create TaskModal.svelte — bottom sheet for create/edit with fields: 
   name (required), description, priority select, status select, dueDate.

5. Create ActionCard.svelte — simpler card with checkbox for done/todo toggle, 
   name, flag icon. Swipe left reveals delete.

6. Create ActionModal.svelte — bottom sheet with name (required) only.

7. Create the drill-down routes:
   - src/routes/life-areas/[areaId]/+page.svelte (projects in area)
   - src/routes/life-areas/[areaId]/[projectId]/+page.svelte (tasks in project)
   - src/routes/life-areas/[areaId]/[projectId]/[taskId]/+page.svelte (actions)

8. Create Breadcrumb.svelte — sticky bar above bottom nav showing current drill path.

9. Update firestore.rules to add tasks and actions collection rules.

CONSTRAINTS:
- Svelte 5 Runes only ($state, $derived, $effect, $props)
- No confirm() — use ConfirmSheet from Phase 0
- Tasks store init() must take projectId to filter correctly
- Breadcrumb must be positioned above bottom nav, not at top of screen
- All card taps navigate — modals open via edit button, not card tap
- Show full file content for every file
```

---

## Phase 2 — Focus Tab (Priority + Pending)

**Goal:** Build the merged Priority/Pending tab that replaces the current Projects tab in the bottom nav. This is the daily-use command centre.

**Estimated effort:** Medium (3–5 hours)

### New route
```
src/routes/focus/+page.svelte
```

### Feature spec

**Toggle pill** (at top of page, below the page header):
- Two states: `Priority` | `Pending`
- Persists in `$state` (session only, no Firestore)

**Priority view:**
- Shows ALL flagged items across projects, tasks, and actions
- Grouped sections: "🚀 Projects" / "✅ Tasks" / "⚡ Actions"
- Each item shows its full path (e.g. "Health › Exercise Plan › Buy gym shoes")
- Priority badge: High 🔴 / Medium 🟡 / Low 🟢
- Manual reorder via drag handle (touch drag, reorder within section)
- Tap item → navigate to its parent page

**Pending view:**
- Shows all items where `status === 'pending'` OR `status === 'active'` with no completion
- Grouped by Life Area (coloured area stripe on left)
- Overdue items (dueDate < today, status !== 'done') shown with red due date
- Tap item → navigate to its parent page

### Files to create

| File | Purpose |
|------|---------|
| `src/routes/focus/+page.svelte` | Main Focus tab page |
| `src/lib/components/FocusItemCard.svelte` | Compact card used in both Priority and Pending views |
| `src/lib/components/TogglePill.svelte` | Reusable two-state toggle pill component |

### Files to modify

| File | Change |
|------|--------|
| `src/lib/components/BottomNav.svelte` | Add `/focus` tab (replacing or repositioning tabs) |
| `src/lib/stores/projects.js` | Add `flagged` field support to addProject/updateProject |
| `src/lib/stores/tasks.js` | Add flag toggle method |
| `src/lib/stores/actions.js` | Add flag toggle method |

### AI Prompt for Phase 2
```
CONTEXT:
You are working on LifeOS, a SvelteKit 5 + Firebase personal life OS app.
Load RULES.md first. Phases 0 and 1 are complete. We are building the Focus tab — 
a merged Priority + Pending view accessible from the bottom nav.

TASK:
Build the Focus tab for LifeOS:

1. Create src/routes/focus/+page.svelte with:
   - A TogglePill at the top to switch between 'Priority' and 'Pending' modes
   - Priority mode: query all flagged projects, tasks, and actions from Firestore 
     (where flagged == true). Group by type. Show path context below each item name.
   - Pending mode: query all projects + tasks with status 'active' or 'pending'. 
     Group by Life Area. Show overdue items with red due date text.
   - Each item uses FocusItemCard component. Tapping navigates to the item's parent route.

2. Create TogglePill.svelte — a pill-shaped two-option toggle. Props: options (string[2]), 
   value (string), onchange. Style: rounded pill, active option has primary colour fill.

3. Create FocusItemCard.svelte — compact card showing: item name, path breadcrumb 
   (e.g. "Health › Get Fit"), priority badge (for Priority mode), due date 
   (red if overdue), area colour stripe on left edge.

4. Update BottomNav.svelte to include a /focus route tab labelled 'Focus' with 
   a target/flag icon. Ensure total tabs remain at 5.

5. Add flagged boolean field to projects store (addProject, updateProject). 
   Add toggleFlag(id) method to projects, tasks, and actions stores.

CONSTRAINTS:
- Svelte 5 Runes only
- Focus page must init() all three stores (projects, tasks, actions) in onMount
- TogglePill must be keyboard accessible (role="tablist")
- Overdue detection: dueDate < today's ISO date string AND status !== 'done'
- No new CSS variables — use existing palette
- FocusItemCard path breadcrumb should be truncated with ellipsis if too long
- Show full file content for every changed file
```

---

## Phase 3 — Brain Dump Full Convert Flow

**Goal:** Upgrade the Brain Dump convert flow to support all 4 hierarchy levels (Area, Project, Task, Action) with a multi-step bottom sheet.

**Estimated effort:** Small–Medium (2–3 hours)

### Convert flow spec (multi-step sheet)

**Step 1 — Pick type:**
```
[🌱 Life Area]  [🚀 Project]  [✅ Task]  [⚡ Action]
```

**Step 2 — Pick parent (conditional):**
- If `Project` → select Life Area
- If `Task` → select Life Area, then Project
- If `Action` → select Life Area, then Project, then Task
- If `Area` → skip (no parent)

**Step 3 — Confirm:**
- Editable name field (pre-filled with dump text)
- Confirm button creates the item and deletes the brain dump entry

### Files to modify

| File | Change |
|------|--------|
| `src/lib/components/ConvertModal.svelte` | Full rewrite — multi-step flow |
| `src/lib/stores/brainDump.js` | Extend `convertItem()` to handle task and action targets |

### AI Prompt for Phase 3
```
CONTEXT:
You are working on LifeOS, a SvelteKit 5 + Firebase app. Load RULES.md first.
Phases 0, 1, and 2 are complete. We are upgrading the Brain Dump convert flow 
to support all 4 hierarchy levels.

TASK:
Rewrite src/lib/components/ConvertModal.svelte as a multi-step bottom sheet:

Step 1: User picks target type — one of: 'area', 'project', 'task', 'action'
  - Show 4 buttons in a 2x2 grid with icon + label each

Step 2: User picks parent(s) — shown only when type requires a parent:
  - 'project': show Life Area picker (dropdown or list)
  - 'task': show Life Area picker, then Project picker (filtered by area)
  - 'action': show Area → Project → Task cascading pickers
  - 'area': skip this step entirely

Step 3: Confirm — show editable name input pre-filled with the original dump text,
  plus a prominent 'Convert' button

Navigation between steps uses a back chevron (not a stepper bar — too small on mobile).

Also update src/lib/stores/brainDump.js convertItem() to handle 'task' and 'action' 
target types, creating the appropriate Firestore document with correct parent ID fields.

CONSTRAINTS:
- Svelte 5 Runes only ($state for step tracking, $derived for filtered lists)
- Back button in step 2+ header navigates to previous step
- Loading state on Convert button while Firestore write is pending
- After conversion, dump item is deleted from brainDump collection
- No confirm() — conversion is confirmed by the Convert button itself
- Show full file content for ConvertModal.svelte and brainDump.js
```

---

## Phase 4 — Settings: Colour & Theme

**Goal:** Expand Settings to support per-project colour coding (via colour picker on Project cards/modal) and global theme controls (dark/light + accent colour).

**Estimated effort:** Small (2–3 hours)

### Settings page additions

**Global theme section (existing, enhance):**
- Dark/Light toggle — already exists, keep
- Accent colour picker — already exists, enhance with preset swatches + custom hex input

**Colour palette section (new):**
- 8 preset colours shown as swatch circles (matching `--color-area-1` through `--color-area-8`)
- Tapping a swatch updates `--color-primary`

### Per-project colour (in ProjectModal, not Settings)
- Add colour picker row to `ProjectModal.svelte`
- Show 8 preset swatches, one selected at a time
- Selected colour stored as `project.color` in Firestore
- `ProjectCard.svelte` applies colour as left border stripe

### Files to modify

| File | Change |
|------|--------|
| `src/routes/settings/+page.svelte` | Add colour palette section, improve accent picker UX |
| `src/lib/components/ProjectModal.svelte` | Add colour picker row |
| `src/lib/components/ProjectCard.svelte` | Apply `project.color` as left border stripe |
| `src/lib/stores/settings.js` | Add `accentColor` presets array, extend `applyThemeStyles` |

### New files to create

| File | Purpose |
|------|---------|
| `src/lib/components/ColourPicker.svelte` | Reusable swatch-based colour picker (8 presets) |

### AI Prompt for Phase 4
```
CONTEXT:
You are working on LifeOS, a SvelteKit 5 + Firebase app. Load RULES.md first.
Phases 0–3 are complete. We are expanding the colour and theme customisation system.

TASK:
1. Create src/lib/components/ColourPicker.svelte:
   - Props: value (hex string), onchange
   - Shows 8 circular colour swatches using the --color-area-1 through --color-area-8 
     CSS variables as preset values
   - Selected swatch has a white ring/border indicator
   - Optional: small text input below for custom hex (validated with regex)

2. Update src/routes/settings/+page.svelte:
   - Add a "Theme Colour" section that uses ColourPicker
   - Changing colour calls settings.updateSettings({ primaryColor: newColor })
   - Keep existing dark/light ThemeToggle component

3. Update src/lib/components/ProjectModal.svelte:
   - Add a "Colour" row using ColourPicker
   - Default colour is the first area colour preset
   - Save selected colour to project.color field in Firestore

4. Update src/lib/components/ProjectCard.svelte:
   - Apply project.color as a 3px left border stripe
   - Use: style="--project-color: {project.color}" on root element
   - CSS: border-left: 3px solid var(--project-color, var(--color-primary))

CONSTRAINTS:
- Svelte 5 Runes only
- ColourPicker must work without JavaScript colour libraries — pure CSS + inline styles
- Swatch values must reference CSS variables, not hardcoded hex
- Touch target for each swatch: minimum 40px diameter
- Show full file content for all changed files
```

---

## Phase 5 — Navigation Polish & One-Handed UX

**Goal:** Final UX pass — replace top-of-screen interactive elements, consolidate the bottom nav, add loading skeletons, and fix textarea auto-resize.

**Estimated effort:** Small (2–3 hours)

### Changes

| Area | Change |
|------|--------|
| `SortFilterBar.svelte` | Convert to bottom sheet trigger button (one tap opens filter sheet) |
| `BrainDump` textarea | Add auto-resize on input |
| All pages | Add skeleton loading states while Firestore data is pending |
| `BottomNav.svelte` | Shorten labels: "Life Areas" → "Areas", "Brain Dump" → "Capture", "Follow-ups" → "Inbox", "Settings" → "Settings", "Focus" → "Focus" |
| All pages | Move page subtitles to be display-only; remove any interactive elements from top 40% of screen |

### New files to create

| File | Purpose |
|------|---------|
| `src/lib/components/FilterSheet.svelte` | Bottom sheet filter/sort panel (replaces SortFilterBar) |
| `src/lib/components/SkeletonCard.svelte` | Animated skeleton placeholder for loading states |

### AI Prompt for Phase 5
```
CONTEXT:
You are working on LifeOS, a SvelteKit 5 + Firebase app. Load RULES.md first.
Phases 0–4 are complete. This is the final UX polish phase.

TASK:
1. Create FilterSheet.svelte — a bottom sheet that replaces SortFilterBar. 
   It has a trigger button (bottom-right, above FAB) that opens a sheet with 
   filter/sort options. Props: onfilter callback, current filter state.

2. Create SkeletonCard.svelte — an animated skeleton placeholder card using 
   CSS shimmer animation (background gradient that slides left-to-right). 
   Show 3 skeleton cards when a store has not yet loaded data.

3. Update BrainDump page textarea to auto-resize:
   Use $effect to watch the textarea value and set its height to scrollHeight.

4. Update BottomNav.svelte tab labels:
   'Life Areas' → 'Areas'
   'Brain Dump' → 'Capture' 
   'Follow-ups' → 'Inbox'

5. Update projects/+page.svelte and life-areas/+page.svelte to:
   - Show 3 SkeletonCard placeholders when the store array is empty AND 
     a loading boolean is true (set loading=true before init, false after 
     first snapshot fires)
   - Replace SortFilterBar with a FilterSheet trigger button

CONSTRAINTS:
- Svelte 5 Runes only
- Skeleton shimmer must respect dark/light theme (use CSS variables)
- Loading detection: use a $state loading flag set to false on first onSnapshot callback
- FilterSheet trigger: 44px minimum touch target, positioned bottom-right above FAB
- Show full file content for all changed and created files
```

---

## Completion Checklist

After all 5 phases, verify the following end-to-end:

### Data
- [ ] Life Areas can be created, edited, colour-assigned, deleted
- [ ] Projects can be created under an area, with colour, priority, flag, status, due date
- [ ] Tasks can be created under a project, with priority, flag, status, due date
- [ ] Actions can be created under a task, toggled done/todo, flagged
- [ ] Brain Dump items can be captured and converted to any of the 4 levels
- [ ] All items can be deleted with ConfirmSheet (no confirm())
- [ ] Follow-ups remain functional (untouched from Phase 0 onward)

### Navigation
- [ ] Bottom nav has exactly 5 tabs: Areas, Focus, Capture, Inbox, Settings
- [ ] Drilling Life Area → Project → Task → Action works with browser back
- [ ] Breadcrumb shows correct path at all drill levels
- [ ] Back navigation is accessible from bottom 60% of screen

### Focus tab
- [ ] Toggle pill switches between Priority and Pending views
- [ ] Priority view shows all flagged items grouped by type
- [ ] Pending view shows all incomplete items grouped by Life Area
- [ ] Overdue items show red date indicator

### Settings
- [ ] Dark/Light toggle works
- [ ] Accent colour picker updates UI immediately
- [ ] Per-project colour picker visible in ProjectModal

### Quality
- [ ] No `confirm()` calls anywhere
- [ ] No hardcoded colours in component `<style>` blocks
- [ ] No Svelte 4 syntax
- [ ] Firestore rules updated for tasks and actions
- [ ] Loading skeletons shown on all list pages