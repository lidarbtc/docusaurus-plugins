/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * URL construction utilities for copy button functionality
 */

export interface SiteConfig {
  baseUrl: string;
  url: string;
  trailingSlash?: boolean;
}

/**
 * Normalize pathname by removing trailing slash (except root)
 */
function normalizePathname(pathname: string): string {
  // Handle root path
  if (pathname === '' || pathname === '/') {
    return '/index';
  }

  // Remove trailing slash if present (except root)
  if (pathname.endsWith('/') && pathname.length > 1) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

/**
 * Construct relative markdown URL for fetching
 * Example: "/api/intro" → "/api/intro.md"
 */
export function constructMarkdownUrl(pathname: string): string {
  const normalized = normalizePathname(pathname);
  return `${normalized}.md`;
}

/**
 * Construct relative HTML URL for fetching (fallback when markdown unavailable)
 * Handles trailingSlash configuration and index.html cases
 * Examples:
 *   "/api/intro" with trailingSlash=true → "/api/intro/index.html"
 *   "/api/intro" with trailingSlash=false → "/api/intro.html"
 */
export function constructHtmlUrl(
  pathname: string,
  trailingSlash?: boolean
): string {
  const normalized = normalizePathname(pathname);

  // Handle root path
  if (normalized === '/index') {
    return '/index.html';
  }

  // Handle based on trailingSlash configuration
  if (trailingSlash === false) {
    return `${normalized}.html`;
  }

  // Default behavior (trailingSlash: true or undefined)
  return `${normalized}/index.html`;
}

/**
 * Construct full absolute URL for AI prompts
 * Examples:
 *   With markdown: "/api/intro" → "https://site.com/baseUrl/api/intro.md"
 *   Without markdown: "/api/intro" → "https://site.com/baseUrl/api/intro"
 */
export function constructFullUrl(
  pathname: string,
  siteConfig: SiteConfig,
  hasMarkdown = true
): string {
  // If markdown is available, use .md extension, otherwise use the regular path
  const contentPath = hasMarkdown ? constructMarkdownUrl(pathname) : pathname;

  // Remove leading slash from contentPath for joining
  const pathWithoutSlash = contentPath.startsWith('/')
    ? contentPath.slice(1)
    : contentPath;

  // Build full URL: siteUrl + baseUrl + contentPath
  const siteUrl = siteConfig.url.endsWith('/')
    ? siteConfig.url.slice(0, -1)
    : siteConfig.url;
  const baseUrl = siteConfig.baseUrl.startsWith('/')
    ? siteConfig.baseUrl
    : `/${siteConfig.baseUrl}`;

  return `${siteUrl}${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${pathWithoutSlash}`;
}
