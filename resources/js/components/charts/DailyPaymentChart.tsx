'use client'

import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { TrendingUp, CalendarDays } from 'lucide-react'

type DailyPayment = {
    date: string
    total: number
    or_count: number
}

interface DailyPaymentChartProps {
    data: DailyPayment[]
    schoolYear: string
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

const formatDate = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`)

    return parsedDate.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
    })
}

const formatFullDate = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`)

    return parsedDate.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export function DailyPaymentChart({
    data,
    schoolYear,
}: DailyPaymentChartProps) {
    const totalCollected = data.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
    )

    const totalORs = data.reduce(
        (sum, item) => sum + Number(item.or_count || 0),
        0
    )

    const peakDay = data.reduce<DailyPayment | null>(
        (peak, item) => {
            if (!peak || Number(item.total) > Number(peak.total)) {
                return item
            }

            return peak
        },
        null
    )

    return (
        <Card className="overflow-hidden border-0 shadow-sm">
            <CardHeader className="border-b">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <CardTitle className="text-base sm:text-lg">
                                    Daily Collection Trend
                                </CardTitle>

                                <CardDescription>
                                    Payment activity for {schoolYear}
                                </CardDescription>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                            {data.length} active{' '}
                            {data.length === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {data.length === 0 ? (
                    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                            <TrendingUp className="h-7 w-7 text-muted-foreground" />
                        </div>

                        <h3 className="font-semibold">
                            No payment activity yet
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            Daily collection activity for this school year
                            will appear here once payments are recorded.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chart */}
                        <div className="h-[320px] w-full sm:h-[380px]">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <LineChart
                                    data={data}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-muted"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{
                                            fontSize: 12,
                                        }}
                                        minTickGap={25}
                                    />

                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{
                                            fontSize: 12,
                                        }}
                                        tickFormatter={(value) =>
                                            `₱${Number(value).toLocaleString()}`
                                        }
                                        width={80}
                                    />

                                    <Tooltip
                                        cursor={{
                                            stroke: 'hsl(var(--muted-foreground))',
                                            strokeDasharray: '4 4',
                                        }}
                                        content={({ active, payload }) => {
                                            if (
                                                !active ||
                                                !payload ||
                                                payload.length === 0
                                            ) {
                                                return null
                                            }

                                            const item =
                                                payload[0].payload as DailyPayment

                                            return (
                                                <div className="rounded-xl border bg-background p-4 shadow-xl">
                                                    <p className="mb-3 text-sm font-semibold">
                                                        {formatFullDate(
                                                            item.date
                                                        )}
                                                    </p>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-sm text-muted-foreground">
                                                                Collected
                                                            </span>

                                                            <span className="font-bold text-primary">
                                                                {formatCurrency(
                                                                    Number(
                                                                        item.total
                                                                    )
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-sm text-muted-foreground">
                                                                ORs issued
                                                            </span>

                                                            <span className="font-semibold">
                                                                {Number(
                                                                    item.or_count
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                            fill: '#6366f1',
                                            strokeWidth: 2,
                                            stroke: 'hsl(var(--background))',
                                        }}
                                        activeDot={{
                                            r: 7,
                                            strokeWidth: 3,
                                            stroke: 'hsl(var(--background))',
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                            <span>Daily payment collections</span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
