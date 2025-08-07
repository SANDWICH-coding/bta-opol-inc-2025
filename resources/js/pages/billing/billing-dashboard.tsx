import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { DonutChartCard } from '@/components/charts/DonutChartCard';
import React from 'react';
import {
    Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BillingCategoryTable } from '@/components/charts/BillingCategoryTable';
import TodaysSummary from '@/components/charts/TodaysSummary';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/billing/dashboard' },
];

type PaymentMethod = 'cash' | 'gcash' | 'bank_transfer' | 'check';

type CategoryTotal = {
    category: string;
    total: number;
};

type PaymentStat = {
    payment_method: PaymentMethod;
    total: number;
};

type SchoolYear = {
    id: number;
    name: string;
};

type SummaryGroup = {
    payment_method?: PaymentMethod; // optional for category
    category?: string;              // optional for method
    total: number;
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
};

export default function BillingDashboard() {
    const { paymentStats, uniqueORCount, uniqueORCountToday, schoolYears, selectedSchoolYear, categoryTotals, summaryByPaymentMethod, summaryByCategory } = usePage<PageProps>().props;

    const paymentTransactionData = React.useMemo(() => {
        if (!paymentStats || paymentStats.length === 0) return [];

        return paymentStats.map((item) => {
            const formattedTotal = new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 2,
            }).format(typeof item.total === 'number' ? item.total : 0);

            return {
                name:
                    item.payment_method === 'gcash'
                        ? 'G-Cash'
                        : item.payment_method === 'bank_transfer'
                            ? 'Bank Transfer'
                            : item.payment_method === 'check'
                                ? 'Check'
                                : 'Cash',
                value: typeof item.total === 'number' ? item.total : 0,
                formattedTotal,
            };
        });
    }, [paymentStats]);

    const handleFilterChange = (school_year: string) => {
        router.get(route('billing.dashboard'), { school_year }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Section: Today's Summary */}
                <div>
                    <TodaysSummary
                        summaryByPaymentMethod={summaryByPaymentMethod}
                        summaryByCategory={summaryByCategory}
                        uniqueORCountToday={uniqueORCountToday}
                    />
                </div>

                {/* Section: Performance Summary by School Year */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Overview</h2>
                    <Card className='bg-muted/40'>
                        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                                <CardTitle>{selectedSchoolYear}</CardTitle>
                                <CardDescription>Performance summary by school year.</CardDescription>
                            </div>
                            <Select onValueChange={handleFilterChange} defaultValue={selectedSchoolYear}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select School Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schoolYears.map((sy) => (
                                        <SelectItem key={sy.id} value={sy.name}>
                                            {sy.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentTransactionData.length > 0 ? (
                                <DonutChartCard
                                    title="Payments per method"
                                    data={paymentTransactionData}
                                    unitLabel="Total"
                                    extraLabel="OR Issued"
                                    extraValue={uniqueORCount}
                                />
                            ) : (
                                <div className="text-muted-foreground text-sm">
                                    No payment transaction data available.
                                </div>
                            )}

                            <BillingCategoryTable
                                title="Payments per item"
                                data={categoryTotals}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

        </AppLayout>
    );
}
