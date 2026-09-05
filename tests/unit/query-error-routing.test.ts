import { describe, expect, test, vi } from "vitest"

import { routeQueryError } from "../../src/infrastructure/query-error-routing"
import { ApiError } from "../../src/shared/types"

describe("routeQueryError", () => {
    test.each([401, 403])("ignores stale-session status %s from the current-user auth probe", (status) => {
        const navigate = vi.fn()

        routeQueryError(
            new ApiError(status, "Session is no longer valid"),
            ["auth", "me"],
            "/reset-password",
            navigate,
        )

        expect(navigate).not.toHaveBeenCalled()
    })

    test("routes other 401s to login and preserves the origin", () => {
        const navigate = vi.fn()

        routeQueryError(
            new ApiError(401, "Session expired"),
            ["stories", "story-1"],
            "/stories/story-1",
            navigate,
        )

        expect(navigate).toHaveBeenCalledWith({
            to: "/login",
            search: { redirect: "/stories/story-1" },
        })
    })

    test("does not reinterpret a real non-auth 403 as logged out", () => {
        const navigate = vi.fn()

        routeQueryError(
            new ApiError(403, "Forbidden"),
            ["stories", "story-1"],
            "/stories/story-1",
            navigate,
        )

        expect(navigate).toHaveBeenCalledWith({
            to: "/error",
            search: { redirect: "/stories/story-1" },
        })
    })

    test("routes 404s to the not-found page", () => {
        const navigate = vi.fn()

        routeQueryError(
            new ApiError(404, "missing"),
            ["stories", "missing"],
            "/stories/missing",
            navigate,
        )

        expect(navigate).toHaveBeenCalledWith({
            to: "/404",
            search: { redirect: "/stories/missing" },
        })
    })

    test("does not navigate for expected request cancellation", () => {
        const navigate = vi.fn()

        routeQueryError(
            new ApiError(0, "Request was cancelled"),
            ["stories", "story-1"],
            "/stories/story-1",
            navigate,
        )

        expect(navigate).not.toHaveBeenCalled()
    })

    test.each([
        new ApiError(0, "Network error"),
        new ApiError(408, "Request timed out"),
        new ApiError(422, "response contract mismatch"),
        new ApiError(500, "boom"),
        new Error("programmer error"),
    ])("routes fatal failures to the error page", (error) => {
        const navigate = vi.fn()

        routeQueryError(error, ["stories"], "/", navigate)

        expect(navigate).toHaveBeenCalledWith({
            to: "/error",
            search: { redirect: "/" },
        })
    })
})
