import type { Plugin, PluginContext } from "./Plugin.ts";

export class PluginManager {
  private plugins = new Map<string, Plugin>();

  constructor(private ctx: PluginContext) {}

  install(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) return;
    this.plugins.set(plugin.name, plugin);
    plugin.install(this.ctx);
  }

  uninstall(name: string): void {
    const p = this.plugins.get(name);
    if (!p) return;
    p.uninstall?.(this.ctx);
    this.plugins.delete(name);
  }

  uninstallAll(): void {
    for (const name of Array.from(this.plugins.keys())) this.uninstall(name);
  }
}
