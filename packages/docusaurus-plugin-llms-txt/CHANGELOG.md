# @signalwire/docusaurus-plugin-llms-txt

## 2.0.0-alpha.7

### Patch Changes

- Fix code block language identifiers lost in MDX components (fixes #20)

  Code blocks were losing their language identifiers during HTML → Markdown conversion because
  Docusaurus places language classes on `<pre>` and wrapper `<div>` elements, not on `<code>`
  elements. Implemented a custom pre handler that:
  - Extracts language from `<pre>` element's className
  - Falls back to checking parent element if needed
  - Preserves code formatting by converting `<br/>` to newlines
  - Handles all edge cases gracefully with proper fallbacks

  Tested with 21 programming languages in MDX Tabs and regular code blocks.

## 2.0.0-alpha.5

### Patch Changes

- Organize links by path now in llms-txt
- 85c2631: Fixed attachments filename bug

## 2.0.0-alpha.3

### Major Changes

- 75c2b75: Alpha Release

### Patch Changes

- Fix `contentStrategy` bug where dropdown menu displayed incorrect content type. When
  `contentStrategy: 'html-only'` is set, the dropdown now correctly shows "Copy Raw HTML" instead of
  "Copy Raw Markdown". The "View Markdown" option remains available when markdown exists,
  independent of `contentStrategy` setting.

- Updated ambient type declarations to remove unused `hasMarkdown` prop from CopyButton component.

- Updated README documentation to clarify `contentStrategy` behavior and `viewMarkdown`
  independence.

- ec2e25b: Code cleanup and cache optimization:
  - Remove dead code (className prop, normalizePathname export, CopyContentData export)
  - Optimize cache implementation (replace over-engineered promise cache with minimal in-memory
    cache)
  - Fix resize re-fetch bug (component no longer re-fetches data when switching between
    mobile/desktop views)
  - Reduce code size by 47% in useCopyContentData hook
  - Changed the location of the CopyButtonContent component. The theme now swizzles DocItem/Layout
    and conditionally puts the Copy button content component after it or below it

- e1246b2: Major architecture improvements for better plugin compatibility:

  **Component Changes:**
  - Switched from ejecting `DocItem/Layout` to wrapping `DocBreadcrumbs`
    - This prevents conflicts with other plugins that customize the layout
    - Uses WRAP pattern instead of EJECT for better compatibility
  - Changed internal import from `@theme-original` to `@theme-init` following Docusaurus best
    practices for theme enhancers

  **Improvements:**
  - Fixed type declarations to accurately reflect component props
    - Removed unused `className` prop from `CopyPageContent`
    - Fixed `DocBreadcrumbs` type declaration for proper wrapping support
  - Added `margin-left: auto` to ensure copy button always aligns right in desktop view
  - Fixed package publishing configuration
    - Added `src/theme` directory to published files for TypeScript swizzling support
    - Updated devDependencies for proper type resolution
    - Changed `react-icons` from exact version to version range

  **Documentation:**
  - Updated README with correct swizzle examples for `DocBreadcrumbs`
  - Added explanation of `@theme-init` vs `@theme-original` usage
  - Updated swizzle configuration to reflect new safe wrapping pattern

  **Compatibility:**
  - Now compatible with plugins like `docusaurus-plugin-openapi-docs` that also customize layouts
  - Follows official Docusaurus theme enhancer pattern (similar to
    `@docusaurus/theme-live-codeblock`)
  - Users can now safely wrap our enhanced breadcrumbs with `@theme-original/DocBreadcrumbs`

## 2.0.0-alpha.2

### Patch Changes

- Major architecture improvements for better plugin compatibility:

  **Breaking Changes:**
  - Switched from ejecting `DocItem/Layout` to wrapping `DocBreadcrumbs`
    - This prevents conflicts with other plugins that customize the layout
    - Uses WRAP pattern instead of EJECT for better compatibility
  - Changed internal import from `@theme-original` to `@theme-init` following Docusaurus best
    practices for theme enhancers

  **Improvements:**
  - Fixed type declarations to accurately reflect component props
    - Removed unused `className` prop from `CopyPageContent`
    - Fixed `DocBreadcrumbs` type declaration for proper wrapping support
  - Added `margin-left: auto` to ensure copy button always aligns right in desktop view
  - Fixed package publishing configuration
    - Added `src/theme` directory to published files for TypeScript swizzling support
    - Updated devDependencies for proper type resolution
    - Changed `react-icons` from exact version to version range

  **Documentation:**
  - Updated README with correct swizzle examples for `DocBreadcrumbs`
  - Added explanation of `@theme-init` vs `@theme-original` usage
  - Updated swizzle configuration to reflect new safe wrapping pattern

  **Compatibility:**
  - Now compatible with plugins like `docusaurus-plugin-openapi-docs` that also customize layouts
  - Follows official Docusaurus theme enhancer pattern (similar to
    `@docusaurus/theme-live-codeblock`)
  - Users can now safely wrap our enhanced breadcrumbs with `@theme-original/DocBreadcrumbs`

## 2.0.0-alpha.1

### Patch Changes

- Code cleanup and cache optimization:
  - Remove dead code (className prop, normalizePathname export, CopyContentData export)
  - Optimize cache implementation (replace over-engineered promise cache with minimal in-memory
    cache)
  - Fix resize re-fetch bug (component no longer re-fetches data when switching between
    mobile/desktop views)
  - Reduce code size by 47% in useCopyContentData hook

## 2.0.0-alpha.0

### Major Changes

- Alpha Release
