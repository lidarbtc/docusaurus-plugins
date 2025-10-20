/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useState } from 'react';

import { useLocation } from '@docusaurus/router';

import {
  constructMarkdownUrl,
  constructHtmlUrl,
  constructFullUrl,
  type SiteConfig,
} from '../utils/copyButton';
import { extractHtmlContent } from '../utils/htmlExtractor';

import type { ResolvedCopyPageContentOptions } from './useCopyButtonConfig';

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
  const pathname = location.pathname;

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
          const markdownUrl = constructMarkdownUrl(pathname);
          textPromise = fetch(markdownUrl)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch markdown: ${response.status}`);
              }
              return response.text();
            })
            .then((text) => new Blob([text], { type: 'text/plain' }));
        } else {
          // No markdown available - fetch and extract HTML content
          const htmlUrl = constructHtmlUrl(
            pathname,
            siteConfig?.trailingSlash
          );
          console.debug('No markdown available, fetching HTML content');

          textPromise = fetch(htmlUrl)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch HTML: ${response.status}`);
              }
              return response.text();
            })
            .then((html) => {
              // Extract content using selectors
              const extracted =
                contentSelectors && contentSelectors.length > 0
                  ? extractHtmlContent(html, contentSelectors)
                  : null;
              return new Blob([extracted || html], { type: 'text/plain' });
            });
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
    } else if (action === 'viewMarkdown' && siteConfig) {
      // Open markdown file in new tab
      const markdownUrl = constructMarkdownUrl(pathname);
      const fullUrl = `${siteConfig.url}${siteConfig.baseUrl}${markdownUrl.startsWith('/') ? markdownUrl.slice(1) : markdownUrl}`;
      window.open(fullUrl, '_blank');
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else if (action === 'openChatGPT' && siteConfig) {
      // Open ChatGPT with content and search hints enabled
      const fullUrl = constructFullUrl(pathname, siteConfig, hasMarkdown);
      const encodedPrompt = encodeURIComponent(
        `${finalConfig.chatGPT.prompt} ${fullUrl}`
      );
      const chatUrl = `https://chatgpt.com/?hints=search&prompt=${encodedPrompt}`;
      window.open(chatUrl, '_blank');
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else if (action === 'openClaude' && siteConfig) {
      // Open Claude with content
      const fullUrl = constructFullUrl(pathname, siteConfig, hasMarkdown);
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
