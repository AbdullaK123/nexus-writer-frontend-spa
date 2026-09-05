import { describe, expect, test, vi } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useApi } from "../../../src/data/providers/ApiProvider"
import { useLogout } from "../../../src/data/queries/auth"

vi.mock("@tanstack/react-query", () => ({
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
}))

vi.mock("../../../src/data/providers/ApiProvider", () => ({
    useApi: vi.fn(),
}))

describe("logout transition", () => {
    test("logout does not clear mounted query state before route teardown", () => {
        const clear = vi.fn()

        vi.mocked(useQueryClient).mockReturnValue({ clear } as never)
        vi.mocked(useApi).mockReturnValue({
            auth: { logout: vi.fn() },
        } as never)

        useLogout()

        const options = vi.mocked(useMutation).mock.calls.at(-1)?.[0] as {
            onSuccess?: () => unknown
        }

        options.onSuccess?.()

        expect(clear).not.toHaveBeenCalled()
    })
})
