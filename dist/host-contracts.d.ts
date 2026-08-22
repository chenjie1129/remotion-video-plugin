import type { Context } from '@deepseek-ai/cordis';
export interface ToolExecutionContext {
    signal: AbortSignal;
    agent?: {
        session: {
            header: {
                cwd: string;
            };
        };
    };
}
interface CollectedRead {
    text: string;
    lossy: boolean;
}
interface CollectedReader {
    readFrom(offset: number): CollectedRead;
}
interface SubprocessHandle {
    done: Promise<{
        exitCode: number | null;
        signal: NodeJS.Signals | null;
    }>;
    collected: {
        stdout?: CollectedReader;
        stderr?: CollectedReader;
    };
}
export interface SubprocessSpawnSpec {
    argv: readonly string[];
    cwd: string;
    stdio: {
        stdin: 'ignore';
        stdout: {
            maxBytes: number;
        };
        stderr: {
            maxBytes: number;
        };
    };
    graceMs: number;
    signal?: AbortSignal;
    env?: NodeJS.ProcessEnv;
}
interface SubprocessRuntime {
    resolveExecutable(command: string, env?: Readonly<Record<string, string>>, signal?: AbortSignal): Promise<string>;
    spawn(spec: SubprocessSpawnSpec): SubprocessHandle;
}
interface ToolResult {
    content: unknown[];
    isError: boolean;
    meta?: unknown;
}
interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    output: {
        schema: unknown;
        render(args: unknown, value: unknown): unknown[];
        presentationMeta?(args: unknown, value: unknown): unknown;
    };
    execute(args: unknown, exec: ToolExecutionContext): Promise<unknown>;
    timeoutMs?: number;
    presentCall?(args: unknown): unknown;
    presentResult?(args: unknown, result: ToolResult): unknown;
}
interface ToolRegistry {
    register(definition: ToolDefinition): () => void;
}
export type HarnessContext = Context & {
    tools: ToolRegistry;
    subprocess: SubprocessRuntime;
};
interface ToolOptions<Value> {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    output: {
        schema: unknown;
        render(args: Record<string, unknown>, value: Value): unknown[];
        presentationMeta?(args: Record<string, unknown>, value: Value): unknown;
    };
    execute(args: Record<string, unknown>, exec: ToolExecutionContext): Promise<Value>;
    timeoutMs?: number;
    presentCall?(args: Record<string, unknown>): unknown;
    presentResult?(args: Record<string, unknown>, result: ToolResult): unknown;
}
/**
 * Define the public Harness ToolDefinition shape without loading another copy
 * of the host registry package. Raw tool definitions validate their own input;
 * this wrapper enforces the root object and each tool validates its fields.
 */
export declare function defineRemotionTool<Value>(options: ToolOptions<Value>): ToolDefinition;
export {};
//# sourceMappingURL=host-contracts.d.ts.map