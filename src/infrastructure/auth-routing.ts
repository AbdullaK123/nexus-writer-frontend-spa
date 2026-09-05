import type { AuthContextValue } from "../data/providers/AuthProvider/AuthContext"

export type AppAuthDecision =
    | { kind: "allow" }
    | { kind: "redirect-login"; redirect: string }
    | { kind: "redirect-verify-email" }

export type LoginAuthDecision =
    | { kind: "allow" }
    | { kind: "redirect-home" }
    | { kind: "redirect-verify-email" }

export type VerifyEmailAuthDecision =
    | { kind: "allow" }
    | { kind: "redirect-home" }
    | { kind: "redirect-login" }

export function parseResetTokenSearch(value: unknown): string | undefined {
    return typeof value === "string" && value.length > 0 && value.length <= 256
        ? value
        : undefined
}

export function decideAppAuthRoute(
    auth: AuthContextValue,
    locationHref: string,
): AppAuthDecision {
    if (auth.status === "loading") {
        return { kind: "allow" }
    }

    if (auth.status === "authenticated") {
        return auth.user.emailVerified
            ? { kind: "allow" }
            : { kind: "redirect-verify-email" }
    }

    return { kind: "redirect-login", redirect: locationHref }
}

export function decideLoginAuthRoute(auth: AuthContextValue): LoginAuthDecision {
    if (auth.status !== "authenticated") {
        return { kind: "allow" }
    }

    return auth.user.emailVerified
        ? { kind: "redirect-home" }
        : { kind: "redirect-verify-email" }
}

export function decideVerifyEmailRoute(
    auth: AuthContextValue,
): VerifyEmailAuthDecision {
    if (auth.status === "loading") {
        return { kind: "allow" }
    }

    if (auth.status !== "authenticated") {
        return { kind: "redirect-login" }
    }

    return auth.user.emailVerified
        ? { kind: "redirect-home" }
        : { kind: "allow" }
}
