import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InstallmentPlanTableProps {
    enrollment: any;
    months: { value: number; label: string }[];
    title?: string;
    description?: string;
}

export const InstallmentPlanTable: React.FC<InstallmentPlanTableProps> = ({
    enrollment,
    months,
    title = "Installment Plan",
    description = "Monthly billing installment status with discounts and payments.",
}) => {
    const currentMonth = new Date().getMonth() + 1;
    let totalDueThisMonth = 0;

    // ✅ Academic year helper (June → May)
    const getAcademicOrder = (month: number) => {
        return month >= 6 ? month : month + 12;
    };

    const tableRows = enrollment.billing_items.map((item: any) => {
        const { month_installment, start_month, end_month } = item.pivot;
        if (!month_installment || !start_month || !end_month) return null;

        const itemCategory = item.category?.name ?? "—";
        const rawAmount = parseFloat(item.amount) * item.pivot.quantity;

        // --- Discounts ---
        const applicableDiscounts = enrollment.billing_discounts.filter(
            (d: any) => d.category.name === itemCategory
        );

        const discountTotal = applicableDiscounts.reduce(
            (sum: number, discount: any) => {
                const discountAmount = parseFloat(discount.amount);
                if (discount.value === "fixed") return sum + discountAmount;
                if (discount.value === "percentage")
                    return sum + rawAmount * (discountAmount / 100);
                return sum;
            },
            0
        );

        const totalAmount = rawAmount - discountTotal;

        // --- Down payment ---
        const downPayment = enrollment.payments
            .filter(
                (p: any) =>
                    p.billing?.category?.name === itemCategory &&
                    p.remarks === "down_payment"
            )
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

        const installmentBalance = Math.max(totalAmount - downPayment, 0);
        const monthlyBaseAmount = installmentBalance / month_installment;

        // --- Installment months ---
        const installmentMonths = Array.from(
            { length: month_installment },
            (_, i) => ((start_month - 1 + i) % 12) + 1
        );

        // --- Payments (excluding down payment) ---
        const itemPayments = enrollment.payments
            .filter(
                (p: any) =>
                    p.billing?.category?.name === itemCategory &&
                    p.remarks !== "down_payment"
            )
            .sort(
                (a: any, b: any) =>
                    new Date(a.payment_date).getTime() -
                    new Date(b.payment_date).getTime()
            );

        let totalPaid = itemPayments.reduce(
            (sum: number, p: any) => sum + parseFloat(p.amount),
            0
        );

        const installmentMap: {
            [month: number]: { due: number; balance: number };
        } = {};

        let carryOverBalance = 0;

        for (const month of installmentMonths) {
            const due = monthlyBaseAmount + carryOverBalance;
            const paid = Math.min(due, totalPaid);

            totalPaid -= paid;
            carryOverBalance = due - paid;

            installmentMap[month] = {
                due: Number(due.toFixed(2)),
                balance: Number(Math.max(due - paid, 0).toFixed(2)),
            };
        }

        // ===========================
        // ✅ TOTAL DUE (FIXED FOR JANUARY)
        // ===========================
        const currentOrder = getAcademicOrder(currentMonth);

        const orderedMonths = Object.keys(installmentMap)
            .map(Number)
            .sort(
                (a, b) =>
                    getAcademicOrder(a) - getAcademicOrder(b)
            );

        if (installmentMap[currentMonth]) {
            totalDueThisMonth += installmentMap[currentMonth].balance;
        } else {
            const lastMonth = orderedMonths[orderedMonths.length - 1];
            if (currentOrder > getAcademicOrder(lastMonth)) {
                totalDueThisMonth += installmentMap[lastMonth]?.balance || 0;
            }
        }

        // ===========================
        // UI
        // ===========================
        return (
            <TableRow key={item.id}>
                <TableCell>{itemCategory}</TableCell>
                <TableCell>{month_installment}</TableCell>

                {months.map((month) => {
                    const data = installmentMap[month.value];
                    const isCurrent = month.value === currentMonth;

                    if (!data) {
                        return (
                            <TableCell key={month.value}>—</TableCell>
                        );
                    }

                    return (
                        <TableCell
                            key={month.value}
                            className={
                                isCurrent
                                    ? "bg-yellow-100 dark:bg-yellow-800/40 font-semibold"
                                    : ""
                            }
                        >
                            <div className="text-sm space-y-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="text-green-600 font-medium cursor-help">
                                            ₱{data.due.toFixed(2)}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Due this month</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={
                                                data.balance > 0
                                                    ? "text-red-600 font-medium cursor-help"
                                                    : "text-gray-400 cursor-help"
                                            }
                                        >
                                            ₱{data.balance.toFixed(2)}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Remaining balance</p>
                                        {downPayment > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                ₱{downPayment.toFixed(
                                                    2
                                                )}{" "}
                                                down payment applied
                                            </p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </TableCell>
                    );
                })}
            </TableRow>
        );
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent className="overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Installments</TableHead>
                            {months.map((m) => (
                                <TableHead key={m.value}>
                                    {m.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>{tableRows}</TableBody>
                </Table>

                <div className="mt-6 text-right">
                    <p className="text-md font-semibold">
                        Total Due for{" "}
                        {
                            months.find(
                                (m) => m.value === currentMonth
                            )?.label
                        }
                        :{" "}
                        <span className="text-primary">
                            ₱{totalDueThisMonth.toFixed(2)}
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
