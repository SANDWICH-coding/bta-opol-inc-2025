import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    Mail,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Account Verification',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Verification" />

            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-blue-50/50 px-4 py-8 transition-colors dark:from-slate-950 dark:via-slate-950 dark:to-blue-950/30 sm:px-6 lg:px-8">
                <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
                    <div className="w-full">
                        {/* Main Card */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
                            {/* Top Gradient */}
                            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-10 sm:px-10 sm:py-12">
                                {/* Decorative elements */}
                                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
                                <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />

                                <div className="relative flex flex-col items-center text-center">
                                    {/* Icon */}
                                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                                        <ShieldCheck className="h-10 w-10 text-white" />
                                    </div>

                                    {/* Badge */}
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white/95 ring-1 ring-white/20">
                                        <Sparkles className="h-4 w-4" />
                                        Almost there!
                                    </div>

                                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                                        Your Account Is Being Verified
                                    </h1>

                                    <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                                        Thanks for signing up! Your account is
                                        now in the verification process. Our
                                        admin team is reviewing your information
                                        to make sure everything is ready for you.
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-8 sm:px-10 sm:py-10">
                                {/* Status */}
                                <div className="flex flex-col gap-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/60 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:p-6">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
                                        <Clock3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                                            Verification is in progress
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                            Please sit back and relax. There’s
                                            nothing else you need to do right now.
                                            We’ll let you know once your account
                                            has been verified.
                                        </p>
                                    </div>

                                    <div className="shrink-0">
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                            Pending Review
                                        </span>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="mt-8">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        What happens next?
                                    </h3>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                        {/* Step 1 */}
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-colors dark:border-slate-800 dark:bg-slate-800/40">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>

                                            <h4 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                                Application received
                                            </h4>

                                            <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                                Your registration has been
                                                successfully submitted.
                                            </p>
                                        </div>

                                        {/* Step 2 */}
                                        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 transition-colors dark:border-blue-900/60 dark:bg-blue-950/30">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                                <Clock3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>

                                            <h4 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                                Admin verification
                                            </h4>

                                            <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                                Our team is currently reviewing
                                                your account details.
                                            </p>
                                        </div>

                                        {/* Step 3 */}
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-colors dark:border-slate-800 dark:bg-slate-800/40">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                                                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                            </div>

                                            <h4 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                                You're ready to go
                                            </h4>

                                            <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                                Once approved, you’ll have full
                                                access to your account.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Support */}
                                {/* Support */}
                                <div className="mt-8">
                                    <div className="mb-5">
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                            Need help?
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            If you have questions about your verification, feel free to
                                            reach out through any of these channels.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        {/* Messenger */}
                                        <a
                                            href="https://web.facebook.com/btaofopol"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:shadow-blue-950/30"
                                        >
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 transition-colors group-hover:bg-blue-600 dark:bg-blue-900/40 dark:group-hover:bg-blue-600">
                                                <svg
                                                    className="h-5 w-5 text-blue-600 group-hover:text-white dark:text-blue-400 dark:group-hover:text-white"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M12 2C6.477 2 2 6.126 2 11.21c0 2.897 1.443 5.476 3.773 7.17V22l3.456-1.896c.883.245 1.812.376 2.771.376 5.523 0 10-4.126 10-9.27C22 6.126 17.523 2 12 2Zm.994 12.468-2.55-2.717-4.976 2.717 5.48-5.82 2.612 2.717 4.913-2.717-5.479 5.82Z" />
                                                </svg>
                                            </div>

                                            <h4 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                                Messenger
                                            </h4>

                                            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                                Send us a message
                                            </p>

                                            <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                Message us
                                                <span className="ml-1 transition-transform group-hover:translate-x-1">
                                                    →
                                                </span>
                                            </span>
                                        </a>

                                        {/* Email */}
                                        <a
                                            href="mailto:blessed.opol@gmail.com"
                                            className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700 dark:hover:shadow-emerald-950/30"
                                        >
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 transition-colors group-hover:bg-emerald-600 dark:bg-emerald-900/40 dark:group-hover:bg-emerald-600">
                                                <Mail className="h-5 w-5 text-emerald-600 group-hover:text-white dark:text-emerald-400 dark:group-hover:text-white" />
                                            </div>

                                            <h4 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                                Email
                                            </h4>

                                            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                                Send us an email
                                            </p>

                                            <span className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                Email support
                                                <span className="ml-1 transition-transform group-hover:translate-x-1">
                                                    →
                                                </span>
                                            </span>
                                        </a>

                                        {/* Phone */}
                                        <a
                                            href="tel:09975111026"
                                            className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-700 dark:hover:shadow-violet-950/30"
                                        >
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 transition-colors group-hover:bg-violet-600 dark:bg-violet-900/40 dark:group-hover:bg-violet-600">
                                                <svg
                                                    className="h-5 w-5 text-violet-600 group-hover:text-white dark:text-violet-400 dark:group-hover:text-white"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M6.62 10.79a15.464 15.464 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
                                                </svg>
                                            </div>

                                            <h4 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                                Phone
                                            </h4>

                                            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                                Talk to our support team
                                            </p>

                                            <span className="mt-4 inline-flex items-center text-sm font-semibold text-violet-600 dark:text-violet-400">
                                                Call support
                                                <span className="ml-1 transition-transform group-hover:translate-x-1">
                                                    →
                                                </span>
                                            </span>
                                        </a>
                                    </div>

                                    {/* 72-hour notice */}
                                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                                        <div className="flex gap-3">
                                            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

                                            <p className="text-sm leading-6 text-amber-800 dark:text-amber-300">
                                                Account verification usually takes up to{' '}
                                                <strong>72 hours</strong>. If you haven't received an update
                                                after this period, please contact us through Messenger, email,
                                                or phone and we'll be happy to assist you.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Encouragement */}
                                <div className="mt-8 text-center">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Thank you for your patience.{' '}
                                        <span className="font-medium text-slate-700 dark:text-slate-200">
                                            We’re excited to have you with us!
                                        </span>{' '}
                                        🎉
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer note */}
                        <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
                            You can safely leave this page. Your verification
                            status will be updated once the review is complete.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
