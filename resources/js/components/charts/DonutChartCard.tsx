'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import { Receipt, TrendingUp } from 'lucide-react';

interface DonutChartCardProps {
    title: string;
    data: { [key: string]: any }[];
    labelKey?: string;
    valueKey?: string;
    unitLabel?: string;
    extraLabel?: string;
    extraValue?: number;
    colors?: string[];
}

const defaultColors = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#10b981',
    '#ef4444',
    '#3b82f6',
];

const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export function DonutChartCard({
    title,
    data,
    labelKey = 'name',
    valueKey = 'value',
    unitLabel = 'Items',
    extraLabel = 'Other Total',
    extraValue = 0,
    colors = defaultColors,
}: DonutChartCardProps) {
    const total = data.reduce(
        (acc, curr) => acc + toNumber(curr[valueKey]),
        0
    );

    const hasData = data.length > 0 && total > 0;

    return (
        <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold">
                            {title}
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                            How payments are being received
                        </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>

            {!hasData ? (
                <CardContent className="flex min-h-[350px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <Receipt className="h-6 w-6" />
                    </div>

                    <h3 className="font-semibold">
                        No payment breakdown
                    </h3>

                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                        Payment method statistics will appear here once
                        transactions are recorded.
                    </p>
                </CardContent>
            ) : (
                <CardContent className="p-5">
                    <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
                        {/* Chart */}
                        <div className="relative h-[240px] w-[240px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey={valueKey}
                                        nameKey={labelKey}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={72}
                                        outerRadius={96}
                                        paddingAngle={4}
                                        cornerRadius={5}
                                        startAngle={90}
                                        endAngle={-270}
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell
                                                key={`${entry[labelKey]}-${index}`}
                                                fill={
                                                    colors[
                                                        index % colors.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                <p className="text-2xl font-extrabold tracking-tight">
                                    <CountUp
                                        end={total}
                                        duration={1.5}
                                        separator=","
                                        decimals={2}
                                        prefix="₱"
                                    />
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {unitLabel}
                                </p>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="w-full space-y-2">
                            {data.map((item, index) => {
                                const value = toNumber(item[valueKey]);
                                const percentage =
                                    total > 0
                                        ? Math.round((value / total) * 100)
                                        : 0;

                                return (
                                    <div
                                        key={`${item[labelKey]}-${index}`}
                                        className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div
                                                    className="h-3 w-3 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            colors[
                                                                index %
                                                                    colors.length
                                                            ],
                                                    }}
                                                />

                                                <span className="truncate text-sm font-medium">
                                                    {item[labelKey]}
                                                </span>
                                            </div>

                                            <span className="shrink-0 text-sm font-bold tabular-nums">
                                                ₱
                                                <CountUp
                                                    end={value}
                                                    duration={1}
                                                    separator=","
                                                    decimals={2}
                                                />
                                            </span>
                                        </div>

                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor:
                                                            colors[
                                                                index %
                                                                    colors.length
                                                            ],
                                                    }}
                                                />
                                            </div>

                                            <span className="w-9 text-right text-[11px] font-semibold text-muted-foreground">
                                                {percentage}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Extra */}
                            <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 p-3 dark:border-slate-700">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />

                                    <span className="text-sm font-medium text-muted-foreground">
                                        {extraLabel}
                                    </span>
                                </div>

                                <span className="text-sm font-bold tabular-nums">
                                    <CountUp
                                        end={toNumber(extraValue)}
                                        duration={1}
                                        separator=","
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
