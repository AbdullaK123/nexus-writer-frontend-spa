import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useAuthOrThrow } from "../../data/providers"
import {
    authKeys,
    useLogout,
    useRequestVerificationEmail,
} from "../../data/queries"
import type { UserResponse } from "../../infrastructure/api/types"
import { Button, useToast } from "../common"
import { AuthFlowPage } from "./AuthFlowPage"

export function VerifyEmailPage() {
    const auth = useAuthOrThrow()
    const logout = useLogout()
    const resend = useRequestVerificationEmail()
    const qc = useQueryClient()
    const navigate = useNavigate()
    const { success, error } = useToast()

    const email = auth.status === "authenticated"
        ? auth.user.email
        : "your email address"

    const handleResend = () => {
        resend.mutate(undefined, {
            onSuccess: () => success("Verification email sent", `Check ${email}.`),
            onError: (err) => error("Could not send email", err.detail),
        })
    }

    const handleContinue = async () => {
        await qc.refetchQueries({ queryKey: authKeys.me(), exact: true })
        const currentUser = qc.getQueryData<UserResponse>(authKeys.me())

        if (currentUser?.emailVerified) {
            await navigate({ to: "/" })
            return
        }

        error("Still waiting for verification", "Open the link in your email, then try again.")
    }

    const handleLogout = () => {
        logout.mutate(undefined, {
            onSuccess: () => window.location.assign("/login"),
        })
    }

    return (
        <AuthFlowPage
            badge="VERIFY EMAIL"
            title="CHECK YOUR EMAIL."
            subtitle={`We sent a verification link to ${email}. Open it to continue into Nexus.`}
        >
            <Button
                type="button"
                variant="primary"
                disabled={resend.isPending}
                onClick={handleResend}
            >
                {resend.isPending ? "Sending..." : "Resend verification email"}
            </Button>
            <Button
                type="button"
                variant="secondary"
                onClick={() => void handleContinue()}
            >
                I've verified my email
            </Button>
            <Button
                type="button"
                variant="ghost"
                disabled={logout.isPending}
                onClick={handleLogout}
            >
                {logout.isPending ? "Signing out..." : "Sign out"}
            </Button>
        </AuthFlowPage>
    )
}
