import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CountUp from 'react-countup';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {
    BarChart3,
    CalendarDays,
    TrendingUp,
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

type MonthlyExpense = {
    month: string;
    label: string;
    total: number;
};

type MonthlyPeakProps = {
    data: MonthlyExpense[];
    peak: number;
    peakMonth: string | null;
};

export default function MonthlyPeak({
    data,
    peak,
    peakMonth,
}: MonthlyPeakProps) {
    const chartData = {
        labels: data.map((item) => item.label),

        datasets: [
            {
                label: 'Monthly Expenses',
                data: data.map((item) => item.total),

                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',

                borderWidth: 3,

                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#2563eb',
                pointBorderWidth: 3,

                pointRadius: 5,
                pointHoverRadius: 8,

                tension: 0.35,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            intersect: false,
            mode: 'index' as const,
        },

        plugins: {
            legend: {
                display: false,
            },

            tooltip: {
                backgroundColor: '#0f172a',
                padding: 12,

                titleColor: '#ffffff',
                bodyColor: '#ffffff',

                displayColors: false,

                callbacks: {
                    label: (context: any) => {
                        const value = Number(context.raw || 0);

                        return `₱${value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`;
                    },
                },
            },
        },

        scales: {
            x: {
                grid: {
                    display: true,
                    color: 'rgba(148, 163, 184, 0.14)',
                    drawBorder: false,
                },

                ticks: {
                    color: '#64748b',
                    maxRotation: 45,
                    minRotation: 0,
                },
            },

            y: {
                beginAtZero: true,

                grid: {
                    display: true,
                    color: 'rgba(148, 163, 184, 0.18)',
                    drawBorder: false,
                },

                ticks: {
                    color: '#64748b',

                    callback: (value: any) => {
                        return `₱${Number(value).toLocaleString()}`;
                    },
                },
            },
        },
    };

    const formattedPeakMonth = peakMonth
        ? new Date(`${peakMonth}-01T00:00:00`).toLocaleDateString(
              undefined,
              {
                  month: 'long',
                  year: 'numeric',
              }
          )
        : null;

    return (
        <Card className="overflow-hidden border-blue-100 shadow-sm dark:border-blue-900/40">
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Title */}
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />

                            Monthly Peak
                        </CardTitle>

                        <CardDescription className="mt-1">
                            Track your expense activity month by month.
                        </CardDescription>
                    </div>

                    {/* Peak Summary */}
                    {peak > 0 && (
                        <div className="w-full rounded-xl border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900/50 dark:bg-slate-950 sm:w-auto">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                                    <TrendingUp className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Monthly Peak
                                    </p>

                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                        ₱
                                        <CountUp
                                            end={peak}
                                            duration={1}
                                            separator=","
                                            decimals={2}
                                        />
                                    </p>

                                    {formattedPeakMonth && (
                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                            <CalendarDays className="h-3 w-3" />
                                            {formattedPeakMonth}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
                {data.length > 0 ? (
                    <div className="h-[320px] w-full sm:h-[380px]">
                        <Line
                            data={chartData}
                            options={chartOptions}
                        />
                    </div>
                ) : (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                        <div className="mb-4 rounded-full bg-blue-50 p-4 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                            <BarChart3 className="h-7 w-7" />
                        </div>

                        <h3 className="font-semibold">
                            Your monthly trend is ready to grow
                        </h3>

                        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                            Add expense records to start seeing your
                            monthly spending pattern here.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
