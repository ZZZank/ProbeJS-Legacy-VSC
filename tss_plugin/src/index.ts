import type * as ts from "typescript";
import { PluginConfig, DEFAULT } from "./config";

// const { $LevelChunk } = require("java:net/minecraft/world/level/chunk")
const MATCH_REQUIRE_IMPORT = /const\s+{\s*\$[^}]+\s*}\s*=\s*require\("[^"]+"\)/;

/**
 * Derive full Java class from module specifier and variable name.
 * 
 * "java:some/java/pkg" + "$XXX" → "some.java.pkg.XXX"
 */
function javaClassName(moduleSpecifier: string, variableName: string): string {
  const pkg = moduleSpecifier.startsWith("java:")
    ? moduleSpecifier.slice(5).replace(/\//g, ".")
    : moduleSpecifier;
  const cls = variableName.startsWith("$")
    ? variableName.slice(1)
    : variableName;
  return pkg + "." + cls;
}

const pluginModule: ts.server.PluginModuleFactory = (mod) => {
  const { typescript } = mod;

  let config: PluginConfig = DEFAULT;

  return {
    create(createInfo: ts.server.PluginCreateInfo) {
      config = { ...config, ...createInfo.config };

      const logger = createInfo.project.projectService.logger

      const languageService = createInfo.languageService;
      const proxy: ts.LanguageService = Object.assign({}, languageService);

      // --- Filter step: remove java: entries that break naming rules ---
      const origGetCompletionsAtPosition =
        proxy.getCompletionsAtPosition!.bind(proxy);
      proxy.getCompletionsAtPosition = (fileName, position, options) => {
        const completion = origGetCompletionsAtPosition(
          fileName,
          position,
          options,
        );
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

      // --- Redirect step: replace java: import edits with Java.loadClass() ---
      const origGetCompletionEntryDetails =
        proxy.getCompletionEntryDetails!.bind(proxy);
      proxy.getCompletionEntryDetails = (
        fileName,
        position,
        entryName,
        formatOptions,
        source,
        preferences,
        data,
      ) => {
        const details = origGetCompletionEntryDetails(
          fileName,
          position,
          entryName,
          formatOptions,
          source,
          preferences,
          data,
        );
        if (!data || !details || !config.redirectJavaImports) {
          return details;
        }

        // Source may come directly or via CompletionEntryData
        const specifier = source || data?.moduleSpecifier;
        if (!specifier?.startsWith("java:")) {
          return details;
        }

        for (const codeAction of details.codeActions ?? []) {
          for (const change of codeAction.changes) {
            change.textChanges = change.textChanges.map(textChange => {
              if (MATCH_REQUIRE_IMPORT.test(textChange.newText)) {
                return {
                  newText: `const ${entryName} = Java.loadClass("${javaClassName(specifier, entryName)}");`,
                  span: textChange.span
                }
              }
              return textChange
            })
          }
        }

        return details;
      };

      return proxy;
    },
    onConfigurationChanged(newConfig: PluginConfig) {
      config = { ...config, ...newConfig };
    },
  };
};

export = pluginModule;
