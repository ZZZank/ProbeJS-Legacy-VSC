
export interface PluginConfig {
  /** If true, filter auto-imports from "java:" paths */
  filterJavaImports?: boolean;
}

export const DEFAULT: PluginConfig = {
  filterJavaImports: true,
};
