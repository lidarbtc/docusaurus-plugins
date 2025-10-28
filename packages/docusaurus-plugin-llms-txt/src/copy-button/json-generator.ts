/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';

import * as fs from 'fs-extra';

import {
  DEFAULT_CONTENT_SELECTORS,
  DEFAULT_EXCLUDE_ROUTES,
} from '../constants';
import { createExclusionMatcher } from '../discovery/exclusion-matcher';

import type { CachedRouteInfo, Logger, PluginOptions } from '../types';

export async function generateCopyContentJson(
  processedRoutes: CachedRouteInfo[],
  filePath: string,
  logger: Logger,
  config: PluginOptions
): Promise<void> {
  try {
    // Get UI config for copy button display settings
    const uiConfig =
      typeof config.ui?.copyPageContent === 'object'
        ? config.ui.copyPageContent
        : {};
    const excludeRoutes = [
      ...DEFAULT_EXCLUDE_ROUTES,
      ...(uiConfig.display?.excludeRoutes ?? []),
    ];

    // Create exclusion matcher for server-side filtering
    const isExcluded = createExclusionMatcher(excludeRoutes);

    // Build data structure: route path → route info with content selectors
    const copyContentData: Record<
      string,
      {
        shouldDisplay: boolean;
        hasMarkdown: boolean;
        contentSelectors: readonly string[];
      }
    > = {};

    for (const route of processedRoutes) {
      copyContentData[route.path] = {
        // Check if route should display button (based on excludeRoutes)
        shouldDisplay: !isExcluded(route.path),
        // Routes with markdownFile have markdown content available
        hasMarkdown: Boolean(route.markdownFile),
        // Always include content selectors for HTML fallback extraction
        // Use route-specific selectors if defined, otherwise use defaults
        contentSelectors: route.contentSelectors ?? DEFAULT_CONTENT_SELECTORS,
      };
    }

    await fs.writeFile(filePath, JSON.stringify(copyContentData, null, 2));

    const filename = path.basename(filePath);
    logger.success(`Generated copy content data file: ${filename}`);
    logger.debug(
      `Copy content data contains ${Object.keys(copyContentData).length} routes`
    );
  } catch (error) {
    logger.error(`Failed to generate copy content data file: ${String(error)}`);
    throw error;
  }
}
