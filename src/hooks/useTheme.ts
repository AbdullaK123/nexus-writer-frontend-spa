import { useEffect } from "react";
import {
    applyThemePreference,
    persistBrowserThemePreference,
    type ResolvedTheme,
    type ThemePreference,
} from "../infrastructure/theme";

export type { ResolvedTheme, ThemePreference }

export function useTheme(preference: ThemePreference) {
    useEffect(() => {
        const media = window.matchMedia(
            "(prefers-color-scheme: dark)"
        )

        const applyTheme = () => {
            applyThemePreference(preference, media.matches)
        }

        // The authenticated server setting remains canonical, but mirroring the
        // latest preference locally lets public routes keep the same appearance.
        persistBrowserThemePreference(preference)
        applyTheme()

        if (preference !== "system") {
            return
        }

        media.addEventListener("change", applyTheme)

        return () => {
            media.removeEventListener("change", applyTheme)
        }
    }, [preference])
}
