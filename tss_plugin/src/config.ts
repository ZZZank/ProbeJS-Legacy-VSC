
export interface PluginConfig {
  /** If true, filter auto-imports from "java:" paths */
  filterJavaImports?: boolean;
  /** If true, redirect "java:" imports to Java.loadClass() calls */
  redirectJavaImports?: boolean;
}

export const DEFAULT: PluginConfig = {
  filterJavaImports: true,
  redirectJavaImports: true,
};
