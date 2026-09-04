import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import {
    Banknote,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CreditCard,
    FileText,
    Loader2,
    ReceiptText,
    WalletCards,
} from 'lucide-react'

interface Payment {
    id: number
    or_number: string
    amount: number | string
    payment_method: string
    payment_date: string
    remarks: string | null
    billing?: {
        category?: {
            name: string
        }
    }
}

interface PaymentTableProps {
    payments: Payment[]
    paymentMethodColors?: Record<string, string>
}

const PAYMENT_METHODS = {
    cash: {
        label: 'Cash',
        icon: Banknote,
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    gcash: {
        label: 'GCash',
        icon: WalletCards,
        className:
            'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
    },
    bank_transfer: {
        label: 'Bank Transfer',
        icon: CreditCard,
        className:
            'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300',
    },
    check: {
        label: 'Check',
        icon: FileText,
        className:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
    },
} as const

const REMARKS = {
    partial_payment: {
        label: 'Partial Payment',
        className:
            'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300',
    },
    down_payment: {
        label: 'Down Payment',
        className:
            'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
    },
    full_payment: {
        label: 'Full Payment',
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
} as const

const formatCurrency = (value: number | string) => {
    const amount = Number(value)

    if (!Number.isFinite(amount)) {
        return '₱0.00'
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

const formatDate = (date: string) => {
    if (!date) return '—'

    const parsed = new Date(`${date}T00:00:00`)

    if (Number.isNaN(parsed.getTime())) {
        return date
    }

    return parsed.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const getPaymentMethod = (method: string) => {
    return (
        PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS] ?? {
            label: method
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase()),
            icon: ReceiptText,
            className:
                'border-border bg-muted text-muted-foreground',
        }
    )
}

const getRemark = (remark: string | null | undefined) => {
    if (!remark) {
        return {
            label: 'No Remark',
            className:
                'border-border bg-muted text-muted-foreground',
        }
    }

    return (
        REMARKS[remark as keyof typeof REMARKS] ?? {
            label: remark
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase()),
            className:
                'border-border bg-muted text-muted-foreground',
        }
    )
}


export function PaymentTable({
    payments,
}: PaymentTableProps) {
    const [localPayments, setLocalPayments] = useState<Payment[]>(payments)
    const [updatingPaymentId, setUpdatingPaymentId] = useState<number | null>(
        null,
    )

    useEffect(() => {
        setLocalPayments(payments)
    }, [payments])

    const handleUpdateRemarks = (
        paymentId: number,
        newRemarks: string,
    ) => {
        const previousPayment = localPayments.find(
            (payment) => payment.id === paymentId,
        )

        if (!previousPayment || previousPayment.remarks === newRemarks) {
            return
        }

        /*
         * Optimistic update:
         * Update the UI immediately instead of waiting for Laravel/Inertia.
         */
        setLocalPayments((prev) =>
            prev.map((payment) =>
                payment.id === paymentId
                    ? {
                        ...payment,
                        remarks: newRemarks,
                    }
                    : payment,
            ),
        )

        setUpdatingPaymentId(paymentId)

        router.post(
            `/billing/payments/${paymentId}/update-remarks`,
            {
                remarks: newRemarks,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success('Payment remark updated.', {
                        description:
                            'The payment record has been updated successfully.',
                    })
                },

                onError: () => {
                    /*
                     * Rollback optimistic update when the server rejects it.
                     */
                    setLocalPayments((prev) =>
                        prev.map((payment) =>
                            payment.id === paymentId
                                ? previousPayment
                                : payment,
                        ),
                    )

                    toast.error('Unable to update payment remark.', {
                        description:
                            'Your previous remark has been restored.',
                    })
                },

                onFinish: () => {
                    setUpdatingPaymentId(null)
                },
            },
        )
    }

    if (localPayments.length === 0) {
        return (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ReceiptText className="h-7 w-7" />
                </div>

                <h3 className="text-base font-semibold text-foreground">
                    No payment records yet
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Payments recorded for this student will appear here.
                    Once a payment is added, you’ll see the OR number,
                    billing item, payment method, date, and amount.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                                <TableHead className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    OR Number
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Billing Item
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Method
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Remarks
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Date
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Amount
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {localPayments.map((payment) => {
                                const method = getPaymentMethod(
                                    payment.payment_method,
                                )

                                const remark = getRemark(payment.remarks)

                                const MethodIcon = method.icon

                                const isUpdating =
                                    updatingPaymentId === payment.id

                                return (
                                    <TableRow
                                        key={payment.id}
                                        className="group border-border/50 transition-colors hover:bg-muted/30"
                                    >
                                        {/* OR Number */}
                                        <TableCell className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <ReceiptText className="h-4 w-4" />
                                                </div>

                                                <span className="font-mono text-sm font-semibold text-foreground">
                                                    {payment.or_number}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Billing Item */}
                                        <TableCell className="px-4 py-4">
                                            <div className="max-w-[220px]">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {payment.billing?.category
                                                        ?.name ?? 'Unassigned'}
                                                </p>

                                                {!payment.billing?.category
                                                    ?.name && (
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            No billing category
                                                        </p>
                                                    )}
                                            </div>
                                        </TableCell>

                                        {/* Payment Method */}
                                        <TableCell className="px-4 py-4">
                                            <Badge
                                                variant="outline"
                                                className={`gap-1.5 rounded-full px-2.5 py-1 font-medium capitalize ${method.className}`}
                                            >
                                                <MethodIcon className="h-3.5 w-3.5" />

                                                {method.label}
                                            </Badge>
                                        </TableCell>

                                        {/* Remarks */}
                                        <TableCell className="px-4 py-4">
                                            <div className="relative">
                                                <Select
                                                    value={payment.remarks ?? ''}
                                                    onValueChange={(value) =>
                                                        handleUpdateRemarks(payment.id, value)
                                                    }
                                                    disabled={isUpdating}
                                                >

                                                    <SelectTrigger
                                                        className={`h-9 w-[175px] border-border/70 bg-background text-xs font-medium shadow-none transition-all focus:ring-2 focus:ring-primary/20 ${isUpdating
                                                            ? 'opacity-70'
                                                            : ''
                                                            }`}
                                                    >
                                                        {isUpdating ? (
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                                                <span>
                                                                    Updating...
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <SelectValue>
                                                                <span
                                                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${remark.className}`}
                                                                >
                                                                    {
                                                                        remark.label
                                                                    }
                                                                </span>
                                                            </SelectValue>
                                                        )}

                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="partial_payment">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-orange-500" />
                                                                Partial Payment
                                                            </div>
                                                        </SelectItem>

                                                        <SelectItem value="down_payment">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                                Down Payment
                                                            </div>
                                                        </SelectItem>

                                                        <SelectItem value="full_payment">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                Full Payment
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarDays className="h-4 w-4 shrink-0 text-primary/70" />

                                                <span className="whitespace-nowrap">
                                                    {formatDate(
                                                        payment.payment_date,
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Amount */}
                                        <TableCell className="px-4 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-bold tabular-nums text-foreground">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </span>

                                                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                    Payment
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
