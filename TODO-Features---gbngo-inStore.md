# TODO Features - gbngo-inStore

Ideas and future features captured during development conversations.

---

## Packaging & Distribution

### Standalone Executable Package
**Status:** Idea phase - needs planning

**Description:**
Package the entire InStore Portal as a standalone executable (.exe) that store owners can easily install. Since the app uses internal SQLite database, it's self-contained and perfect for distribution.

**Benefits:**
- Easy installation for store owners
- No technical knowledge required
- Customizable branding (replace logo, colors)
- Self-contained - no external database dependencies

**Considerations:**
- Electron or similar for packaging
- Auto-update mechanism
- Configuration wizard for branding
- Data backup/restore functionality

---

## Database

### Convex Migration (Optional)
**Status:** Research documented

**Reference:** See `docs/old/convex-claude-info.md` for Convex database information.

**Note:** Current SQLite setup is actually good for standalone distribution. Only consider Convex if cloud sync between stores is needed.

---

## Development Workflow

### File Snapshot Detection
**Status:** Idea phase

**Description:**
Automatically detect "junk files" created during development by taking a snapshot of project files before and after a task.

**Workflow:**
1. At task start: Note existing files/folders that might be affected (.tests/, temp files, build artifacts)
2. At task done: Compare against snapshot
3. Flag new files/folders that shouldn't exist
4. Verify .gitignore covers new temp files

**Benefits:**
- Prevents leftover test files from accumulating
- Catches accidentally created folders (e.g., wrong screenshot paths)
- Maintains clean project structure

**Implementation:**
Could be integrated into task-manager skill with simple ls/dir comparison before and after task execution.

---

## Future Integrations

Possible integrations mentioned in original architecture:
- B2B-food
- Hybrid store
- Campaigns/discounts based on highscores
- External Customer Portal (web version)

---

*Auto-maintained by idea-catcher skill*
