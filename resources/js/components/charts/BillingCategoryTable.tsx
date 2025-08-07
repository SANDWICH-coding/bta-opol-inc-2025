'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from 'react-countup';

type CategoryData = {
    category: string;
    total: number;
};

type BillingCategoryTableProps = {
    title?: string;
    data: CategoryData[];
};

export const BillingCategoryTable: React.FC<BillingCategoryTableProps> = ({
    title = "Billing Category Totals",
    data
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {data.map((item) => (
                        <Card key={item.category} className="bg-muted/40 border border-dashed shadow-none">
                            <CardContent className="text-center">
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                                <p className="text-sm font-semibold text-primary">
                                    ₱
                                    <CountUp
                                        end={item.total}
                                        duration={1}
                                        separator=","
                                        decimals={2}
                                    />
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
