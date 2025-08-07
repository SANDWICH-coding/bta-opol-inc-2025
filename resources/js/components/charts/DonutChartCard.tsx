"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PieChart, Pie, Cell } from "recharts"
import CountUp from "react-countup"

interface DonutChartCardProps {
    title: string
    data: { [key: string]: any }[]
    labelKey?: string
    valueKey?: string
    unitLabel?: string
    extraLabel?: string
    extraValue?: number
    colors?: string[]
}

export function DonutChartCard({
    title,
    data,
    labelKey = "name",
    valueKey = "value",
    unitLabel = "Items",
    extraLabel = "Other Total",
    extraValue = 0,
    colors = [
        "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
        "#f97316", "#10b981", "#ef4444", "#3b82f6",
    ],
}: DonutChartCardProps) {
    const total = data.reduce((acc, curr) => acc + Number(curr[valueKey] ?? 0), 0)

    const formattedTotal = total.toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                {/* Donut Chart */}
                <div className="relative w-[240px] h-[240px] mx-auto sm:mx-0">
                    <PieChart width={240} height={240}>
                        <Pie
                            data={data}
                            dataKey={valueKey}
                            nameKey={labelKey}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell key={index} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-base font-bold">
                            <CountUp
                                end={total}
                                duration={2}
                                prefix="₱"
                                separator=","
                                decimals={2}
                            />
                        </p>

                        <p className="text-sm text-muted-foreground">{unitLabel}</p>
                    </div>
                </div>

                {/* Legend + Extra Section */}
                <div className="flex flex-col gap-4 w-full max-w-sm mx-auto sm:mx-0">
                    {data.map((item, index) => (
                        <div key={index} className="pt-2 border-t mt-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    />
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {item[labelKey]}
                                    </span>
                                </div>

                                <span className="text-sm font-bold">
                                    <CountUp
                                        end={Number(item[valueKey])}
                                        duration={1}
                                        prefix="₱"
                                        separator=","
                                        decimals={2}
                                    />
                                </span>
                            </div>
                        </div>

                    ))}

                    {/* Extra Value Section */}
                    <div className="pt-2 border-t mt-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: "#d1d5db" }}
                                />
                                <span className="text-sm font-medium text-muted-foreground">
                                    {extraLabel}
                                </span>
                            </div>
                            <span className="text-sm font-bold">
                                <CountUp
                                    end={extraValue}
                                    duration={1}
                                    separator=","
                                />
                            </span>

                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
