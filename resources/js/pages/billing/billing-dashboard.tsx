import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import React from 'react';
import { DailyPaymentChart } from '@/components/charts/DailyPaymentChart';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DonutChartCard } from '@/components/charts/DonutChartCard';
import { BillingCategoryTable } from '@/components/charts/BillingCategoryTable';
import TodaysSummary from '@/components/charts/TodaysSummary';
import {
    BarChart3,
    CalendarDays,
    ChevronDown,
    RefreshCw,
    Headset,
    WalletCards,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/billing/dashboard',
    },
];

type PaymentMethod =
    | 'cash'
    | 'gcash'
    | 'bank_transfer'
    | 'check';

type CategoryTotal = {
    category: string;
    total: number | string;
};

type PaymentStat = {
    payment_method: PaymentMethod;
    total: number | string;
};

type SchoolYear = {
    id: number;
    name: string;
};

type SummaryGroup = {
    payment_method?: PaymentMethod;
    category?: string;
    total: number | string;
};

type DailyPayment = {
    date: string;
    total: number;
    or_count: number;
};

type PageProps = {
    paymentStats: PaymentStat[];
    uniqueORCount: number;
    uniqueORCountToday: number;
    schoolYears: SchoolYear[];
    selectedSchoolYear: string;
    categoryTotals: CategoryTotal[];
    summaryByPaymentMethod: SummaryGroup[];
    summaryByCategory: SummaryGroup[];
    dailyPaymentTotals: DailyPayment[];
};

const paymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
        case 'gcash':
            return 'G-Cash';
        case 'bank_transfer':
            return 'Bank Transfer';
        case 'check':
            return 'Check';
        case 'cash':
        default:
            return 'Cash';
    }
};

const toNumber = (value: number | string | undefined | null) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export default function BillingDashboard() {
    const {
        paymentStats,
        uniqueORCount,
        uniqueORCountToday,
        schoolYears,
        selectedSchoolYear,
        categoryTotals,
        summaryByPaymentMethod,
        summaryByCategory,
        dailyPaymentTotals,
    } = usePage<PageProps>().props;


    const [isChangingSchoolYear, setIsChangingSchoolYear] =
        React.useState(false);

    const paymentTransactionData = React.useMemo(() => {
        if (!paymentStats?.length) {
            return [];
        }

        return paymentStats.map((item) => ({
            name: paymentMethodLabel(item.payment_method),
            value: toNumber(item.total),
        }));
    }, [paymentStats]);

    const totalSchoolYearPayments = React.useMemo(
        () =>
            paymentTransactionData.reduce(
                (total, item) => total + item.value,
                0
            ),
        [paymentTransactionData]
    );

    const handleFilterChange = (schoolYear: string) => {
        if (schoolYear === selectedSchoolYear) {
            return;
        }

        setIsChangingSchoolYear(true);

        router.get(
            route('billing.dashboard'),
            { school_year: schoolYear },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsChangingSchoolYear(false),
            }
        );
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(value);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Dashboard" />

            <div className="bg-gradient-to-b from-slate-50/70 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                    {/* Hero */}
                    <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.20),transparent_35%)]" />
                        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-fuchsia-300/20 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                                    <Headset className="h-3.5 w-3.5 text-amber-300" />
                                    Billing Command Center
                                </div>

                                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                    Good day! 👋
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                                    Keep an eye on collections, payment methods,
                                    billing categories, and today's activity—all
                                    in one place.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:flex">
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 text-indigo-100">
                                        <WalletCards className="h-4 w-4" />
                                        <span className="text-xs font-medium">
                                            School Year
                                        </span>
                                    </div>
                                    <p className="mt-1 text-lg font-bold">
                                        {selectedSchoolYear}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 text-indigo-100">
                                        <BarChart3 className="h-4 w-4" />
                                        <span className="text-xs font-medium">
                                            ORs Issued
                                        </span>
                                    </div>
                                    <p className="mt-1 text-lg font-bold">
                                        {uniqueORCount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Today's Summary */}
                    <section className="mb-8">
                        <TodaysSummary
                            summaryByPaymentMethod={summaryByPaymentMethod}
                            summaryByCategory={summaryByCategory}
                            uniqueORCountToday={uniqueORCountToday}
                        />
                    </section>

                    <section className="mb-8">
                        <DailyPaymentChart
                            data={dailyPaymentTotals}
                            schoolYear={selectedSchoolYear}
                        />
                    </section>

                    {/* Overview */}
                    <section>
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                        <BarChart3 className="h-4 w-4" />
                                    </div>

                                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        Overview
                                    </h2>
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Explore payment performance for the selected
                                    school year.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {isChangingSchoolYear && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                        Updating...
                                    </div>
                                )}

                                <Select
                                    value={selectedSchoolYear}
                                    onValueChange={handleFilterChange}
                                    disabled={isChangingSchoolYear}
                                >
                                    <SelectTrigger className="h-10 w-[210px] rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                        <CalendarDays className="mr-2 h-4 w-4 text-indigo-500" />
                                        <SelectValue placeholder="Select School Year" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {schoolYears.map((schoolYear) => (
                                            <SelectItem
                                                key={schoolYear.id}
                                                value={schoolYear.name}
                                            >
                                                {schoolYear.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Card className="overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold">
                                            {selectedSchoolYear}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Payment performance and billing
                                            category breakdown.
                                        </CardDescription>
                                    </div>

                                    <div className="rounded-xl border border-indigo-100 bg-white px-4 py-2 text-right shadow-sm dark:border-indigo-900/50 dark:bg-slate-950">
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Total Payments
                                        </p>
                                        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                                            {formatCurrency(totalSchoolYearPayments)}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 gap-5 p-4 sm:p-6 xl:grid-cols-2">
                                {paymentTransactionData.length > 0 ? (
                                    <DonutChartCard
                                        title="Payments by Method"
                                        data={paymentTransactionData}
                                        unitLabel="Total collected"
                                        extraLabel="ORs Issued"
                                        extraValue={uniqueORCount}
                                    />
                                ) : (
                                    <Card className="flex min-h-[360px] items-center justify-center rounded-2xl border-dashed bg-slate-50/60 shadow-none dark:bg-slate-950/40">
                                        <CardContent className="py-12 text-center">
                                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                                <WalletCards className="h-6 w-6" />
                                            </div>

                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                No payment data yet
                                            </h3>

                                            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                                                Once payments are recorded for
                                                this school year, your payment
                                                breakdown will appear here.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                <BillingCategoryTable
                                    title="Payments by Billing Item"
                                    data={categoryTotals}
                                />
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}