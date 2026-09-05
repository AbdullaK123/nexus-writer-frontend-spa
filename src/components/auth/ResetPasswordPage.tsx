import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Field } from "@ark-ui/react/field"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useResetPassword } from "../../data/queries"
import { Button } from "../common"
import { getPasswordStrength, PasswordStrengthMeter } from "./PasswordStrengthMeter"
import { AuthFlowPage } from "./AuthFlowPage"
import { passwordPolicySchema } from "./passwordPolicy"

const resetPasswordFormSchema = z.object({
    newPassword: passwordPolicySchema,
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
})

type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>

export function ResetPasswordPage() {
    const { token } = useSearch({ from: "/reset-password" })
    const resetPassword = useResetPassword()
    const navigate = useNavigate()
    const [complete, setComplete] = useState(false)
    const [tokenInvalid, setTokenInvalid] = useState(false)

    const {
        register,
        watch,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordFormSchema),
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const password = watch("newPassword")

    const onSubmit = handleSubmit((values) => {
        if (!token) {
            setTokenInvalid(true)
            return
        }

        resetPassword.mutate({ token, newPassword: values.newPassword }, {
            onSuccess: () => setComplete(true),
            onError: (err) => {
                if (err.status === 401) {
                    setTokenInvalid(true)
                    return
                }
                setError("root", { message: "We could not reset your password. Please try again." })
            },
        })
    })

    if (!token || tokenInvalid) {
        return (
            <AuthFlowPage
                badge="INVALID LINK"
                title="RESET LINK INVALID OR EXPIRED."
                subtitle="This password reset link cannot be used. Request a fresh one and try again."
            >
                <Button type="button" variant="primary" onClick={() => void navigate({ to: "/forgot-password" })}>
                    Request another link
                </Button>
            </AuthFlowPage>
        )
    }

    if (complete) {
        return (
            <AuthFlowPage
                badge="RECOVERY COMPLETE"
                title="PASSWORD RESET."
                subtitle="Your password has been changed and your previous sessions have been signed out."
            >
                <Button type="button" variant="primary" onClick={() => void navigate({ to: "/login", search: {} })}>
                    Log in →
                </Button>
            </AuthFlowPage>
        )
    }

    return (
        <AuthFlowPage
            badge="RECOVERY"
            title="CHOOSE A NEW PASSWORD."
            subtitle="Use a strong password you haven't used for this account before."
        >
            <form onSubmit={onSubmit}>
                <Field.Root invalid={!!errors.newPassword} className="field">
                    <Field.Label className="field__label">New password</Field.Label>
                    <Field.Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••••"
                        className="field__input"
                        {...register("newPassword")}
                    />
                    {errors.newPassword && (
                        <Field.ErrorText className="field__error">
                            {errors.newPassword.message}
                        </Field.ErrorText>
                    )}
                </Field.Root>

                {password && <PasswordStrengthMeter {...getPasswordStrength(password)} />}

                <Field.Root invalid={!!errors.confirmPassword} className="field">
                    <Field.Label className="field__label">Confirm password</Field.Label>
                    <Field.Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••••"
                        className="field__input"
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <Field.ErrorText className="field__error">
                            {errors.confirmPassword.message}
                        </Field.ErrorText>
                    )}
                </Field.Root>

                {errors.root && (
                    <p className="form-error" role="alert">{errors.root.message}</p>
                )}

                <Button type="submit" variant="primary" disabled={resetPassword.isPending}>
                    {resetPassword.isPending ? "Resetting..." : "Reset password"}
                </Button>
            </form>
        </AuthFlowPage>
    )
}
