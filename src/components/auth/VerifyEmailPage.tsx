import { useAuthOrThrow } from "../../data/providers"
import { useLogout } from "../../data/queries"
import { Button } from "../common"
import { AuthFlowPage } from "./AuthFlowPage"

export function VerifyEmailPage() {
    const auth = useAuthOrThrow()
    const logout = useLogout()

    const email = auth.status === "authenticated"
        ? auth.user.email
        : "your email address"

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
            <p className="card__subtitle">
                You can keep this tab open. After verifying, return here and continue.
            </p>
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
