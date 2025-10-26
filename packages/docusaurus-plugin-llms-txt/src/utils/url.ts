/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { normalizeUrl } from '@docusaurus/utils';

import { INDEX_MD } from '../constants';

/**
 * Ensure a path starts with a forward slash
 * @internal
 */
export function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Remove leading slash from a path
 * @internal
 */
export function removeLeadingSlash(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path;
}

/**
 * Strip baseUrl from a route path
 * @internal
 *
 * @param routePath - The full route path (e.g., "/my-project/docs/intro")
 * @param baseUrl - The site's baseUrl (e.g., "/my-project/")
 * @returns The path without baseUrl (e.g., "/docs/intro")
 */
export function stripBaseUrl(routePath: string, baseUrl: string): string {
  // Handle root baseUrl case
  if (!baseUrl || baseUrl === '/') {
    return routePath;
  }

  // Normalize baseUrl using Docusaurus's utility
  // This ensures proper leading/trailing slash handling
  const normalizedBase = normalizeUrl([baseUrl]);

  // Extract pathname from baseUrl if it's a full URL
  let basePathname = normalizedBase;
  try {
    const url = new URL(normalizedBase);
    basePathname = url.pathname;
  } catch {
    // Not a full URL, use as-is
  }

  // Remove trailing slash for comparison
  const baseForComparison = basePathname.replace(/\/$/, '');

  // If route starts with baseUrl pathname, remove it
  if (routePath.startsWith(baseForComparison)) {
    const stripped = routePath.slice(baseForComparison.length);
    // Ensure the result starts with / or is empty for root
    if (stripped === '') {
      return '/';
    }
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }

  return routePath;
}

/**
 * Centralized URL formatting that handles all edge cases consistently
 * @internal
 *
 * @param routePath - Document route path (always starts with /)
 * @param options - URL formatting options
 * @param baseUrl - Base URL for absolute paths
 * @returns Properly formatted URL
 */
export function formatUrl(
  routePath: string,
  options: {
    enableFiles?: boolean;
    relativePaths?: boolean;
    markdownFile?: string;
  },
  baseUrl = ''
): string {
  const { enableFiles = true, relativePaths = true, markdownFile } = options;

  // Ensure route path starts with /
  let targetPath = ensureLeadingSlash(routePath);

  // Use markdown file path if available and enabled
  if (enableFiles && markdownFile) {
    // Ensure markdown file path starts with / for consistency
    targetPath = ensureLeadingSlash(markdownFile);
  } else if (enableFiles) {
    // Remove trailing slash before adding .md extension to prevent /.md
    const pathForExtension = targetPath.endsWith('/') && targetPath !== '/'
      ? targetPath.slice(0, -1)
      : targetPath;
    // Add .md extension to route path
    targetPath = pathForExtension === '/' ? INDEX_MD : `${pathForExtension}.md`;
  }

  // Handle absolute vs relative paths
  if (relativePaths === false && baseUrl) {
    // Strip baseUrl if it's already in the path to prevent duplication
    const pathWithoutBase = stripBaseUrl(targetPath, baseUrl);
    return normalizeUrl([baseUrl, pathWithoutBase]);
  }

  // For relative paths with baseUrl, ensure baseUrl path is included
  if (relativePaths === true && baseUrl) {
    // Extract pathname from baseUrl if it's a full URL
    let basePathname = baseUrl;
    try {
      const url = new URL(baseUrl);
      basePathname = url.pathname;
    } catch {
      // Not a full URL, use as-is
    }

    // Normalize baseUrl pathname
    basePathname = normalizeUrl([basePathname]);
    const baseForComparison = basePathname.replace(/\/$/, '');

    // If targetPath doesn't start with baseUrl pathname, prepend it
    if (baseForComparison !== '/' && !targetPath.startsWith(baseForComparison)) {
      return normalizeUrl([basePathname, targetPath]);
    }
  }

  // For relative paths, ensure we preserve the leading slash
  // normalizeUrl can sometimes remove it, so we handle it explicitly
  return targetPath;
}
