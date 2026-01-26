# Tasks: Auto-Initialize Default Layouts

## 1. Implementation

- [ ] 1.1 Add onMount auto-initialization in `/admin/layout/+page.svelte`
- [ ] 1.2 Show "Setting up layouts..." loading state during auto-init
- [ ] 1.3 Display toast notification after auto-initialization completes
- [ ] 1.4 Remove manual "Initialize Default Layouts" button
- [ ] 1.5 Update empty state messaging (should only show if init fails)

## 2. Testing

- [ ] 2.1 Verify auto-init triggers on first admin visit with empty DB
- [ ] 2.2 Verify auto-init does NOT trigger when layouts already exist
- [ ] 2.3 Verify toast appears after successful initialization
- [ ] 2.4 Test that page type tabs work correctly after auto-init
