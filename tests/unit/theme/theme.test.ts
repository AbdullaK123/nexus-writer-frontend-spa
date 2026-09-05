import { describe, expect, test, vi } from "vitest"
import {
    THEME_STORAGE_KEY,
    applyThemePreference,
    parseThemePreference,
    persistThemePreference,
    readThemePreference,
    resolveTheme,
} from "../../../src/infrastructure/theme"

describe("theme preference", () => {
    test.each([
        ["light", "light"],
        ["dark", "dark"],
        ["system", "system"],
        [null, "system"],
        ["garbage", "system"],
    ] as const)("parses %s as %s", (raw, expected) => {
        expect(parseThemePreference(raw)).toBe(expected)
    })

    test("reads the last persisted preference for public routes", () => {
        const storage = {
            getItem: vi.fn(() => "dark"),
        }

        expect(readThemePreference(storage)).toBe("dark")
        expect(storage.getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY)
    })

    test("falls back to system when storage cannot be read", () => {
        const storage = {
            getItem: vi.fn(() => {
                throw new Error("blocked")
            }),
        }

        expect(readThemePreference(storage)).toBe("system")
    })

    test("persists the authenticated server preference locally", () => {
        const storage = {
            setItem: vi.fn(),
        }

        persistThemePreference(storage, "dark")

        expect(storage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, "dark")
    })

    test("storage write failures never become rendering failures", () => {
        const storage = {
            setItem: vi.fn(() => {
                throw new Error("quota")
            }),
        }

        expect(() => persistThemePreference(storage, "dark")).not.toThrow()
    })
})

describe("theme resolution", () => {
    test("explicit preferences override the operating system", () => {
        expect(resolveTheme("dark", false)).toBe("dark")
        expect(resolveTheme("light", true)).toBe("light")
    })

    test("system preference follows prefers-color-scheme", () => {
        expect(resolveTheme("system", true)).toBe("dark")
        expect(resolveTheme("system", false)).toBe("light")
    })

    test("applying a preference writes the resolved data-theme", () => {
        const root: { dataset: { theme?: string } } = { dataset: {} }

        const resolved = applyThemePreference("system", true, root)

        expect(resolved).toBe("dark")
        expect(root.dataset.theme).toBe("dark")
    })
})
