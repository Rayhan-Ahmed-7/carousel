export interface PluginContext {
  on(event: string, fn: (payload: unknown) => void): () => void;
  emit(event: string, payload: unknown): void;
  api: Record<string, unknown>;
}

export interface Plugin {
  readonly name: string;
  install(ctx: PluginContext): void;
  uninstall?(ctx: PluginContext): void;
}
