/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DEFAULT_EXCLUDE_ROUTES, VALIDATION_MESSAGES } from '../constants';
import { createConfigError } from '../errors';
import { pluginOptionsSchema } from '../types';
import { ensureLeadingSlash } from '../utils';
import { applyGfmConfiguration } from './gfm-resolver';
import { getEffectiveConfigForRoute as getEffectiveConfig } from './route-rules';
import { validateSections } from './section-validator';

import type {
  PluginOptions,
  EffectiveConfig,
  MarkdownOptions,
  LlmsTxtOptions,
  UiOptions,
} from '../types';

/**
 * Processes and validates plugin options, applying defaults
 * Simplified with focused modules
 * @internal
 */
export function getConfig(options: Partial<PluginOptions>): PluginOptions {
  try {
    const validationResult = pluginOptionsSchema.validate(options, {
      abortEarly: false,
    });

    if (validationResult.error) {
      throw validationResult.error;
    }

    const validated = validationResult.value;

    // Validate section configuration (now in llmsTxt config)
    if (validated.llmsTxt?.sections) {
      // Note: validateSections will collect attachments from both
      // global llmsTxt.attachments and section-specific attachments
      validateSections(
        validated.llmsTxt.sections,
        validated.markdown?.routeRules,
        validated.llmsTxt?.attachments
      );
    }

    // Apply GFM configuration
    return applyGfmConfiguration(validated);
  } catch (error) {
    if (error instanceof Error) {
      throw createConfigError(
        `${VALIDATION_MESSAGES.INVALID_CONFIG}: ${error.message}`,
        { originalOptions: options, validationError: error.message }
      );
    }
    throw createConfigError(VALIDATION_MESSAGES.UNKNOWN_ERROR, {
      originalOptions: options,
    });
  }
}

// Re-export security validation from focused module
export { validateUserInputs } from './security-validator';

/**
 * Get markdown generation configuration with defaults applied
 * @internal
 */
export function getMarkdownConfig(
  config: PluginOptions
): Required<MarkdownOptions> {
  const markdown = config.markdown ?? {};
  return {
    enableFiles: markdown.enableFiles ?? true,
    relativePaths: markdown.relativePaths ?? true,
    includeDocs: markdown.includeDocs ?? true,
    includeVersionedDocs: markdown.includeVersionedDocs ?? true,
    includeBlog: markdown.includeBlog ?? false,
    includePages: markdown.includePages ?? false,
    includeGeneratedIndex: markdown.includeGeneratedIndex ?? true,
    excludeRoutes: [
      ...DEFAULT_EXCLUDE_ROUTES,
      ...(markdown.excludeRoutes ?? []),
    ],
    // Content extraction and processing
    contentSelectors: markdown.contentSelectors ?? [],
    routeRules: markdown.routeRules ?? [],
    // Markdown processing options
    remarkStringify: markdown.remarkStringify ?? {},
    remarkGfm: markdown.remarkGfm ?? true,
    rehypeProcessTables: markdown.rehypeProcessTables ?? true,
    // Unified plugin system
    beforeDefaultRehypePlugins: markdown.beforeDefaultRehypePlugins ?? [],
    rehypePlugins: markdown.rehypePlugins ?? [],
    beforeDefaultRemarkPlugins: markdown.beforeDefaultRemarkPlugins ?? [],
    remarkPlugins: markdown.remarkPlugins ?? [],
  };
}

/**
 * Get filtering config for markdown generation
 * @internal
 */
export function getMarkdownIncludeConfig(config: PluginOptions): {
  includeDocs: boolean;
  includeVersionedDocs: boolean;
  includeBlog: boolean;
  includePages: boolean;
  includeGeneratedIndex: boolean;
  excludeRoutes: readonly string[];
} {
  const markdown = config.markdown ?? {};
  return {
    includeDocs: markdown.includeDocs ?? true,
    includeVersionedDocs: markdown.includeVersionedDocs ?? true,
    includeBlog: markdown.includeBlog ?? false,
    includePages: markdown.includePages ?? false,
    includeGeneratedIndex: markdown.includeGeneratedIndex ?? true,
    excludeRoutes: [
      ...DEFAULT_EXCLUDE_ROUTES,
      ...(markdown.excludeRoutes ?? []),
    ],
  };
}

/**
 * Get llms.txt configuration with defaults applied
 * @internal
 */
export function getLlmsTxtConfig(
  config: PluginOptions
): Omit<Required<LlmsTxtOptions>, 'autoSectionPosition'> &
  Pick<LlmsTxtOptions, 'autoSectionPosition'> {
  const llmsTxt = config.llmsTxt ?? {};
  return {
    enableLlmsFullTxt: llmsTxt.enableLlmsFullTxt ?? false,
    includeDocs: llmsTxt.includeDocs ?? true,
    includeVersionedDocs: llmsTxt.includeVersionedDocs ?? false,
    includeBlog: llmsTxt.includeBlog ?? false,
    includePages: llmsTxt.includePages ?? false,
    includeGeneratedIndex: llmsTxt.includeGeneratedIndex ?? true,
    excludeRoutes: [
      ...DEFAULT_EXCLUDE_ROUTES,
      ...(llmsTxt.excludeRoutes ?? []),
    ],
    // Structure and organization
    sections: llmsTxt.sections ?? [],
    siteTitle: llmsTxt.siteTitle ?? '',
    siteDescription: llmsTxt.siteDescription ?? '',
    enableDescriptions: llmsTxt.enableDescriptions ?? true,
    autoSectionDepth: llmsTxt.autoSectionDepth ?? 1,
    autoSectionPosition: llmsTxt.autoSectionPosition,
    optionalLinks: llmsTxt.optionalLinks ?? [],
    // Attachments
    attachments: llmsTxt.attachments ?? [],
  };
}

/**
 * Get filtering config for llms.txt indexing
 * @internal
 */
export function getLlmsTxtIncludeConfig(config: PluginOptions): {
  includeDocs: boolean;
  includeVersionedDocs: boolean;
  includeBlog: boolean;
  includePages: boolean;
  includeGeneratedIndex: boolean;
  excludeRoutes: readonly string[];
} {
  const llmsTxt = config.llmsTxt ?? {};
  return {
    includeDocs: llmsTxt.includeDocs ?? true,
    includeVersionedDocs: llmsTxt.includeVersionedDocs ?? false,
    includeBlog: llmsTxt.includeBlog ?? false,
    includePages: llmsTxt.includePages ?? false,
    includeGeneratedIndex: llmsTxt.includeGeneratedIndex ?? true,
    excludeRoutes: [
      ...DEFAULT_EXCLUDE_ROUTES,
      ...(llmsTxt.excludeRoutes ?? []),
    ],
  };
}

/**
 * Get UI configuration with defaults applied
 * @internal
 */
export function getUiConfig(config: PluginOptions): Required<UiOptions> {
  const ui = config.ui ?? {};
  return {
    copyPageContent: ui.copyPageContent ?? false,
  };
}

/**
 * Collect all attachments from config (global + section-specific) with
 * their sectionIds
 * @internal
 */
export function collectAllAttachments(
  config: PluginOptions
): Array<import('../types').AttachmentFile & { sectionId: string }> {
  const llmsTxt = config.llmsTxt ?? {};
  const attachmentsWithSections: Array<
    import('../types').AttachmentFile & { sectionId: string }
  > = [];

  // Helper to recursively collect from sections
  function collectFromSections(
    sections: readonly import('../types').SectionDefinition[] | undefined
  ): void {
    if (!sections) {
      return;
    }

    for (const section of sections) {
      // Add section-specific attachments
      if (section.attachments) {
        for (const attachment of section.attachments) {
          attachmentsWithSections.push({
            ...attachment,
            sectionId: section.id,
          });
        }
      }

      // Recursively collect from subsections
      if (section.subsections) {
        collectFromSections(section.subsections);
      }
    }
  }

  // Collect from all sections (including subsections)
  collectFromSections(llmsTxt.sections);

  // Add global attachments (they get their own auto-generated section)
  if (llmsTxt.attachments) {
    for (const attachment of llmsTxt.attachments) {
      attachmentsWithSections.push({
        ...attachment,
        sectionId: 'attachments', // Auto-generated section ID for global attachments
      });
    }
  }

  return attachmentsWithSections;
}

/**
 * Gets config effective for a specific route, applying any matching route rules
 * Uses new section-based route resolution with precedence logic
 * @internal
 */
export function getEffectiveConfigForRoute(
  relPath: string,
  config: PluginOptions,
  routeSegment?: string
): EffectiveConfig {
  const matchPath = ensureLeadingSlash(relPath);
  // Use new route resolution logic
  return getEffectiveConfig(matchPath, config, routeSegment);
}
