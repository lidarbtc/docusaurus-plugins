# @signalwire/docusaurus-plugin-llms-txt

> **📣 Version 2.0 Documentation** This documentation is for version 2.0, which includes breaking
> API changes. If you're using version 1.x, please refer to the
> [v1.2.2 documentation on npm](https://www.npmjs.com/package/@signalwire/docusaurus-plugin-llms-txt/v/1.2.2).

A Docusaurus plugin that transforms your documentation into AI-friendly formats. It automatically
converts your site's rendered HTML pages into clean markdown files and generates an `llms.txt` index
file, making your documentation easily consumable by Large Language Models while preserving the
human-readable experience.

**Perfect for**: API documentation, internal knowledge bases, developer resources, and any
documentation that you want to make accessible to AI assistants, chatbots, or LLM-powered tools.

## How It Works

This plugin processes your **final HTML output** after Docusaurus builds your site, not your source
MDX/MD files. This approach captures fully rendered components, resolved data, and processed content
that only exists after build time. The HTML is then converted through a sophisticated pipeline that
extracts clean content, processes it through rehype/remark transformations, and outputs pristine
markdown optimized for AI consumption.

## Features

- 🔄 **HTML to Markdown Conversion**: Automatically converts your Docusaurus HTML pages to clean
  markdown files
- 📝 **llms.txt Generation**: Creates a comprehensive index file with links to all your
  documentation
- 🗂️ **Section-Based Organization**: Intuitive section-based organization with route precedence
  logic
- ⚡ **Smart Caching**: Efficient caching system for fast incremental builds
- 🎯 **Content Filtering**: Flexible filtering by content type (docs, blog, pages) and custom
  patterns
- 📎 **File Attachments**: Include local files (OpenAPI specs, schemas, guides) with YAML/JSON
  formatting preservation
- 🔗 **External Links**: Organize external URLs within sections or optional sections
- 💻 **CLI Commands**: Standalone CLI for generation and cleanup operations
- 🎨 **Customizable Content Extraction**: Configurable CSS selectors for precise content extraction
- 🔗 **Link Management**: Smart internal link processing with relative/absolute path options

## Core Concepts

### Output Files

- **`llms.txt`** - Hierarchical index file with links to all your documentation, organized by
  sections
- **Individual markdown files** - Clean .md versions of each page, mirroring your route structure
- **`llms-full.txt`** - Optional single file containing all content, useful for complete exports

### Section Organization

Content is organized into logical sections that help AI systems understand documentation structure.
Sections can have custom names, descriptions, and route patterns for precise content grouping.

### Content Processing Pipeline

HTML → Content Extraction (CSS selectors) → HTML Processing (rehype) → Markdown Conversion (remark)
→ Clean Output

### Route Patterns

Use glob patterns like `/docs/**` or `/api/*` to filter and organize content. Routes determine both
what gets processed and how it's organized in sections.

## Installation

```bash
npm install @signalwire/docusaurus-plugin-llms-txt
# or
yarn add @signalwire/docusaurus-plugin-llms-txt
```

## Quick Start

### Basic Setup

Add the plugin to your `docusaurus.config.ts`:

```typescript
import type { Config } from '@docusaurus/types';
import type { PluginOptions } from '@signalwire/docusaurus-plugin-llms-txt/public';

const config: Config = {
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        // Enable with defaults
        generate: {
          enableMarkdownFiles: true,
          enableLlmsFullTxt: false,
        },
        include: {
          includeBlog: false,
          includePages: false,
          includeDocs: true,
        },
      } satisfies PluginOptions,
    ],
  ],
};

export default config;
```

Build your site and the plugin will automatically generate:

- `build/llms.txt` - Hierarchical index of your documentation
- `build/**/*.md` - Individual markdown files for each page (mirrors your route structure)

### Advanced Configuration

```typescript
import type { Config } from '@docusaurus/types';
import type { PluginOptions } from '@signalwire/docusaurus-plugin-llms-txt/public';

const config: Config = {
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        // Markdown file generation options
        markdown: {
          enableFiles: true,
          relativePaths: true,
          includeBlog: true,
          includePages: true,
          includeDocs: true,
          includeVersionedDocs: true,
          excludeRoutes: ['/admin/**', '/internal/**'],
        },

        // llms.txt index file configuration
        llmsTxt: {
          enableLlmsFullTxt: true,
          includeBlog: true,
          includePages: true,
          includeDocs: true,
          excludeRoutes: ['/admin/**'],

          // Site metadata
          siteTitle: 'My Documentation',
          siteDescription: 'Comprehensive documentation for developers',

          // Control heading levels based on route depth
          autoSectionDepth: 1, // depth-1 routes get H2, depth-2 get H3, etc.

          // Section organization
          sections: [
            {
              id: 'getting-started',
              name: 'Getting Started',
              description: 'Quick start guides and tutorials',
              position: 1,
              routes: [{ route: '/docs/intro/**' }],
            },
            {
              id: 'api-reference',
              name: 'API Reference',
              description: 'Complete API documentation',
              position: 2,
              routes: [{ route: '/docs/api/**' }],
              attachments: [
                {
                  source: './api/openapi.yaml',
                  title: 'OpenAPI Specification',
                  description: 'Complete API specification in OpenAPI 3.0 format',
                },
              ],
            },
          ],
        },

        // UI features (requires theme package)
        ui: {
          copyPageContent: {
            buttonLabel: 'Copy Page',
            display: {
              docs: true,
              excludeRoutes: ['/admin/**'],
            },
          },
        },
      } satisfies PluginOptions,
    ],
  ],
};

export default config;
```

## API Reference

The plugin configuration is organized into three main areas: **markdown file generation**,
**llms.txt index creation**, and **UI features**.

### Top-Level Options

These options control plugin behavior and error handling.

| Property         | Type                                           | Required | Default  | Description                                                                                              |
| ---------------- | ---------------------------------------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `markdown`       | [`MarkdownOptions`](#markdownoptions)          | ❌       | `{}`     | Generate individual .md files for each page. See [MarkdownOptions](#markdownoptions) below.              |
| `llmsTxt`        | [`LlmsTxtOptions`](#llmstxtoptions)            | ❌       | `{}`     | Generate llms.txt index file with organized content. See [LlmsTxtOptions](#llmstxtoptions) below.        |
| `ui`             | [`UiOptions`](#uioptions)                      | ❌       | `{}`     | Enable UI features like copy buttons. See [UiOptions](#uioptions) below.                                 |
| `runOnPostBuild` | `boolean`                                      | ❌       | `true`   | Automatically run during build. Set to `false` to manually trigger via CLI.                              |
| `onSectionError` | `'ignore'` \| `'log'` \| `'warn'` \| `'throw'` | ❌       | `'warn'` | How to handle section configuration errors (invalid IDs, route conflicts).                               |
| `onRouteError`   | `'ignore'` \| `'log'` \| `'warn'` \| `'throw'` | ❌       | `'warn'` | How to handle page processing errors (HTML parsing failures). `'warn'` skips failed pages and continues. |
| `logLevel`       | `0` \| `1` \| `2` \| `3`                       | ❌       | `1`      | Console output verbosity. `0`=silent, `1`=normal, `2`=verbose, `3`=debug.                                |

---

### MarkdownOptions

Generate individual .md files for each page.

| Property                     | Type                        | Required | Default                                                                                         | Description                                                                                                                          |
| ---------------------------- | --------------------------- | -------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `enableFiles`                | `boolean`                   | ❌       | `true`                                                                                          | Generate .md files. Disable to skip file generation entirely.                                                                        |
| `relativePaths`              | `boolean`                   | ❌       | `true`                                                                                          | Use relative paths (`./docs/intro.md`) vs absolute URLs (`https://site.com/docs/intro`).                                             |
| `includeDocs`                | `boolean`                   | ❌       | `true`                                                                                          | Include documentation pages.                                                                                                         |
| `includeVersionedDocs`       | `boolean`                   | ❌       | `true`                                                                                          | Include older doc versions. Disable to only process current version.                                                                 |
| `includeBlog`                | `boolean`                   | ❌       | `false`                                                                                         | Include blog posts.                                                                                                                  |
| `includePages`               | `boolean`                   | ❌       | `false`                                                                                         | Include standalone pages from `src/pages/`.                                                                                          |
| `includeGeneratedIndex`      | `boolean`                   | ❌       | `true`                                                                                          | Include auto-generated category index pages.                                                                                         |
| `excludeRoutes`              | `string[]`                  | ❌       | `[]`                                                                                            | Glob patterns to exclude. Example: `['/admin/**', '/internal/**']`                                                                   |
| `contentSelectors`           | `string[]`                  | ❌       | `['.theme-doc-markdown', 'main .container .col', 'main .theme-doc-wrapper', 'article', 'main']` | CSS selectors to find main content. First match wins.                                                                                |
| `routeRules`                 | [`RouteRule[]`](#routerule) | ❌       | `[]`                                                                                            | Override selectors for specific routes. See [RouteRule](#routerule).                                                                 |
| `remarkStringify`            | `object`                    | ❌       | `{}`                                                                                            | Markdown formatting options. See [remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify#options). |
| `remarkGfm`                  | `boolean \| object`         | ❌       | `true`                                                                                          | Enable GitHub Flavored Markdown (tables, strikethrough, task lists).                                                                 |
| `rehypeProcessTables`        | `boolean`                   | ❌       | `true`                                                                                          | Convert HTML tables to markdown. Disable for complex tables.                                                                         |
| `beforeDefaultRehypePlugins` | `PluginInput[]`             | ❌       | `[]`                                                                                            | Custom rehype plugins to run BEFORE defaults.                                                                                        |
| `rehypePlugins`              | `PluginInput[]`             | ❌       | `[]`                                                                                            | Custom rehype plugins that REPLACE defaults. Use with caution.                                                                       |
| `beforeDefaultRemarkPlugins` | `PluginInput[]`             | ❌       | `[]`                                                                                            | Custom remark plugins to run BEFORE defaults.                                                                                        |
| `remarkPlugins`              | `PluginInput[]`             | ❌       | `[]`                                                                                            | Custom remark plugins that REPLACE defaults. Use with caution.                                                                       |

---

### LlmsTxtOptions

Generate and configure the llms.txt index file.

| Property                | Type                                        | Required | Default     | Description                                                                                                        |
| ----------------------- | ------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `enableLlmsFullTxt`     | `boolean`                                   | ❌       | `false`     | Generate llms-full.txt with complete page content (not just links).                                                |
| `includeDocs`           | `boolean`                                   | ❌       | `true`      | Include documentation pages.                                                                                       |
| `includeVersionedDocs`  | `boolean`                                   | ❌       | `false`     | ⚠️ Include older doc versions. **Default is `false`** (different from markdown).                                   |
| `includeBlog`           | `boolean`                                   | ❌       | `false`     | Include blog posts.                                                                                                |
| `includePages`          | `boolean`                                   | ❌       | `false`     | Include standalone pages from `src/pages/`.                                                                        |
| `includeGeneratedIndex` | `boolean`                                   | ❌       | `true`      | Include auto-generated category index pages.                                                                       |
| `excludeRoutes`         | `string[]`                                  | ❌       | `[]`        | Glob patterns to exclude. Example: `['/admin/**', '/internal/**']`                                                 |
| `sections`              | [`SectionDefinition[]`](#sectiondefinition) | ❌       | `[]`        | Organize content into named sections. See [SectionDefinition](#sectiondefinition).                                 |
| `autoSectionDepth`      | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                | ❌       | `1`         | Heading offset: `1`=routes use H2/H3/H4, `2`=routes use H3/H4/H5.                                                  |
| `autoSectionPosition`   | `number`                                    | ❌       | `undefined` | Position for auto-generated sections. `undefined`=after positioned sections, number=sort with positioned sections. |
| `siteTitle`             | `string`                                    | ❌       | `''`        | Title for llms.txt header. Falls back to Docusaurus config if not set.                                             |
| `siteDescription`       | `string`                                    | ❌       | `''`        | Description for llms.txt header.                                                                                   |
| `enableDescriptions`    | `boolean`                                   | ❌       | `true`      | Include page and section descriptions. Disable for a more compact index.                                           |
| `attachments`           | [`AttachmentFile[]`](#attachmentfile)       | ❌       | `[]`        | Include files like OpenAPI specs, schemas. Appear in 'Attachments' section.                                        |
| `optionalLinks`         | [`OptionalLink[]`](#optionallink)           | ❌       | `[]`        | External links (APIs, forums). Appear in 'Optional' section.                                                       |

---

### UiOptions

Enable UI features on your documentation pages.

| Property          | Type                                                              | Required | Default | Description                                                                                                    |
| ----------------- | ----------------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `copyPageContent` | `boolean \| ` [`CopyPageContentOptions`](#copypagecontentoptions) | ❌       | `false` | Add copy button to doc pages. Use `true` for defaults or object for customization. **Requires theme package.** |

---

### Complex Types Reference

These types are used in the configuration options above.

#### SectionDefinition

Organize content into logical sections in llms.txt.

```typescript
{
  id: 'api-docs',                    // Unique kebab-case ID
  name: 'API Documentation',         // Display name
  description: 'Complete API docs',  // Optional context
  position: 1,                       // Sort order (lower = earlier)
  routes: [{ route: '/api/**' }],    // Which pages belong here
  subsections: [],                   // Nested sections
  attachments: [],                   // Section-specific files
  optionalLinks: []                  // Section-specific external links
}
```

| Property        | Type                                  | Required | Description                                                                               |
| --------------- | ------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `id`            | `string`                              | ✅       | Unique identifier (lowercase, numbers, hyphens only). Must be unique across all sections. |
| `name`          | `string`                              | ✅       | Display name shown in llms.txt.                                                           |
| `description`   | `string`                              | ❌       | Optional description shown under heading.                                                 |
| `position`      | `number`                              | ❌       | Sort order. Lower numbers appear first.                                                   |
| `routes`        | [`SectionRoute[]`](#sectionroute)     | ❌       | Glob patterns to match pages to this section.                                             |
| `subsections`   | `SectionDefinition[]`                 | ❌       | Nested sections (max 3 levels recommended).                                               |
| `attachments`   | [`AttachmentFile[]`](#attachmentfile) | ❌       | Files specific to this section.                                                           |
| `optionalLinks` | [`OptionalLink[]`](#optionallink)     | ❌       | External links specific to this section.                                                  |

#### SectionRoute

Assign routes to sections using glob patterns.

```typescript
{
  route: '/api/**',                  // Match all /api/* routes
  contentSelectors: ['.api-content'] // Optional: custom selectors for these pages
}
```

| Property           | Type       | Required | Description                                                |
| ------------------ | ---------- | -------- | ---------------------------------------------------------- |
| `route`            | `string`   | ✅       | Glob pattern (`*` = single level, `**` = multiple levels). |
| `contentSelectors` | `string[]` | ❌       | Override content extraction for these routes.              |

#### RouteRule

Customize content extraction for specific routes (separate from section assignment).

```typescript
{
  route: '/api/**',
  contentSelectors: ['.api-content', 'article']
}
```

| Property           | Type       | Required | Description                           |
| ------------------ | ---------- | -------- | ------------------------------------- |
| `route`            | `string`   | ✅       | Glob pattern matching routes.         |
| `contentSelectors` | `string[]` | ❌       | CSS selectors for content extraction. |

**Note:** Use `RouteRule` (in `markdown.routeRules`) for processing customization. Use
`SectionRoute` (in `sections[].routes`) for section assignment.

#### AttachmentFile

Include external text files in your output.

```typescript
{
  source: './specs/openapi.yaml',
  title: 'API Specification',
  description: 'Complete OpenAPI 3.0 spec',
  fileName: 'api-spec',  // Custom output filename (prevents collisions)
  includeInFullTxt: true
}
```

| Property           | Type      | Default | Description                                                                                      |
| ------------------ | --------- | ------- | ------------------------------------------------------------------------------------------------ |
| `source`           | `string`  | -       | File path relative to site root.                                                                 |
| `title`            | `string`  | -       | Display name in llms.txt.                                                                        |
| `description`      | `string`  | -       | Optional context about the file.                                                                 |
| `fileName`         | `string`  | -       | Custom output filename (without extension). If not provided, uses source filename. Auto-numbered if collision detected. |
| `includeInFullTxt` | `boolean` | `true`  | Include full content in llms-full.txt.                                                           |

#### OptionalLink

Link to external resources.

```typescript
{
  title: 'API Status Page',
  url: 'https://status.example.com',
  description: 'Real-time API status'
}
```

| Property      | Type     | Required | Description                        |
| ------------- | -------- | -------- | ---------------------------------- |
| `title`       | `string` | ✅       | Link text shown in llms.txt.       |
| `url`         | `string` | ✅       | External URL (must be HTTP/HTTPS). |
| `description` | `string` | ❌       | Optional context about the link.   |

#### CopyPageContentOptions

Configure the copy button feature (requires theme package).

```typescript
{
  buttonLabel: 'Copy Page',
  display: {
    docs: true,
    excludeRoutes: ['/admin/**']
  },
  contentStrategy: 'prefer-markdown',
  actions: {
    viewMarkdown: true,
    ai: {
      chatGPT: true,
      claude: { prompt: 'Help me understand this:' }
    }
  }
}
```

| Property                | Type                               | Required | Default             | Description                                                                                                                                                                                                           |
| ----------------------- | ---------------------------------- | -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buttonLabel`           | `string`                           | ❌       | `'Copy Page'`       | Button text.                                                                                                                                                                                                          |
| `display`               | `object`                           | ❌       | `{}`                | Control where button appears.                                                                                                                                                                                         |
| `display.docs`          | `boolean`                          | ❌       | `true`              | Show on docs pages.                                                                                                                                                                                                   |
| `display.excludeRoutes` | `string[]`                         | ❌       | `[]`                | Hide on specific routes (glob patterns).                                                                                                                                                                              |
| `contentStrategy`       | `'prefer-markdown' \| 'html-only'` | ❌       | `'prefer-markdown'` | Controls what content is copied. `'prefer-markdown'` copies markdown if available, falls back to HTML. `'html-only'` always copies HTML. Dropdown menu item shows "Copy Raw Markdown" or "Copy Raw HTML" accordingly. |
| `actions`               | `object`                           | ❌       | `{}`                | Available actions in dropdown.                                                                                                                                                                                        |
| `actions.viewMarkdown`  | `boolean`                          | ❌       | `true`              | Show "View Markdown" option in dropdown when markdown file exists. Independent of `contentStrategy`.                                                                                                                  |
| `actions.ai`            | `object`                           | ❌       | `{}`                | AI integration options.                                                                                                                                                                                               |
| `actions.ai.chatGPT`    | `boolean \| { prompt?: string }`   | ❌       | `true`              | ChatGPT integration. Default prompt: "Analyze this documentation:"                                                                                                                                                    |
| `actions.ai.claude`     | `boolean \| { prompt?: string }`   | ❌       | `true`              | Claude integration. Default prompt: "Analyze this documentation:"                                                                                                                                                     |

MIT © [SignalWire](https://github.com/signalwire)
