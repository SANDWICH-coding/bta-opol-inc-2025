import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";

interface BillingItem {
    id: number;
    description: string;
    amount: string | number;
    category?: {
        name: string;
    };
    pivot: {
        quantity: number;
    };
}

interface Discount {
    value: "fixed" | "percentage";
    amount: string;
    category?: {
        name: string;
    };
}

interface Payment {
    amount: string | number;
    billing?: {
        description: string;
    };
}

interface BillingBreakdownTableProps {
    billingItems: BillingItem[];
    discounts: Discount[];
    payments: Payment[];
}

export function BillingBreakdownTable({
    billingItems,
    discounts,
    payments,
}: BillingBreakdownTableProps) {
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                        <TableHead>Item</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {billingItems.map((item) => {
                        const categoryName = item.category?.name ?? "—";
                        const quantity = item.pivot.quantity;
                        const amount = parseFloat(item.amount.toString());
                        const baseSubtotal = amount * quantity;

                        const matchingDiscounts = discounts.filter(
                            (d) => d.category?.name === categoryName
                        );

                        let totalDiscount = 0;
                        let discountDisplay = "—";

                        if (matchingDiscounts.length > 0) {
                            discountDisplay = matchingDiscounts
                                .map((d) => {
                                    let discountAmount = 0;

                                    if (d.value === "fixed") {
                                        discountAmount = parseFloat(d.amount);
                                    } else if (d.value === "percentage") {
                                        discountAmount =
                                            (baseSubtotal * parseFloat(d.amount)) / 100;
                                    }

                                    totalDiscount += discountAmount;

                                    return d.value === "percentage"
                                        ? `${d.amount}%`
                                        : `₱${parseFloat(d.amount).toFixed(2)}`;
                                })
                                .join(", ");
                        }

                        const finalSubtotal = baseSubtotal - totalDiscount;

                        const totalPaidForCategory = payments
                            .filter((p) => p.billing?.description === item.description)
                            .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

                        const balance = finalSubtotal - totalPaidForCategory;

                        return (
                            <TableRow key={item.id}>
                                <TableCell>{categoryName}</TableCell>
                                <TableCell>₱{amount.toFixed(2)}</TableCell>
                                <TableCell>x {quantity}</TableCell>
                                <TableCell>{discountDisplay}</TableCell>
                                <TableCell>₱{finalSubtotal.toFixed(2)}</TableCell>
                                <TableCell>₱{Math.max(balance, 0).toFixed(2)}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
