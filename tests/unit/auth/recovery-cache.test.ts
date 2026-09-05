import { beforeEach, describe, expect, test, vi } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useApi } from "../../../src/data/providers/ApiProvider"
import { useForgotPassword, useResetPassword } from "../../../src/data/queries/auth"

vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
}))

vi.mock("../../../src/data/providers/ApiProvider", () => ({
    useApi: vi.fn(),
}))

const clear = vi.fn()

function mutationOptions() {
    return vi.mocked(useMutation).mock.calls.at(-1)?.[0] as {
        onSuccess?: () => unknown
    }
}

beforeEach(() => {
    clear.mockReset()
    vi.mocked(useMutation).mockReset()
    vi.mocked(useQueryClient).mockReturnValue({ clear } as never)
    vi.mocked(useApi).mockReturnValue({
        auth: {
            forgotPassword: vi.fn(),
            resetPassword: vi.fn(),
        },
    } as never)
})

describe("password recovery cache semantics", () => {
    test("forgot-password does not mutate authenticated frontend truth", () => {
        useForgotPassword()

        expect(mutationOptions().onSuccess).toBeUndefined()
        expect(clear).not.toHaveBeenCalled()
    })

    test("successful password reset clears stale session-scoped data", () => {
        useResetPassword()
        mutationOptions().onSuccess?.()

        expect(clear).toHaveBeenCalledOnce()
    })
})
