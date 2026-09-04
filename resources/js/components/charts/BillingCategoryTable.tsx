'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import CountUp from 'react-countup';
import {
    ArrowUpRight,
    BarChart3,
    Tag,
} from 'lucide-react';

type CategoryData = {
    category: string;
    total: number | string;
};

type BillingCategoryTableProps = {
    title?: string;
    data: CategoryData[];
};

const colors = [
    'bg-indigo-500',
    'bg-violet-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-emerald-500',
];

const toNumber = (value: number | string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const BillingCategoryTable: React.FC<
    BillingCategoryTableProps
> = ({
    title = 'Billing Category Totals',
    data,
}) => {
    const sortedData = [...data]
        .map((item) => ({
            ...item,
            numericTotal: toNumber(item.total),
        }))
        .sort((a, b) => b.numericTotal - a.numericTotal);

    const total = sortedData.reduce(
        (sum, item) => sum + item.numericTotal,
        0
    );

    return (
        <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-base font-bold">
                            {title}
                        </CardTitle>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Collection breakdown by billing item
                        </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-5">
                {sortedData.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                            <Tag className="h-6 w-6" />
                        </div>

                        <h3 className="font-semibold">
                            No billing data yet
                        </h3>

                        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                            Billing category totals will appear here once
                            payments are recorded.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedData.map((item, index) => {
                            const percentage =
                                total > 0
                                    ? (item.numericTotal / total) * 100
                                    : 0;

                            return (
                                <div
                                    key={item.category}
                                    className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-indigo-100 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-indigo-900/50 dark:hover:bg-indigo-950/20"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors[index % colors.length]} text-white shadow-sm`}
                                            >
                                                <Tag className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                    {item.category}
                                                </p>

                                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                    {percentage.toFixed(1)}% of
                                                    total
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className="text-sm font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                                                ₱
                                                <CountUp
                                                    end={item.numericTotal}
                                                    duration={1}
                                                    separator=","
                                                    decimals={2}
                                                />
                                            </span>

                                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                        </div>
                                    </div>

                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div
                                            className={`h-full rounded-full ${colors[index % colors.length]} transition-all duration-700`}
                                            style={{
                                                width: `${Math.min(
                                                    percentage,
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Total */}
                        <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">
                            <span className="text-sm font-medium text-muted-foreground">
                                Total
                            </span>

                            <span className="text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">
                                ₱
                                <CountUp
                                    end={total}
                                    duration={1.2}
                                    separator=","
                                    decimals={2}
                                />
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
