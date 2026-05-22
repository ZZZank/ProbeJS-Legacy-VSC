import type * as ts from "typescript";
import { PluginConfig, DEFAULT } from "./config";

const pluginModule: ts.server.PluginModuleFactory = (mod) => {
  const { typescript } = mod;

  let config: PluginConfig = DEFAULT;

  return {
    create(createInfo: ts.server.PluginCreateInfo) {
      config = { ...config, ...createInfo.config }

      const languageService = createInfo.languageService;
      const proxy: ts.LanguageService = Object.assign({}, languageService);

      const origGetCompletionsAtPosition = proxy.getCompletionsAtPosition!.bind(proxy);
      proxy.getCompletionsAtPosition = (fileName, position, options) => {
        const completion = origGetCompletionsAtPosition(fileName, position, options);
        if (!completion) {
          return completion;
        }

        if (config.filterJavaImports) {
          completion.entries = completion.entries.filter((entry) => {
            const source = entry.source;
            if (!source || !source.startsWith("java:")) {
              return true;
            }
            // Only allow names starting with $ and not ending with _
            return entry.name.startsWith("$") && !entry.name.endsWith("_");
          });
        }

        return completion;
      };

      return proxy;
    },
    onConfigurationChanged(newConfig: PluginConfig) {
      config = { ...config, ...newConfig }
    }
  };
};

export = pluginModule;
