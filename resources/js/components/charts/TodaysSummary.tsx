'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import CountUp from 'react-countup';
import {
    Banknote,
    CreditCard,
    Receipt,
    Smartphone,
    Tag,
    TrendingUp,
    Wallet,
} from 'lucide-react';

type SummaryGroup = {
    payment_method?: string;
    category?: string;
    total: number | string;
};

type TodaysSummaryProps = {
    summaryByPaymentMethod: SummaryGroup[];
    summaryByCategory: SummaryGroup[];
    uniqueORCountToday: number;
};

const toNumber = (value: number | string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatMethod = (method?: string) => {
    if (!method) return 'Unknown';

    switch (method) {
        case 'gcash':
            return 'G-Cash';
        case 'bank_transfer':
            return 'Bank Transfer';
        case 'check':
            return 'Check';
        case 'cash':
            return 'Cash';
        default:
            return method.replace(/_/g, ' ');
    }
};

const getMethodIcon = (method?: string) => {
    switch (method) {
        case 'gcash':
            return Smartphone;
        case 'bank_transfer':
            return CreditCard;
        case 'check':
            return Receipt;
        case 'cash':
        default:
            return Banknote;
    }
};

const getMethodColor = (method?: string) => {
    switch (method) {
        case 'gcash':
            return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400';
        case 'bank_transfer':
            return 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
        case 'check':
            return 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400';
        case 'cash':
        default:
            return 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400';
    }
};

export default function TodaysSummary({
    summaryByPaymentMethod,
    summaryByCategory,
    uniqueORCountToday,
}: TodaysSummaryProps) {
    const totalPaymentsToday = summaryByPaymentMethod.reduce(
        (acc, item) => acc + toNumber(item.total),
        0
    );

    const hasData =
        summaryByPaymentMethod.length > 0 ||
        summaryByCategory.length > 0 ||
        uniqueORCountToday > 0;

    if (!hasData) {
        return (
            <section>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <TrendingUp className="h-4 w-4" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Today&apos;s Summary
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Your billing activity for today.
                        </p>
                    </div>
                </div>

                <Card className="overflow-hidden rounded-3xl border-dashed bg-gradient-to-br from-slate-50 to-white shadow-sm dark:from-slate-900 dark:to-slate-950">
                    <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 dark:from-indigo-950/60 dark:to-violet-950/60 dark:text-indigo-400">
                            <Wallet className="h-7 w-7" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            A fresh start! ✨
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            No transactions have been recorded today yet.
                            Once payments come in, your dashboard will update
                            automatically.
                        </p>
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <TrendingUp className="h-4 w-4" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Today&apos;s Summary
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Here&apos;s how things are looking today.
                        </p>
                    </div>
                </div>

                <div className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 sm:block">
                    Live Activity
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Total */}
                <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/20">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-fuchsia-300/20 blur-3xl" />

                    <CardHeader className="relative">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-indigo-100">
                                Total Collected
                            </CardTitle>

                            <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
                                <Wallet className="h-5 w-5" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="relative pb-7">
                        <div className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            <CountUp
                                end={totalPaymentsToday}
                                duration={1.2}
                                separator=","
                                decimals={2}
                                prefix="₱"
                            />
                        </div>

                        <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                                <Receipt className="h-4 w-4" />
                            </div>

                            <div>
                                <p className="text-lg font-bold leading-none">
                                    <CountUp
                                        end={uniqueORCountToday}
                                        duration={1}
                                        separator=","
                                    />
                                </p>
                                <p className="mt-1 text-xs text-indigo-100">
                                    ORs issued today
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card className="rounded-3xl border-slate-200/80 shadow-sm dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">
                            Total per Method
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {summaryByPaymentMethod.length > 0 ? (
                            <div className="space-y-2">
                                {summaryByPaymentMethod.map((item, index) => {
                                    const Icon = getMethodIcon(
                                        item.payment_method
                                    );

                                    return (
                                        <div
                                            key={`${item.payment_method}-${index}`}
                                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-900"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getMethodColor(
                                                        item.payment_method
                                                    )}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </div>

                                                <span className="truncate text-sm font-medium">
                                                    {formatMethod(
                                                        item.payment_method
                                                    )}
                                                </span>
                                            </div>

                                            <span className="ml-3 shrink-0 text-sm font-bold tabular-nums">
                                                ₱
                                                <CountUp
                                                    end={toNumber(item.total)}
                                                    duration={1}
                                                    separator=","
                                                    decimals={2}
                                                />
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No payment method records.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Categories */}
                <Card className="rounded-3xl border-slate-200/80 shadow-sm dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">
                            Total per Item
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {summaryByCategory.length > 0 ? (
                            <div className="space-y-2">
                                {summaryByCategory.map((item, index) => (
                                    <div
                                        key={`${item.category}-${index}`}
                                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                                <Tag className="h-4 w-4" />
                                            </div>

                                            <span className="truncate text-sm font-medium">
                                                {item.category || 'Uncategorized'}
                                            </span>
                                        </div>

                                        <span className="ml-3 shrink-0 text-sm font-bold tabular-nums">
                                            ₱
                                            <CountUp
                                                end={toNumber(item.total)}
                                                duration={1}
                                                separator=","
                                                decimals={2}
                                            />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No billing category records.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
