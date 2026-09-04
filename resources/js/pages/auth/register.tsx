import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { FormEventHandler, useState } from "react";

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<
        Required<RegisterForm>
    >({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Register" />

            <main className="relative min-h-screen overflow-hidden bg-background">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_40%)]" />
                </div>

                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <Link
                                href="/"
                                className="group mb-6 inline-flex items-center gap-3"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105">
                                    <img
                                        src="/images/default-logo.png"
                                        alt="BTA of Opol, Inc."
                                        className="h-12 w-12"
                                    />
                                </div>
                                <div className="text-left leading-tight">
                                    <div className="text-lg font-bold tracking-tight">
                                        BTA of Opol, Inc.
                                    </div>
                                    <div className="text-xs font-medium text-primary">
                                        Blessed Trinity Academy
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <Card className="overflow-hidden border-border/60 bg-card/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
                            <CardContent className="p-6 sm:p-8">
                                <div className="mb-6 text-center">
                                    <h1 className="text-xl font-extrabold tracking-tight">
                                        Create your account
                                    </h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Start and join by creating your account.
                                    </p>
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            placeholder="Full name"
                                            disabled={processing}
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            className="h-11 rounded-xl bg-background/70 px-4 transition focus-visible:ring-2"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={2}
                                            autoComplete="email"
                                            placeholder="Enter your email"
                                            disabled={processing}
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            className="h-11 rounded-xl bg-background/70 px-4 transition focus-visible:ring-2"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                placeholder="Password"
                                                disabled={processing}
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData("password", e.target.value)
                                                }
                                                className="h-11 rounded-xl bg-background/70 px-4 pr-11 transition focus-visible:ring-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                disabled={processing}
                                                aria-label={
                                                    showPassword ? "Hide password" : "Show password"
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="text-sm font-medium"
                                        >
                                            Confirm password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirm ? "text" : "password"}
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                placeholder="Confirm password"
                                                disabled={processing}
                                                value={data.password_confirmation}
                                                onChange={(e) =>
                                                    setData("password_confirmation", e.target.value)
                                                }
                                                className="h-11 rounded-xl bg-background/70 px-4 pr-11 transition focus-visible:ring-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm((v) => !v)}
                                                disabled={processing}
                                                aria-label={
                                                    showConfirm
                                                        ? "Hide confirm password"
                                                        : "Show confirm password"
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                {showConfirm ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    <Button
                                        type="submit"
                                        tabIndex={5}
                                        disabled={processing}
                                        className="group h-11 w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 font-semibold shadow-lg shadow-sky-500/20 transition-all hover:from-sky-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-sky-500/25 active:scale-[0.99]"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Create account
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <p className="mt-6 text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link
                                        href={route("login")}
                                        tabIndex={6}
                                        className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                                    >
                                        Log in
                                    </Link>
                                </p>
                            </CardContent>
                        </Card>

                        <p className="mt-8 text-center text-xs text-muted-foreground/70">
                            © {new Date().getFullYear()} BTA of Opol, Inc.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}