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

interface DailyTotal {
    date: string
    total: number | string
}

interface DailyPeakChartProps {
    data: DailyTotal[]
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

export function DailyPeakChart({ data }: DailyPeakChartProps) {
    const chartData = React.useMemo(() => {
        return data.map((item) => ({
            date: item.date,
            label: formatDate(item.date),
            total: Number(item.total) || 0,
        }))
    }, [data])

    const peakDay = React.useMemo(() => {
        if (chartData.length === 0) return null

        return chartData.reduce((peak, current) =>
            current.total > peak.total ? current : peak
        )
    }, [chartData])

    const totalCollected = React.useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.total, 0)
    }, [chartData])

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            Daily Payment Activity
                        </CardTitle>

                        <CardDescription>
                            Track payment collections and identify peak days.
                        </CardDescription>
                    </div>

                    {peakDay && (
                        <div className="rounded-xl border bg-background px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                Peak day
                            </p>

                            <p className="font-semibold">
                                {formatDate(peakDay.date)}
                            </p>

                            <p className="text-sm font-bold text-primary">
                                {formatCurrency(peakDay.total)}
                            </p>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {chartData.length === 0 ? (
                    <div className="flex min-h-[320px] items-center justify-center">
                        <div className="text-center">
                            <p className="font-medium">
                                No payment activity yet
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Daily payment records will appear here once
                                transactions are recorded.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 10,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    className="text-xs"
                                />

                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tickFormatter={(value) =>
                                        `₱${Number(value).toLocaleString()}`
                                    }
                                    className="text-xs"
                                    width={80}
                                />

                                <Tooltip
                                    cursor={{
                                        stroke: 'hsl(var(--muted-foreground))',
                                        strokeDasharray: '4 4',
                                    }}
                                    formatter={(value) => [
                                        formatCurrency(Number(value)),
                                        'Collected',
                                    ]}
                                    labelFormatter={(label) => `Date: ${label}`}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid hsl(var(--border))',
                                        backgroundColor:
                                            'hsl(var(--background))',
                                    }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    name="Collected"
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
                                        fill: '#6366f1',
                                        strokeWidth: 3,
                                        stroke: 'hsl(var(--background))',
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {chartData.length > 0 && (
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-5">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Total collected
                            </p>

                            <p className="text-lg font-bold">
                                {formatCurrency(totalCollected)}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                                Peak collection
                            </p>

                            <p className="text-lg font-bold text-primary">
                                {peakDay
                                    ? formatCurrency(peakDay.total)
                                    : '₱0'}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
