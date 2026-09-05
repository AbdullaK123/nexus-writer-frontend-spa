import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useAuthOrThrow } from "../../data/providers"
import { authKeys } from "../../data/queries"
import { Button } from "../common"
import { AuthFlowPage } from "./AuthFlowPage"

export function EmailVerifiedPage() {
    const { error } = useSearch({ from: "/email-verified" })
    const auth = useAuthOrThrow()
    const qc = useQueryClient()
    const navigate = useNavigate()
    const invalid = error === "invalid"

    const handleContinue = async () => {
        if (auth.status === "authenticated") {
            await qc.refetchQueries({ queryKey: authKeys.me(), exact: true })
            await navigate({ to: "/" })
            return
        }

        await navigate({ to: "/login", search: { redirect: undefined } })
    }

    const handleInvalid = async () => {
        if (auth.status === "authenticated") {
            await navigate({ to: "/verify-email" })
            return
        }

        await navigate({ to: "/login", search: { redirect: undefined } })
    }

    if (invalid) {
        return (
            <AuthFlowPage
                badge="INVALID LINK"
                title="LINK INVALID OR EXPIRED."
                subtitle="This verification link can no longer be used. Request a fresh link and try again."
            >
                <Button type="button" variant="primary" onClick={() => void handleInvalid()}>
                    {auth.status === "authenticated" ? "Request another link" : "Back to sign in"}
                </Button>
            </AuthFlowPage>
        )
    }

    return (
        <AuthFlowPage
            badge="VERIFIED"
            title="EMAIL VERIFIED."
            subtitle="Your email address has been confirmed."
        >
            <Button type="button" variant="primary" onClick={() => void handleContinue()}>
                Continue to Nexus →
            </Button>
        </AuthFlowPage>
    )
}
