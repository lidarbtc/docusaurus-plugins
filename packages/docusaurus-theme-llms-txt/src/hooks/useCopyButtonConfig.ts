/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useMemo } from 'react';

import type { CopyPageContentOptions } from '../types/copyButton';

// Resolved configuration type
export interface ResolvedCopyPageContentOptions {
  buttonLabel: string;
  display: {
    docs: boolean;
    excludeRoutes: readonly string[];
  };
  contentStrategy: 'prefer-markdown' | 'html-only';
  viewMarkdown: boolean;
  chatGPT: { enabled: boolean; prompt: string };
  claude: { enabled: boolean; prompt: string };
}

// Default configuration
const DEFAULT_CONFIG: ResolvedCopyPageContentOptions = {
  buttonLabel: 'Copy Page',
  display: {
    docs: true,
    excludeRoutes: [],
  },
  contentStrategy: 'prefer-markdown',
  viewMarkdown: true,
  chatGPT: {
    enabled: true,
    prompt: 'Analyze this documentation:',
  },
  claude: {
    enabled: true,
    prompt: 'Analyze this documentation:',
  },
};

/**
 * Hook to resolve configuration from plugin config
 */
export default function useCopyButtonConfig(
  pluginConfig: boolean | CopyPageContentOptions | undefined
): ResolvedCopyPageContentOptions {
  // Memoize configuration merging to prevent unnecessary recalculations
  return useMemo(() => {
    let baseConfig = { ...DEFAULT_CONFIG };

    // Merge plugin configuration
    if (pluginConfig && typeof pluginConfig === 'object') {
      baseConfig = {
        buttonLabel: pluginConfig.buttonLabel ?? baseConfig.buttonLabel,
        display: {
          docs: pluginConfig.display?.docs ?? baseConfig.display.docs,
          excludeRoutes: pluginConfig.display?.excludeRoutes ?? baseConfig.display.excludeRoutes,
        },
        contentStrategy: pluginConfig.contentStrategy ?? baseConfig.contentStrategy,
        viewMarkdown: pluginConfig.actions?.viewMarkdown ?? baseConfig.viewMarkdown,
        chatGPT: {
          enabled: (() => {
            if (typeof pluginConfig.actions?.ai?.chatGPT === 'boolean') {
              return pluginConfig.actions.ai.chatGPT;
            }
            if (
              pluginConfig.actions?.ai?.chatGPT &&
              typeof pluginConfig.actions.ai.chatGPT === 'object'
            ) {
              return true;
            }
            return baseConfig.chatGPT.enabled;
          })(),
          prompt:
            pluginConfig.actions?.ai?.chatGPT &&
            typeof pluginConfig.actions.ai.chatGPT === 'object'
              ? (pluginConfig.actions.ai.chatGPT.prompt ??
                baseConfig.chatGPT.prompt)
              : baseConfig.chatGPT.prompt,
        },
        claude: {
          enabled: (() => {
            if (typeof pluginConfig.actions?.ai?.claude === 'boolean') {
              return pluginConfig.actions.ai.claude;
            }
            if (
              pluginConfig.actions?.ai?.claude &&
              typeof pluginConfig.actions.ai.claude === 'object'
            ) {
              return true;
            }
            return baseConfig.claude.enabled;
          })(),
          prompt:
            pluginConfig.actions?.ai?.claude &&
            typeof pluginConfig.actions.ai.claude === 'object'
              ? (pluginConfig.actions.ai.claude.prompt ??
                baseConfig.claude.prompt)
              : baseConfig.claude.prompt,
        },
      };
    }

    return baseConfig;
  }, [pluginConfig]);
}
