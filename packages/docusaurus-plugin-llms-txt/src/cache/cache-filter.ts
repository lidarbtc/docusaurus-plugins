/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getLlmsTxtIncludeConfig } from '../config';
import { CONTENT_TYPES, DEFAULT_EXCLUDE_ROUTES } from '../constants';
import { createExclusionMatcher } from '../discovery/exclusion-matcher';

import type { IncludeFilterConfig } from '../discovery/content-classifier';
import type { CachedRouteInfo, PluginOptions, Logger } from '../types';

/**
 * Filter cached routes based on include configuration
 * @internal
 */
export function filterCachedRoutesByConfig(
  cachedRoutes: readonly CachedRouteInfo[],
  includeConfig: IncludeFilterConfig,
  logger?: Logger
): CachedRouteInfo[] {
  const isExcludedByPattern = createExclusionMatcher(
    includeConfig.excludeRoutes
  );
  let excludedByType = 0;
  let excludedByVersion = 0;
  let excludedByGenerated = 0;
  let excludedByPattern = 0;

  const filteredRoutes = cachedRoutes.filter((route) => {
    // Apply content type filters
    let shouldIncludeType = false;
    switch (route.contentType) {
      case CONTENT_TYPES.BLOG:
        shouldIncludeType = includeConfig.includeBlog;
        if (!shouldIncludeType) {
          excludedByType += 1;
        }
        break;
      case CONTENT_TYPES.PAGES:
        shouldIncludeType = includeConfig.includePages;
        if (!shouldIncludeType) {
          excludedByType += 1;
        }
        break;
      case CONTENT_TYPES.DOCS:
      case CONTENT_TYPES.UNKNOWN:
      default:
        shouldIncludeType = includeConfig.includeDocs;
        if (!shouldIncludeType) {
          excludedByType += 1;
        }
        break;
    }

    if (!shouldIncludeType) {
      return false;
    }

    // Apply versioned docs filter
    // Only filter out non-latest versions (isLast=false) when
    // includeVersionedDocs=false
    if (route.isVersioned && !includeConfig.includeVersionedDocs) {
      excludedByVersion += 1;
      return false;
    }

    // Apply generated index filter
    if (route.isGeneratedIndex && !includeConfig.includeGeneratedIndex) {
      excludedByGenerated += 1;
      return false;
    }

    // Apply route exclusion patterns
    if (isExcludedByPattern(route.path)) {
      excludedByPattern += 1;
      return false;
    }

    return true;
  });

  // Log filtering statistics if logger provided
  if (logger) {
    const totalExcluded = cachedRoutes.length - filteredRoutes.length;
    if (totalExcluded > 0) {
      logger.debug(
        `Cache filtering: ${filteredRoutes.length}/${cachedRoutes.length} routes included` +
          ` (excluded: ${excludedByType} by type, ${excludedByVersion} by version, ` +
          `${excludedByGenerated} by generated, ${excludedByPattern} by pattern)`
      );
    } else {
      logger.debug(
        `Cache filtering: all ${filteredRoutes.length} routes included`
      );
    }
  }

  return filteredRoutes;
}

/**
 * Filter cached routes for indexing (llms.txt generation)
 * Uses indexing configuration
 */
export function filterCachedRoutesForIndexing(
  cachedRoutes: readonly CachedRouteInfo[],
  config: PluginOptions,
  logger?: Logger
): CachedRouteInfo[] {
  const includeConfig = getLlmsTxtIncludeConfig(config);
  return filterCachedRoutesByConfig(cachedRoutes, includeConfig, logger);
}

/**
 * Filter cached routes for processing (union of generate and indexing)
 * Uses the union of both configs to ensure we have everything needed
 */
export function filterCachedRoutesForProcessing(
  cachedRoutes: readonly CachedRouteInfo[],
  config: PluginOptions,
  logger?: Logger
): CachedRouteInfo[] {
  const markdown = config.markdown ?? {};
  const llmsTxt = config.llmsTxt ?? {};

  // Union of both configs
  const unionConfig: IncludeFilterConfig = {
    includeDocs:
      (markdown.includeDocs ?? true) || (llmsTxt.includeDocs ?? true),
    includeVersionedDocs:
      (markdown.includeVersionedDocs ?? true) ||
      (llmsTxt.includeVersionedDocs ?? false),
    includeBlog:
      (markdown.includeBlog ?? false) || (llmsTxt.includeBlog ?? false),
    includePages:
      (markdown.includePages ?? false) || (llmsTxt.includePages ?? false),
    includeGeneratedIndex:
      (markdown.includeGeneratedIndex ?? true) ||
      (llmsTxt.includeGeneratedIndex ?? true),
    excludeRoutes: [
      ...DEFAULT_EXCLUDE_ROUTES,
      ...(markdown.excludeRoutes ?? []),
      ...(llmsTxt.excludeRoutes ?? []),
    ],
  };

  return filterCachedRoutesByConfig(cachedRoutes, unionConfig, logger);
}

/**
 * @deprecated Use filterCachedRoutesForIndexing or filterCachedRoutesForProcessing
 */
export function filterCachedRoutesForConfig(
  cachedRoutes: readonly CachedRouteInfo[],
  config: PluginOptions,
  logger?: Logger
): CachedRouteInfo[] {
  return filterCachedRoutesForIndexing(cachedRoutes, config, logger);
}

/**
 * Check if cache-based filtering would produce different results than
 * current cache
 * This helps determine if the CLI needs to warn about config changes
 */
export function wouldFilteringChangeCachedRoutes(
  cachedRoutes: readonly CachedRouteInfo[],
  config: PluginOptions
): {
  wouldChange: boolean;
  currentCount: number;
  filteredCount: number;
  changeReason?: string;
} {
  const filteredRoutes = filterCachedRoutesForIndexing(cachedRoutes, config);
  const wouldChange = filteredRoutes.length !== cachedRoutes.length;

  let changeReason: string | undefined;
  if (wouldChange) {
    const diff = cachedRoutes.length - filteredRoutes.length;
    changeReason = `Configuration would exclude ${diff} route(s)`;
  }

  return {
    wouldChange,
    currentCount: cachedRoutes.length,
    filteredCount: filteredRoutes.length,
    changeReason,
  };
}
