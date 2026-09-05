import { z } from "zod"

export const PASSWORD_POLICY_MESSAGE =
    "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, digit, and special character"

const SPECIAL_CHARACTERS = "!@#$%^&*()_+-=[]{};:'\"\\|,.<>/?"

function hasSpecialCharacter(value: string): boolean {
    return [...value].some((character) => SPECIAL_CHARACTERS.includes(character))
}

export function meetsPasswordPolicy(value: string): boolean {
    return value.length >= 8
        && value.length <= 128
        && /[a-z]/.test(value)
        && /[A-Z]/.test(value)
        && /[0-9]/.test(value)
        && hasSpecialCharacter(value)
}

export const passwordPolicySchema = z.string()
    .max(128, "Password must be at most 128 characters")
    .refine(meetsPasswordPolicy, PASSWORD_POLICY_MESSAGE)
