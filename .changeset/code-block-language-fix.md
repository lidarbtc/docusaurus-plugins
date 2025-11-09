---
'@signalwire/docusaurus-plugin-llms-txt': patch
---

Fix code block language identifiers lost in MDX components (fixes #20)

Code blocks were losing their language identifiers during HTML → Markdown conversion because Docusaurus places language classes on `<pre>` and wrapper `<div>` elements, not on `<code>` elements. Implemented a custom pre handler that:

- Extracts language from `<pre>` element's className
- Falls back to checking parent element if needed
- Preserves code formatting by converting `<br/>` to newlines
- Handles all edge cases gracefully with proper fallbacks

Tested with 21 programming languages in MDX Tabs and regular code blocks.
