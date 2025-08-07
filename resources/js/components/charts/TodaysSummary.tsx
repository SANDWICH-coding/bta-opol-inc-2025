'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import CountUp from "react-countup";

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

export default function TodaysSummary({
    summaryByPaymentMethod,
    summaryByCategory,
    uniqueORCountToday,
}: TodaysSummaryProps) {
    const noData =
        summaryByPaymentMethod.length === 0 &&
        summaryByCategory.length === 0 &&
        uniqueORCountToday === 0;

    const totalPaymentsToday = summaryByPaymentMethod.reduce((acc, item) => {
        const parsedTotal = parseFloat(item.total as string);
        return acc + (!isNaN(parsedTotal) ? parsedTotal : 0);
    }, 0);

    if (noData) {
        return (
            <Card className="bg-muted/40 border border-dashed">
                <CardHeader>
                    <CardTitle className="text-center text-lg">No Transactions Today</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground text-sm italic">
                        "Commit to the Lord whatever you do, and he will establish your plans."
                        — Proverbs 16:3 (NIV)
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">Today's Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Payments + OR Count */}
                <Card className="min-h-[200px] bg-muted/40">
                    <CardHeader>
                        <CardTitle>Total</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-full space-y-3">
                        <div className="text-center">
                            <div className="text-5xl font-bold">
                                ₱
                                <CountUp
                                    end={totalPaymentsToday}
                                    duration={1}
                                    separator=","
                                    decimals={2}
                                />
                            </div>
                            <div className="text-center mt-4">
                                <p className="text-md font-semibold">
                                    <CountUp end={uniqueORCountToday} duration={1} separator="," />{" "}
                                    <span className="text-md text-muted-foreground mt-1 font-light">
                                        ORs issued today
                                    </span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary by Payment Method */}
                <Card className="min-h-[200px] bg-muted/40">
                    <CardHeader>
                        <CardTitle>Total per method</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {summaryByPaymentMethod.length > 0 ? (
                                summaryByPaymentMethod.map((item, index) => (
                                    <li key={index} className="flex justify-between border-b pb-1">
                                        <span className="capitalize">
                                            {item.payment_method?.replace(/_/g, " ")}
                                        </span>
                                        <span className="font-semibold text-right">
                                            ₱
                                            <CountUp
                                                end={parseFloat(item.total as string) || 0}
                                                duration={1}
                                                separator=","
                                                decimals={2}
                                            />
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-muted-foreground">No payment method records.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>

                {/* Summary by Billing Category */}
                <Card className="min-h-[200px] bg-muted/40">
                    <CardHeader>
                        <CardTitle>Total per item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {summaryByCategory.length > 0 ? (
                                summaryByCategory.map((item, index) => (
                                    <li key={index} className="flex justify-between border-b pb-1">
                                        <span>{item.category}</span>
                                        <span className="font-semibold text-right">
                                            ₱
                                            <CountUp
                                                end={parseFloat(item.total as string) || 0}
                                                duration={1}
                                                separator=","
                                                decimals={2}
                                            />
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-muted-foreground">No billing category records.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
