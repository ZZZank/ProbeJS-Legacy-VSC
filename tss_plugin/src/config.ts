
export interface PluginConfig {
  /** If true, filter auto-imports from "java:" paths */
  filterJavaImports?: boolean;
  /** If true, redirect "java:" imports to Java.loadClass() calls */
  redirectJavaImports?: boolean;
  /**
   * Template for redirected imports.
   * 
   * Placeholders: {class_name}, {package_name}
   * 
   * Default: const ${class_name} = Java.loadClass("{package_name}.{class_name}")
   */
  redirectTemplate?: string;
}

export const DEFAULT_TEMPLATE = 'const ${class_name} = Java.loadClass("{package_name}.{class_name}");';

export const DEFAULT: PluginConfig = {
  filterJavaImports: true,
  redirectJavaImports: true,
  redirectTemplate: DEFAULT_TEMPLATE,
};
