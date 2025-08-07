import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Payment {
    id: number;
    or_number: string;
    amount: number | string;
    payment_method: string;
    payment_date: string;
    billing?: {
        category?: {
            name: string;
        };
    };
}

interface PaymentTableProps {
    payments: Payment[];
    paymentMethodColors: Record<string, string>;
}

export function PaymentTable({ payments, paymentMethodColors }: PaymentTableProps) {
    return (
        <div>
            {payments.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100 dark:bg-gray-800">
                            <TableHead>OR Number</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => {
                            const color =
                                paymentMethodColors[payment.payment_method] || "#9ca3af";

                            return (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.or_number}</TableCell>
                                    <TableCell>
                                        {payment.billing?.category?.name ?? "—"}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        <Badge
                                            variant="secondary"
                                            style={{ backgroundColor: color, color: "#fff" }}
                                        >
                                            {payment.payment_method.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{payment.payment_date}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            variant="secondary"
                                            style={{ backgroundColor: color, color: "#fff" }}
                                        >
                                            ₱ {parseFloat(payment.amount as string).toFixed(2)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-sm">
                    No payment records found for this student.
                </p>
            )}
        </div>
    );
}
