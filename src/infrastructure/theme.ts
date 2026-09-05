export type ThemePreference = "system" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "nexus-writer.theme"

export type ThemeStorage = {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
}

type ThemeRoot = {
    dataset: {
        theme?: string
    }
}

export function parseThemePreference(value: string | null): ThemePreference {
    return value === "light" || value === "dark" || value === "system"
        ? value
        : "system"
}

export function readThemePreference(storage: Pick<ThemeStorage, "getItem">): ThemePreference {
    try {
        return parseThemePreference(storage.getItem(THEME_STORAGE_KEY))
    } catch {
        return "system"
    }
}

export function persistThemePreference(
    storage: Pick<ThemeStorage, "setItem">,
    preference: ThemePreference,
): void {
    try {
        storage.setItem(THEME_STORAGE_KEY, preference)
    } catch {
        // Theme persistence is a progressive enhancement. A blocked storage
        // API must never prevent the application from rendering.
    }
}

export function resolveTheme(
    preference: ThemePreference,
    prefersDark: boolean,
): ResolvedTheme {
    if (preference === "system") {
        return prefersDark ? "dark" : "light"
    }

    return preference
}

export function applyThemePreference(
    preference: ThemePreference,
    prefersDark: boolean,
    root: ThemeRoot = document.documentElement,
): ResolvedTheme {
    const resolved = resolveTheme(preference, prefersDark)
    root.dataset.theme = resolved
    return resolved
}

export function readBrowserThemePreference(): ThemePreference {
    try {
        return readThemePreference(window.localStorage)
    } catch {
        return "system"
    }
}

export function persistBrowserThemePreference(preference: ThemePreference): void {
    try {
        persistThemePreference(window.localStorage, preference)
    } catch {
        // See persistThemePreference: storage failure cannot be fatal UI state.
    }
}

export function applyInitialTheme(): ResolvedTheme {
    const preference = readBrowserThemePreference()
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    return applyThemePreference(preference, prefersDark)
}
