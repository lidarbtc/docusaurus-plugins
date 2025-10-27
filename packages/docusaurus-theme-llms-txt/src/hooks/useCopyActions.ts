/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useState } from 'react';

import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

import {
  constructFullUrl,
  constructMarkdownUrl,
  type SiteConfig,
} from '../utils/copyButton';

import type { ResolvedCopyPageContentOptions } from './useCopyButtonConfig';

/**
 * Extract content from current DOM using CSS selectors
 * Returns text content from the first matching element
 */
function extractContentFromDom(selectors: readonly string[]): string | null {
  // Try each selector in order
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Return the text content of the first matching element
      return element.textContent || null;
    }
  }

  // Fallback: try to find main content areas
  const fallbackSelectors = ['main', '.main-wrapper', '#__docusaurus'];
  for (const selector of fallbackSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent || null;
    }
  }

  return null;
}

export default function useCopyActions(
  finalConfig: ResolvedCopyPageContentOptions,
  siteConfig: SiteConfig | undefined,
  setIsOpen: (isOpen: boolean) => void,
  hasMarkdown?: boolean,
  contentSelectors?: readonly string[]
): {
  copyStatus: 'idle' | 'success' | 'error';
  handleAction: (action: string) => Promise<void>;
} {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );
  const location = useLocation();
  // Docusaurus strips baseUrl from location.pathname, so we use it directly
  // for relative fetches (which are served with baseUrl by the server)
  const pathname = location.pathname;
  // For constructing full absolute URLs, we need to add baseUrl back
  const pathnameWithBase = useBaseUrl(pathname);

  const handleAction = async (action: string) => {
    setIsOpen(false);

    if (action === 'copyRaw') {
      // Copy content using ClipboardItem with Promise
      // This approach works across all modern browsers and maintains
      // user gesture context required by Safari
      try {
        let textPromise: Promise<Blob>;

        // Check contentStrategy - if html-only, always fetch HTML
        const shouldFetchMarkdown =
          finalConfig.contentStrategy === 'prefer-markdown' && hasMarkdown;

        if (shouldFetchMarkdown) {
          // Fetch markdown content directly
          // Use pathnameWithBase for proper routing with baseUrl
          const markdownUrl = constructMarkdownUrl(pathnameWithBase);
          textPromise = fetch(markdownUrl)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch markdown: ${response.status}`);
              }
              return response.text();
            })
            .then((text) => new Blob([text], { type: 'text/plain' }));
        } else {
          // No markdown available - extract content from current DOM
          // We're already on the HTML page, so just query the DOM directly
          console.debug('No markdown available, extracting from current DOM');

          // Extract content directly from document using selectors
          const extracted =
            contentSelectors && contentSelectors.length > 0
              ? extractContentFromDom(contentSelectors)
              : document.body.innerText;

          textPromise = Promise.resolve(
            new Blob([extracted || document.body.innerText], {
              type: 'text/plain',
            })
          );
        }

        // Create ClipboardItem with the promise
        const clipboardItem = new ClipboardItem({
          'text/plain': textPromise,
        });

        // Write to clipboard (no await to maintain user gesture context)
        navigator.clipboard
          .write([clipboardItem])
          .then(() => {
            setCopyStatus('success');
            setTimeout(() => setCopyStatus('idle'), 2000);
          })
          .catch((error) => {
            console.error('Copy action failed:', error);
            setCopyStatus('error');
            setTimeout(() => setCopyStatus('idle'), 3000);
          });
      } catch (error) {
        console.error('Copy action failed:', error);
        setCopyStatus('error');
        setTimeout(() => setCopyStatus('idle'), 3000);
      }
    } else if (action === 'viewMarkdown') {
      // Open markdown file in new tab using relative URL
      // Use pathnameWithBase which includes baseUrl for proper routing
      const markdownUrl = constructMarkdownUrl(pathnameWithBase);
      window.open(markdownUrl, '_blank');
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else if (action === 'openChatGPT' && siteConfig) {
      // Open ChatGPT with content and search hints enabled
      // Use pathnameWithBase which includes baseUrl for full URL construction
      const fullUrl = constructFullUrl(
        pathnameWithBase,
        siteConfig,
        hasMarkdown
      );
      const encodedPrompt = encodeURIComponent(
        `${finalConfig.chatGPT.prompt} ${fullUrl}`
      );
      const chatUrl = `https://chatgpt.com/?hints=search&prompt=${encodedPrompt}`;
      window.open(chatUrl, '_blank');
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else if (action === 'openClaude' && siteConfig) {
      // Open Claude with content
      // Use pathnameWithBase which includes baseUrl for full URL construction
      const fullUrl = constructFullUrl(
        pathnameWithBase,
        siteConfig,
        hasMarkdown
      );
      const encodedPrompt = encodeURIComponent(
        `${finalConfig.claude.prompt} ${fullUrl}`
      );
      const claudeUrl = `https://claude.ai/new?q=${encodedPrompt}`;
      window.open(claudeUrl, '_blank');
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return {
    copyStatus,
    handleAction,
  };
}
