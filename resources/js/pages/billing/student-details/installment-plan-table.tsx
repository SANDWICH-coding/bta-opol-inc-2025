import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    CreditCard,
    Info,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

interface Month {
    value: number;
    label: string;
}

interface BillingItem {
    id: number;
    description: string;
    amount: string | number;
    category?: {
        name: string;
    };
    pivot: {
        quantity: number;
        month_installment?: number | null;
        start_month?: number | null;
        end_month?: number | null;
    };
}

interface Discount {
    value: "fixed" | "percentage";
    amount: string | number;
    category?: {
        name: string;
    };
}

interface Payment {
    amount: string | number;
    payment_date: string;
    remarks?: string | null;
    billing?: {
        description?: string;
        category?: {
            name: string;
        };
    };
}

interface Enrollment {
    billing_items: BillingItem[];
    billing_discounts: Discount[];
    payments: Payment[];
}

interface InstallmentPlanTableProps {
    enrollment: Enrollment;
    months: Month[];
    title?: string;
    description?: string;
}

interface InstallmentData {
    due: number;
    balance: number;
}

interface InstallmentRow {
    item: BillingItem;
    itemCategory: string;
    monthInstallment: number;
    installmentMap: Record<number, InstallmentData>;
    downPayment: number;
    totalAmount: number;
}

const toNumber = (
    value: string | number | null | undefined
): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.max(value, 0));
};

const getAcademicOrder = (month: number) => {
    return month >= 6 ? month : month + 12;
};

const getStatus = (data: InstallmentData) => {
    if (data.balance <= 0) {
        return {
            label: "Paid",
            icon: CheckCircle2,
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 " +
                "dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400",
            amountClass:
                "text-emerald-600 dark:text-emerald-400",
        };
    }

    if (data.balance < data.due) {
        return {
            label: "Partial",
            icon: TrendingDown,
            className:
                "border-amber-200 bg-amber-50 text-amber-700 " +
                "dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400",
            amountClass:
                "text-amber-600 dark:text-amber-400",
        };
    }

    return {
        label: "Due",
        icon: Clock3,
        className:
            "border-rose-200 bg-rose-50 text-rose-700 " +
            "dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400",
        amountClass:
            "text-rose-600 dark:text-rose-400",
    };
};

export const InstallmentPlanTable: React.FC<
    InstallmentPlanTableProps
> = ({
    enrollment,
    months,
    title = "Installment Plan",
    description = "Track monthly billing, payments, and remaining balances at a glance.",
}) => {
        const currentMonth = new Date().getMonth() + 1;

        let totalDueThisMonth = 0;
        let totalPlanAmount = 0;
        let totalPaidAmount = 0;
        let totalRemainingAmount = 0;

        const tableRows: InstallmentRow[] = enrollment.billing_items
            .map((item): InstallmentRow | null => {
                const {
                    month_installment,
                    start_month,
                    end_month,
                } = item.pivot;

                if (
                    !month_installment ||
                    !start_month ||
                    !end_month
                ) {
                    return null;
                }

                const itemCategory =
                    item.category?.name ?? "Uncategorized";

                const rawAmount =
                    toNumber(item.amount) *
                    toNumber(item.pivot.quantity);

                // ----------------------------------------
                // Discounts
                // ----------------------------------------

                const applicableDiscounts =
                    enrollment.billing_discounts.filter(
                        (discount) =>
                            discount.category?.name ===
                            itemCategory
                    );

                const discountTotal =
                    applicableDiscounts.reduce(
                        (sum, discount) => {
                            const discountAmount =
                                toNumber(discount.amount);

                            if (
                                discount.value ===
                                "fixed"
                            ) {
                                return (
                                    sum + discountAmount
                                );
                            }

                            if (
                                discount.value ===
                                "percentage"
                            ) {
                                return (
                                    sum +
                                    rawAmount *
                                    (discountAmount /
                                        100)
                                );
                            }

                            return sum;
                        },
                        0
                    );

                const totalAmount = Math.max(
                    rawAmount - discountTotal,
                    0
                );

                // ----------------------------------------
                // Down payment
                // ----------------------------------------

                const downPayment =
                    enrollment.payments
                        .filter(
                            (payment) =>
                                payment.billing?.category
                                    ?.name ===
                                itemCategory &&
                                payment.remarks ===
                                "down_payment"
                        )
                        .reduce(
                            (sum, payment) =>
                                sum +
                                toNumber(
                                    payment.amount
                                ),
                            0
                        );

                const installmentBalance =
                    Math.max(
                        totalAmount -
                        downPayment,
                        0
                    );

                const monthlyBaseAmount =
                    installmentBalance /
                    month_installment;

                // ----------------------------------------
                // Installment months
                // ----------------------------------------

                const installmentMonths =
                    Array.from(
                        {
                            length: month_installment,
                        },
                        (_, index) =>
                            ((start_month -
                                1 +
                                index) %
                                12) +
                            1
                    );

                // ----------------------------------------
                // Payments excluding down payment
                // ----------------------------------------

                const itemPayments =
                    enrollment.payments
                        .filter(
                            (payment) =>
                                payment.billing?.category
                                    ?.name ===
                                itemCategory &&
                                payment.remarks !==
                                "down_payment"
                        )
                        .sort(
                            (a, b) =>
                                new Date(
                                    a.payment_date
                                ).getTime() -
                                new Date(
                                    b.payment_date
                                ).getTime()
                        );

                let remainingPayments =
                    itemPayments.reduce(
                        (sum, payment) =>
                            sum +
                            toNumber(
                                payment.amount
                            ),
                        0
                    );

                // ----------------------------------------
                // Monthly installment map
                // ----------------------------------------

                const installmentMap: Record<
                    number,
                    InstallmentData
                > = {};

                let carryOverBalance = 0;

                for (const month of installmentMonths) {
                    const due =
                        monthlyBaseAmount +
                        carryOverBalance;

                    const paid = Math.min(
                        due,
                        remainingPayments
                    );

                    remainingPayments -= paid;

                    carryOverBalance = Math.max(
                        due - paid,
                        0
                    );

                    installmentMap[month] = {
                        due: Number(
                            due.toFixed(2)
                        ),
                        balance: Number(
                            Math.max(
                                due - paid,
                                0
                            ).toFixed(2)
                        ),
                    };
                }

                // ----------------------------------------
                // Totals
                // ----------------------------------------

                const itemPaymentsTotal =
                    itemPayments.reduce(
                        (sum, payment) =>
                            sum +
                            toNumber(
                                payment.amount
                            ),
                        0
                    );

                const itemPaidTotal =
                    downPayment +
                    itemPaymentsTotal;

                const itemRemainingBalance =
                    Math.max(
                        totalAmount -
                        itemPaidTotal,
                        0
                    );

                totalPlanAmount += totalAmount;
                totalPaidAmount += itemPaidTotal;
                totalRemainingAmount +=
                    itemRemainingBalance;

                // ----------------------------------------
                // Current month due
                // ----------------------------------------

                const currentData =
                    installmentMap[currentMonth];

                if (currentData) {
                    totalDueThisMonth +=
                        currentData.balance;
                } else {
                    const orderedMonths =
                        Object.keys(
                            installmentMap
                        )
                            .map(Number)
                            .sort(
                                (a, b) =>
                                    getAcademicOrder(
                                        a
                                    ) -
                                    getAcademicOrder(
                                        b
                                    )
                            );

                    const lastMonth =
                        orderedMonths[
                        orderedMonths.length -
                        1
                        ];

                    if (
                        lastMonth &&
                        getAcademicOrder(
                            currentMonth
                        ) >
                        getAcademicOrder(
                            lastMonth
                        )
                    ) {
                        totalDueThisMonth +=
                            installmentMap[
                                lastMonth
                            ]?.balance ?? 0;
                    }
                }

                // ----------------------------------------
                // IMPORTANT:
                // monthInstallment is explicitly returned
                // as part of the row object.
                // ----------------------------------------

                return {
                    item,
                    itemCategory,
                    monthInstallment:
                        month_installment,
                    installmentMap,
                    downPayment,
                    totalAmount,
                };
            })
            .filter(
                (row): row is InstallmentRow =>
                    row !== null
            );

        const currentMonthLabel =
            months.find(
                (month) =>
                    month.value ===
                    currentMonth
            )?.label ?? "Current Month";

        const progress =
            totalPlanAmount > 0
                ? Math.min(
                    (totalPaidAmount /
                        totalPlanAmount) *
                    100,
                    100
                )
                : 0;

        const hasInstallments =
            tableRows.length > 0;

        return (
            <Card className="overflow-hidden rounded-md border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
                {/* Header */}
                <CardHeader className="">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <CalendarDays className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-lg font-bold sm:text-xl">
                                            {title}
                                        </CardTitle>

                                        {hasInstallments && (
                                            <Badge
                                                variant="secondary"
                                                className="gap-1 rounded-full px-2.5 py-1"
                                            >
                                                <TrendingUp className="h-3 w-3" />
                                                Active
                                            </Badge>
                                        )}
                                    </div>

                                    <CardDescription className="mt-1 max-w-2xl leading-relaxed">
                                        {description}
                                    </CardDescription>
                                </div>
                            </div>

                            {hasInstallments && (
                                <div className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                                    <CreditCard className="h-3.5 w-3.5 text-primary" />

                                    <span>
                                        {tableRows.length}{" "}
                                        {tableRows.length ===
                                            1
                                            ? "plan"
                                            : "plans"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {hasInstallments && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {/* Total Plan */}
                                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 transition-colors hover:bg-muted/40">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CircleDollarSign className="h-4 w-4 text-primary" />

                                        <span className="text-xs font-medium">
                                            Total plan
                                        </span>
                                    </div>

                                    <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
                                        {formatCurrency(
                                            totalPlanAmount
                                        )}
                                    </p>
                                </div>

                                {/* Paid */}
                                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 transition-colors hover:bg-muted/40">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                                        <span className="text-xs font-medium">
                                            Total paid
                                        </span>
                                    </div>

                                    <p className="mt-2 text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(
                                            totalPaidAmount
                                        )}
                                    </p>
                                </div>

                                {/* Remaining */}
                                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 transition-colors hover:bg-muted/40">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <TrendingDown className="h-4 w-4 text-amber-500" />

                                        <span className="text-xs font-medium">
                                            Remaining
                                        </span>
                                    </div>

                                    <p className="mt-2 text-lg font-bold tracking-tight text-amber-600 dark:text-amber-400">
                                        {formatCurrency(
                                            totalRemainingAmount
                                        )}
                                    </p>
                                </div>

                                {/* Current Month */}
                                <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 transition-colors hover:bg-primary/[0.1]">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Clock3 className="h-4 w-4" />

                                        <span className="text-xs font-semibold">
                                            Due this month
                                        </span>
                                    </div>

                                    <p className="mt-2 text-lg font-bold tracking-tight text-primary">
                                        {formatCurrency(
                                            totalDueThisMonth
                                        )}
                                    </p>

                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        {currentMonthLabel}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {!hasInstallments ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <CalendarDays className="h-6 w-6" />
                            </div>

                            <h3 className="text-base font-semibold text-foreground">
                                No installment plans yet
                            </h3>

                            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                                Installment schedules will
                                appear here once a billing
                                item has an installment
                                period configured.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Progress */}
                            <div className="border-b border-border/60 px-5 py-4 sm:px-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Payment progress
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-green-600 dark:text-green-400">
                                            {progress.toFixed(
                                                0
                                            )}
                                            % completed
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">
                                            Paid
                                        </p>

                                        <p className="text-sm font-semibold text-foreground">
                                            {formatCurrency(
                                                totalPaidAmount
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-200 transition-all duration-700"
                                        style={{
                                            width: `${progress}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="w-full overflow-x-auto">
                                <Table className="min-w-[1100px]">
                                    <TableHeader>
                                        <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                                            <TableHead className="sticky left-0 z-20 min-w-[210px] bg-muted/40 font-semibold backdrop-blur">
                                                Billing item
                                            </TableHead>

                                            <TableHead className="w-[120px] text-center font-semibold">
                                                Installments
                                            </TableHead>

                                            {months.map(
                                                (month) => {
                                                    const isCurrent =
                                                        month.value ===
                                                        currentMonth;

                                                    return (
                                                        <TableHead
                                                            key={
                                                                month.value
                                                            }
                                                            className={`min-w-[110px] text-center font-semibold ${isCurrent
                                                                    ? "bg-primary/[0.08] text-primary"
                                                                    : ""
                                                                }`}
                                                        >
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span>
                                                                    {
                                                                        month.label
                                                                    }
                                                                </span>

                                                                {isCurrent && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="rounded-full bg-primary/10 px-1.5 py-0 text-[9px] font-bold uppercase text-primary"
                                                                    >
                                                                        Now
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableHead>
                                                    );
                                                }
                                            )}
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {tableRows.map(
                                            ({
                                                item,
                                                itemCategory,
                                                monthInstallment,
                                                installmentMap,
                                                downPayment,
                                            }) => (
                                                <TableRow
                                                    key={item.id}
                                                    className="group border-border/60 transition-colors hover:bg-muted/30"
                                                >
                                                    {/* Item */}
                                                    <TableCell className="sticky left-0 z-10 bg-card group-hover:bg-muted/30">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                                <CreditCard className="h-4 w-4" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold text-foreground">
                                                                    {
                                                                        itemCategory
                                                                    }
                                                                </p>

                                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                                    {formatCurrency(
                                                                        toNumber(
                                                                            item.amount
                                                                        )
                                                                    )}{" "}
                                                                    ×{" "}
                                                                    {
                                                                        item
                                                                            .pivot
                                                                            .quantity
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Installment count */}
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full px-2.5"
                                                        >
                                                            {
                                                                monthInstallment
                                                            }{" "}
                                                            mo.
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Months */}
                                                    {months.map(
                                                        (
                                                            month
                                                        ) => {
                                                            const data =
                                                                installmentMap[
                                                                month
                                                                    .value
                                                                ];

                                                            const isCurrent =
                                                                month.value ===
                                                                currentMonth;

                                                            if (
                                                                !data
                                                            ) {
                                                                return (
                                                                    <TableCell
                                                                        key={
                                                                            month.value
                                                                        }
                                                                        className={`text-center ${isCurrent
                                                                                ? "bg-primary/[0.04]"
                                                                                : ""
                                                                            }`}
                                                                    >
                                                                        <span className="text-muted-foreground/40">
                                                                            —
                                                                        </span>
                                                                    </TableCell>
                                                                );
                                                            }

                                                            const status =
                                                                getStatus(
                                                                    data
                                                                );

                                                            const StatusIcon =
                                                                status.icon;

                                                            return (
                                                                <TableCell
                                                                    key={
                                                                        month.value
                                                                    }
                                                                    className={`p-2 text-center ${isCurrent
                                                                            ? "bg-primary/[0.05]"
                                                                            : ""
                                                                        }`}
                                                                >
                                                                    <Tooltip>
                                                                        <TooltipTrigger
                                                                            asChild
                                                                        >
                                                                            <div
                                                                                className={`mx-auto flex max-w-[105px] cursor-help flex-col items-center rounded-xl border p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${status.className}`}
                                                                            >
                                                                                <div className="flex items-center gap-1">
                                                                                    <StatusIcon className="h-3 w-3" />

                                                                                    <span className="text-[10px] font-bold uppercase tracking-wide">
                                                                                        {
                                                                                            status.label
                                                                                        }
                                                                                    </span>
                                                                                </div>

                                                                                <span
                                                                                    className={`mt-1 text-xs font-bold ${status.amountClass}`}
                                                                                >
                                                                                    {formatCurrency(
                                                                                        data.balance
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        </TooltipTrigger>

                                                                        <TooltipContent
                                                                            side="top"
                                                                            className="max-w-[240px]"
                                                                        >
                                                                            <div className="space-y-1.5">
                                                                                <p className="font-semibold">
                                                                                    {
                                                                                        month.label
                                                                                    }{" "}
                                                                                    installment
                                                                                </p>

                                                                                <div className="flex justify-between gap-6 text-xs">
                                                                                    <span className="text-muted-foreground">
                                                                                        Monthly due
                                                                                    </span>

                                                                                    <span>
                                                                                        {formatCurrency(
                                                                                            data.due
                                                                                        )}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="flex justify-between gap-6 text-xs">
                                                                                    <span className="text-muted-foreground">
                                                                                        Remaining
                                                                                    </span>

                                                                                    <span>
                                                                                        {formatCurrency(
                                                                                            data.balance
                                                                                        )}
                                                                                    </span>
                                                                                </div>

                                                                                {downPayment >
                                                                                    0 && (
                                                                                        <div className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                                                                                            {formatCurrency(
                                                                                                downPayment
                                                                                            )}{" "}
                                                                                            down payment applied
                                                                                        </div>
                                                                                    )}
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            );
                                                        }
                                                    )}
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border/60 px-5 py-4 sm:px-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Info className="h-3.5 w-3.5" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {currentMonthLabel} payment status
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Remaining scheduled amount for this month.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-2.5 text-left sm:text-right">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            Total due
                                        </p>

                                        <p className="mt-0.5 text-lg font-bold text-primary">
                                            {formatCurrency(
                                                totalDueThisMonth
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        );
    };
