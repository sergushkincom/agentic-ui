/** Persisted theme choice. "system" leaves the document unset so the media query in tokens.css applies. */
export const THEME_STORAGE_KEY = "agentic-ui-theme";

export const THEME_CHOICES = ["system", "light", "dark"] as const;

export type ThemeChoice = (typeof THEME_CHOICES)[number];

export function parseThemeChoice(value: string | null): ThemeChoice {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}

/** Attribute to set on `<html>`, or null when the system preference should win. */
export function themeDataset(choice: ThemeChoice): "light" | "dark" | null {
  if (choice === "light" || choice === "dark") return choice;
  return null;
}

/**
 * Runs before paint from the root layout. Only an explicit light or dark choice is applied.
 * A missing key, "system", or a storage failure leaves the system preference in place.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
