/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Element, Parents } from 'hast';
import type { State } from 'hast-util-to-mdast';
import type { Code } from 'mdast';

/**
 * Extracts language identifier from className array.
 * Looks for classes starting with 'language-' and extracts the language part.
 *
 * @param className - Array of class names from the element
 * @returns Language identifier or null if not found
 */
function extractLanguage(className: unknown): string | null {
  if (!Array.isArray(className)) {
    return null;
  }

  for (const cls of className) {
    if (typeof cls === 'string' && cls.startsWith('language-')) {
      return cls.replace('language-', '');
    }
  }

  return null;
}

/**
 * Extracts text content from a hast node and its children,
 * converting <br/> elements to newlines.
 *
 * @param node - The hast node to extract text from
 * @returns The text content with preserved line breaks
 */
function extractText(node: Element | { type: string; value?: string }): string {
  // Text nodes have a value property
  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }

  // Element nodes - check if it's a <br/> tag
  if ('tagName' in node && node.tagName === 'br') {
    return '\n';
  }

  // Recursively extract text from children
  if ('children' in node && Array.isArray(node.children)) {
    return node.children
      .map((child: Element | { type: string; value?: string }) =>
        extractText(child)
      )
      .join('');
  }

  return '';
}

/**
 * Custom handler for <pre> elements to preserve code block
 * language identifiers.
 *
 * Docusaurus places language classes on <pre> and parent <div> elements,
 * but not on <code> elements. The default rehype-remark handler only
 * checks <code> elements, causing language identifiers to be lost.
 *
 * This handler:
 * 1. Checks if <pre> contains a <code> child
 * 2. Extracts language from <pre> element's className
 * 3. Falls back to checking parent element if needed
 * 4. Extracts code content from <code> element
 * 5. Returns proper mdast code node with language preserved
 *
 * @param state - Handler state from hast-util-to-mdast
 * @param node - The <pre> element from the hast tree
 * @param parent - The parent element (optional)
 * @returns An mdast code node with language identifier
 */
export function handlePreElement(
  state: State,
  node: Element,
  parent?: Parents
): Code | void {
  // Verify this is a pre element
  if (node.tagName !== 'pre') {
    return undefined;
  }

  // Find the code element child
  const codeElement = node.children?.find(
    (child): child is Element =>
      typeof child === 'object' &&
      child !== null &&
      'type' in child &&
      child.type === 'element' &&
      'tagName' in child &&
      child.tagName === 'code'
  );

  if (!codeElement) {
    // No code element found, let default handler process it
    return undefined;
  }

  // Try to extract language from pre element first
  let lang = extractLanguage(node.properties?.className);

  // If not found on pre, check parent element (Docusaurus wrapper div)
  if (!lang && parent && parent.type === 'element') {
    lang = extractLanguage(parent.properties?.className);
  }

  // Extract the code content from the code element
  const value = extractText(codeElement);

  // Return mdast code node with language (or null if not found)
  return {
    type: 'code',
    lang,
    meta: null,
    value,
  };
}
