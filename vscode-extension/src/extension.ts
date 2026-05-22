import * as vscode from "vscode";

const PLUGIN_ID = "probejs-tsserver-plugin";

function sendConfigToPlugin(config: Record<string, unknown>) {
  vscode.commands.executeCommand("typescript.configurePlugin", {
    pluginId: PLUGIN_ID,
    configuration: config,
  });
}

export function activate(context: vscode.ExtensionContext) {
  console.log("[probejs-tsserver-extension] Activating");

  // Forward VS Code settings to the tsserver plugin on change
  const onConfigChanged = vscode.workspace.onDidChangeConfiguration((e) => {
    if (!e.affectsConfiguration("probejs.tsserver")) {
      return;
    }
    const cfg = vscode.workspace.getConfiguration("probejs.tsserver");
    sendConfigToPlugin({
      filterJavaImports: cfg.get("filterJavaImports"),
    });
  });

  // Push initial config after a short delay (wait for TS server to load the plugin)
  const initTimer = setTimeout(() => {
    const cfg = vscode.workspace.getConfiguration("probejs.tsserver");
    sendConfigToPlugin({
      filterJavaImports: cfg.get("filterJavaImports"),
    });
  }, 3000);

  // Command: reload TS server
  const reloadCmd = vscode.commands.registerCommand("probejs.reloadTsServer", () => {
    vscode.window.showInformationMessage("Reloading TypeScript server...");
    vscode.commands.executeCommand("typescript.restartTsServer");
  });

  context.subscriptions.push(onConfigChanged, reloadCmd, {
    dispose: () => clearTimeout(initTimer),
  });
}

export function deactivate() {
  // Cleanup if needed
}
