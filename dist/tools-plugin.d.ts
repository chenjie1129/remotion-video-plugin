/**
 * Workspace-confined Remotion execution tools for DeepSeek Harness.
 *
 * @module @chenjie1129/dsh-remotion-video-plugin/tools
 */
import type { Context } from '@deepseek-ai/cordis';
import { type ToolsConfig } from './remotion-runtime.js';
export type { ToolsConfig } from './remotion-runtime.js';
export declare const name = "remotion-video-tools";
export declare const inject: string[];
/** Register the five safe Remotion workflow tools. */
export declare function apply(baseCtx: Context, rawConfig?: ToolsConfig): void;
//# sourceMappingURL=tools-plugin.d.ts.map