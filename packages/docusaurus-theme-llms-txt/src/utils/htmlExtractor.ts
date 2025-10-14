/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Extract content from HTML string using CSS selectors (browser-only)
 * This is a simplified version of the backend extractContent function
 * that works in the browser using DOMParser
 */
export function extractHtmlContent(
  html: string,
  selectors: readonly string[] = []
): string | null {
  // Parse HTML string into DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Try each selector in order
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      // Return the HTML content of the first matching element
      return element.innerHTML || null;
    }
  }

  // Fallback: try to find main content areas
  const fallbackSelectors = ['main', '.main-wrapper', '#__docusaurus', 'body'];
  for (const selector of fallbackSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      return element.innerHTML || null;
    }
  }

  return null;
}
