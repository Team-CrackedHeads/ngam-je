# Hardcoded Data Audit (Ngam-je Frontend)

## Overview
Audit completed on all `.tsx` files within the frontend workspace to identify mock or hardcoded datasets that should reside in `src/utils`. Tables below record each file checked and flag inline data that warrants relocation.

## Tests
| File | Checked | Internal Mock/Data? | Notes |
| --- | --- | --- | --- |
| tests/unit/Header.test.tsx | ✅ | None | Uses only test assertions; inline arrays describe expected behaviour.
| tests/unit/Footer.test.tsx | ✅ | Test fixture arrays | Defines `routes`/`expectedLabels` arrays to drive assertions.

## src/lib
| File | Checked | Internal Mock/Data? | Notes |
| --- | --- | --- | --- |
| src/lib/auth/AuthContext.tsx | ✅ | None | Simple context definition.
| src/lib/auth/providers/MockAuthProvider.tsx | ✅ | **Mock dataset** | Inline default users and role personas for mock auth (`defaultUser`, `mockUser`, `setMockRole`). Move into a utils module.

## src/components/messages
| File | Checked | Internal Mock/Data? | Notes |
| --- | --- | --- | --- |
| src/components/messages/ChatWindow.tsx | ✅ | None | Pure presentational.
| src/components/messages/MessageBubble.tsx | ✅ | None | Pure presentational.
| src/components/messages/ConversationList.tsx | ✅ | None | Filters supplied data only.
| src/components/messages/ConversationItem.tsx | ✅ | None | Pure presentational.
| src/components/messages/ChatInput.tsx | ✅ | None | Local input state only.

## src/components/dev
| File | Checked | Internal Mock/Data? | Notes |
| --- | --- | --- | --- |
| src/components/dev/AuthRoleToggle.tsx | ✅ | UI config | `roles` array defines dev-only role metadata.

## src/components/matching
| File | Checked | Internal Mock/Data? | Notes |
| --- | --- | --- | --- |
| src/components/matching/ListingComparisonModal.tsx | ✅ | UI config | `comparisonFields` descriptors for rendering.
| src/components/matching/shared/FullscreenListingView.tsx | ✅ | None | Presentational.
| src/components/matching/shared/MatchCard.tsx | ✅ | None | Presentational.
| src/components/matching/mobile/AIMatchingSwipe.tsx | ✅ | **Mock dataset** | `getUserListing`, `getMockListingsForComparison`, `getMockListings` return inline placeholder listings. Relocate to utils.
| src/components/matching/desktop/AIMatchingKanban.tsx | ✅ | UI config | `columns` metadata; actual mock data already imported from utils.
| src/components/matching/contexts/CompareContext.tsx | ✅ | None | State container only.
| src/components/matching/AIMatchingContainer.tsx | ✅ | None | Chooses mobile/desktop component.

## src/app/layout
| File | Checked | Internal Mock/Data? | Notes |
| --- | --- | --- | --- |
| src/app/layout.tsx | ✅ | None | Layout wiring only.

## src/components/ui
Each Shadcn wrapper (`tabs.tsx`, `scroll-area.tsx`, `pagination.tsx`, etc.) is presentational; no inline datasets beyond configuration constants required for component behaviour.

## src/app (pages)
| File | Checked | Internal Mock/Data? | Notes |
| --- | --- | --- | --- |
| src/app/chat/history/page.tsx | ✅ | None | Renders `ChatHistoryDisplay`.
| src/app/page.tsx | ✅ | None | Redirect only.
| src/app/chat/[chatId]/page.tsx | ✅ | None | Reads params.
| src/app/messages/page.tsx | ✅ | None | Data imported from utils.
| src/app/settings/page.tsx | ✅ | None | Toggles only.
| src/app/profile/page.tsx | ✅ | UI config | `tabs` array defines local nav; consider centralising if reused.
| src/app/create-listing/page.tsx | ✅ | UI config | `getSteps` returns per-type wizard steps.
| src/app/profile/activity/page.tsx | ✅ | UI config | `tabs` array for nav.
| src/app/threads/Layout.tsx | ✅ | None | Layout shell.
| src/app/threads/BreadcrumbNav.tsx | ✅ | None | Derives breadcrumbs from pathname.
| src/app/threads/page.tsx | ✅ | None | Uses `MOCK_THREADS` from utils.
| src/app/listings/page.tsx | ✅ | UI config | `tabs` array for view toggle.
| src/app/listings/[listingId]/matches/page.tsx | ✅ | None | Uses mock generators from utils.
| src/app/threads/[threadCategory]/page.tsx | ✅ | None | Filters util data.
| src/app/threads/[threadCategory]/[listingId]/page.tsx | ✅ | None | Uses util lookup.
| src/app/threads/[threadCategory]/[listingId]/faq/page.tsx | ✅ | None | Imports `mockQuestions` from utils.

## src/app/components
| File | Checked | Internal Mock/Data? | Notes |
| --- | --- | --- | --- |
| src/app/components/Sidebar.tsx | ✅ | **Mock dataset** | `navItems` and large `mockChatHistory` array declared inline. Move to utils.
| src/app/components/Header.tsx | ✅ | None | Pure UI.
| src/app/components/Footer.tsx | ✅ | UI config | `links` array defines mobile nav.
| src/app/components/ui/CategoryDropdown.tsx | ✅ | None | Props-driven.
| src/app/components/threads-product-faq/* | ✅ | None | Renders data passed via props; mock FAQ data already in utils.
| src/app/components/threads-ui/ThreadCard.tsx | ✅ | None | Presentational.
| src/app/components/threads-ui/NgamOverview.tsx | ✅ | UI config | Default `bubbles` suggestion list.
| src/app/components/threads-ui/AIAgentSearch.tsx | ✅ | UI config | Quick action labels `["Buy","Browse","Sell"]`.
| src/app/components/threads-ui/ViewDropdown.tsx | ✅ | None | Props-driven.
| src/app/components/threads-ui/TierBadge.tsx | ✅ | None | Dynamic markers.
| src/app/components/threads-ui/PageHeader.tsx | ✅ | None | Static copy.
| src/app/components/threads-ui/FilterButton.tsx | ✅ | UI config | Filter list `['Best','Hot','New','Top','Rising']`.
| src/app/components/threads-ui/ThreadsGrid.tsx | ✅ | None | Grid layout.
| src/app/components/threads-ui/CreateThreadsSection.tsx | ✅ | None | Placeholder UI.
| src/app/components/threads-ui/AIAgentOverlay.tsx | ✅ | None | Placeholder UI.
| src/app/components/sidebar-ui/SidebarAIChat.tsx | ✅ | **Mock dataset** | `WELCOME_MESSAGE` object and `mockHistory` array declared inline. Move to utils.
| src/app/components/sidebar-ui/SearchHistory.tsx | ✅ | None | Uses utils data.
| src/app/components/sidebar-ui/ChatHistoryPage.tsx | ✅ | None | Uses utils data.
| src/app/components/threads-product-ui/ProductDetails.tsx | ✅ | UI config | Inline icon list `[Shield, MessageCircle, HelpCircle]`.
| src/app/components/threads-product-ui/ImageGalleryModal.tsx | ✅ | None | Presentational.
| src/app/components/threads-product-ui/BreadcrumbNav.tsx | ✅ | None | Breadcrumb from props.
| src/app/components/threads-product-ui/ProductHeader.tsx | ✅ | UI config | Icon list `[Heart, Share2, MoreVertical]`.
| src/app/components/threads-product-ui/ActionButtons.tsx | ✅ | None | Props-driven handlers.
| src/app/components/sidebar-ui/menu-items/* | ✅ | None | Consume mock listings from utils.
| src/app/components/threads-category-ui/SearchFilter.tsx | ✅ | UI config | Hardcoded `tags`, `sortOptions`, `listingTypeOptions` for controls.
| src/app/components/threads-category-ui/ListingCard.tsx | ✅ | None | Presentational.
| src/app/components/threads-category-ui/ListingTypeDropdown.tsx | ✅ | UI config | Listing type values `['general','wtb','wts']`.
| src/app/components/threads-category-ui/CategoryBreadcrumb.tsx | ✅ | None | Generated from props.
| src/app/components/threads-category-ui/Sorting.tsx | ✅ | UI config | Primary/quick filter & sort option arrays.

## Summary
- Core inline mock datasets to migrate: `MockAuthProvider`, `AIMatchingSwipe`, `Sidebar`, `SidebarAIChat`.
- Smaller UI-only constants (tab definitions, filter options, nav button lists) are widely used; centralise where reuse or localisation is anticipated.
- All other files either import data from `src/utils` or contain strictly presentational logic.

## Suggested Next Steps
1. Extract the identified mock datasets into new or existing helpers under `src/utils` (e.g. `mock-auth-data.ts`, `mock-matching-data.ts`, `mock-sidebar-data.ts`).
2. Replace in-file declarations with imports from the new utilities.
3. Optionally consolidate repeated UI configuration arrays (tab labels, filter options) for consistency and easier maintenance.
4. Re-run component and unit tests to verify behaviour after refactors.
