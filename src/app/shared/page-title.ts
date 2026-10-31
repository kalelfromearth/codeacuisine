/** The name that ends every page title. */
export const APP_NAME = 'Code à Cuisine';

/** Returns the title for the browser tab, for example "Cookbook – Code à Cuisine". */
export function buildPageTitle(pageName: string): string {
  return `${pageName} – ${APP_NAME}`;
}
