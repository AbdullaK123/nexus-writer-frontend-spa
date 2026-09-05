import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field } from "@ark-ui/react/field"
import { Link } from "@tanstack/react-router"
import { ForgottenPasswordRequestSchema, type ForgottenPasswordRequest } from "../../infrastructure/api/types"
import { useForgotPassword } from "../../data/queries"
import { Button } from "../common"
import { AuthFlowPage } from "./AuthFlowPage"

export function ForgotPasswordPage() {
    const forgotPassword = useForgotPassword()
    const [sent, setSent] = useState(false)
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ForgottenPasswordRequest>({
        resolver: zodResolver(ForgottenPasswordRequestSchema),
    })

    const onSubmit = handleSubmit((values) => {
        forgotPassword.mutate(values, {
            onSuccess: () => setSent(true),
            onError: () => setError("root", {
                message: "We could not process that request. Please try again.",
            }),
        })
    })

    if (sent) {
        return (
            <AuthFlowPage
                badge="RECOVERY"
                title="CHECK YOUR EMAIL."
                subtitle="If an account exists for that address, we've sent password reset instructions."
            >
                <Link
                    to="/login"
                    search={{ redirect: undefined }}
                    className="card__footer-link"
                >
                    Back to sign in →
                </Link>
            </AuthFlowPage>
        )
    }

    return (
        <AuthFlowPage
            badge="RECOVERY"
            title="FORGOT YOUR PASSWORD?"
            subtitle="Enter your email and we'll send reset instructions if an eligible account exists."
        >
            <form onSubmit={onSubmit}>
                <Field.Root invalid={!!errors.email} className="field">
                    <Field.Label className="field__label">Email</Field.Label>
                    <Field.Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="field__input"
                        {...register("email")}
                    />
                    {errors.email && (
                        <Field.ErrorText className="field__error">
                            {errors.email.message}
                        </Field.ErrorText>
                    )}
                </Field.Root>

                {errors.root && (
                    <p className="form-error" role="alert">{errors.root.message}</p>
                )}

                <Button type="submit" variant="primary" disabled={forgotPassword.isPending}>
                    {forgotPassword.isPending ? "Sending..." : "Send reset link"}
                </Button>
            </form>
            <Link
                to="/login"
                search={{ redirect: undefined }}
                className="card__footer-link"
            >
                Back to sign in →
            </Link>
        </AuthFlowPage>
    )
}
