import { describe, expect, test } from "vitest"

import { meetsPasswordPolicy, passwordPolicySchema } from "../../../src/components/auth/passwordPolicy"

describe("password creation policy", () => {
    test("accepts a password satisfying the backend contract", () => {
        expect(meetsPasswordPolicy("StrongPassword1!")).toBe(true)
        expect(passwordPolicySchema.safeParse("StrongPassword1!").success).toBe(true)
    })

    test.each([
        "NoDigitHere!",
        "nouppercase1!",
        "NOLOWERCASE1!",
        "NoSpecial123",
        "Short1!",
    ])("rejects a password missing a required class: %s", (password) => {
        expect(meetsPasswordPolicy(password)).toBe(false)
    })

    test.each(["[", "]", "\\", "\"", "'", "|"])(
        "keeps backend special character %s valid",
        (specialCharacter) => {
            expect(meetsPasswordPolicy(`Strong1${specialCharacter}`)).toBe(true)
        },
    )

    test("rejects passwords longer than the backend credential bound", () => {
        const password = `Aa1!${"x".repeat(125)}`
        expect(password.length).toBeGreaterThan(128)
        expect(passwordPolicySchema.safeParse(password).success).toBe(false)
    })
})
