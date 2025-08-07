import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router } from '@inertiajs/react';
import { toast } from "sonner";
import { useState } from "react";

interface Payment {
    id: number;
    or_number: string;
    amount: number | string;
    payment_method: string;
    payment_date: string;
    remarks: string;
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
    const [localPayments, setLocalPayments] = useState(payments); // ✅ Local state

    const handleUpdateRemarks = (paymentId: number, newRemarks: string) => {
        router.post(
            `/billing/payments/${paymentId}/update-remarks`,
            { remarks: newRemarks },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLocalPayments((prev) =>
                        prev.map((payment) =>
                            payment.id === paymentId
                                ? { ...payment, remarks: newRemarks }
                                : payment
                        )
                    );
                    toast.success("Remarks updated successfully.");
                },
                onError: () => {
                    toast.error("Failed to update remarks.");
                },
            }
        );
    };

    return (
        <div>
            {localPayments.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100 dark:bg-gray-800">
                            <TableHead>OR Number</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {localPayments.map((payment) => {
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
                                    <TableCell>
                                        <Select
                                            value={payment.remarks}
                                            onValueChange={(val) =>
                                                handleUpdateRemarks(payment.id, val)
                                            }
                                        >
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="partial_payment">
                                                    Partial Payment
                                                </SelectItem>
                                                <SelectItem value="down_payment">
                                                    Down Payment
                                                </SelectItem>
                                                <SelectItem value="full_payment">
                                                    Full Payment
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
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
