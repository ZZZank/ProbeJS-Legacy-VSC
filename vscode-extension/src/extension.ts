import * as vscode from "vscode";

const PLUGIN_ID = "probejs-tsserver-plugin";

function sendConfigToPlugin(config: Record<string, unknown>) {
  vscode.commands.executeCommand("typescript.configurePlugin", {
    pluginId: PLUGIN_ID,
    configuration: config,
  });
}

function readConfig(): Record<string, unknown> {
  const cfg = vscode.workspace.getConfiguration("probejs.tsserver");
  return {
    filterJavaImports: cfg.get("filterJavaImports"),
    redirectJavaImports: cfg.get("redirectJavaImports"),
  };
}

export function activate(context: vscode.ExtensionContext) {
  console.log("[probejs-tsserver-extension] Activating");

  sendConfigToPlugin(readConfig());

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("probejs.tsserver")) {
        sendConfigToPlugin(readConfig());
      }
    })
  );
}
