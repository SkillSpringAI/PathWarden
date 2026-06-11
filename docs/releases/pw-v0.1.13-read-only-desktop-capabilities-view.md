Purpose

Provide a small read-only desktop view that surfaces the application's capability inventory to end users and reviewers.

Completed work

- Added a read-only "Capabilities" button in the validated desktop UI.
- Implemented `readCapabilityInventory` IPC handler in the main process.
- Exposed `readCapabilityInventory` via the preload API.
- Implemented `renderCapabilities()` and event binding in the renderer to display the inventory using existing card components.
- Added `apps/desktop/data/capability-inventory.display.json` as the displayed inventory source.

Boundary

- This view is strictly read-only: it does not modify policy, authority, or runtime state, nor does it execute tasks or write files.
- No new architecture documents, contracts, or inventories were created — this view uses existing artifacts.

Validation

- Verified the UI entry, IPC handler, preload exposure, and renderer rendering using static inspection of the changed files.
- Confirm that the view renders inventory grouped by validated, advancedReporting, experimental, notImplemented, and authorityMechanisms.

