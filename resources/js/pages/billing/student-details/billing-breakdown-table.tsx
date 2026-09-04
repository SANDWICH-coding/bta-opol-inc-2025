import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Badge,
} from '@/components/ui/badge'
import {
    CircleDollarSign,
    CreditCard,
    Minus,
    Package,
    Percent,
    ReceiptText,
    WalletCards,
} from 'lucide-react'

interface BillingItem {
    id: number
    description?: string | null
    amount: string | number | null
    category?: {
        name?: string | null
    } | null
    pivot: {
        quantity: number | string | null
    }
}

interface Discount {
    value: 'fixed' | 'percentage'
    amount: string | number | null
    category?: {
        name?: string | null
    } | null
}

interface Payment {
    amount: string | number | null
    billing?: {
        description?: string | null
        category?: {
            name?: string | null
        } | null
    } | null
}

interface BillingBreakdownTableProps {
    billingItems: BillingItem[]
    discounts: Discount[]
    payments: Payment[]
}

const toNumber = (
    value: string | number | null | undefined,
): number => {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : 0
}

const formatCurrency = (
    value: string | number | null | undefined,
) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(toNumber(value))
}

const formatQuantity = (
    value: string | number | null | undefined,
) => {
    const quantity = toNumber(value)

    return Number.isInteger(quantity)
        ? quantity.toString()
        : quantity.toFixed(2)
}

const getDiscountLabel = (discount: Discount) => {
    const amount = toNumber(discount.amount)

    if (discount.value === 'percentage') {
        return `${amount}%`
    }

    return formatCurrency(amount)
}

export function BillingBreakdownTable({
    billingItems,
    discounts,
    payments,
}: BillingBreakdownTableProps) {
    if (billingItems.length === 0) {
        return (
            <div className="flex min-h-[260px] mb-10 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ReceiptText className="h-7 w-7" />
                </div>

                <h3 className="text-base font-semibold text-foreground">
                    No billing items yet
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Billing items assigned to this student will appear here.
                    Add a bill item to start tracking the balance.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 mb-10">

            {/* Responsive table */}
            <div className="overflow-hidden border border-border/60 bg-background shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                                <TableHead className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Item
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Unit Amount
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Quantity
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Discount
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Subtotal
                                </TableHead>

                                <TableHead className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Balance
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {billingItems.map((item) => {
                                const categoryName =
                                    item.category?.name?.trim() ||
                                    'Uncategorized'

                                const description =
                                    item.description?.trim() ||
                                    categoryName

                                const quantity = toNumber(
                                    item.pivot?.quantity,
                                )

                                const amount = toNumber(item.amount)

                                const baseSubtotal =
                                    amount * quantity

                                /*
                                 * Find discounts assigned to this
                                 * billing category.
                                 */
                                const matchingDiscounts =
                                    discounts.filter(
                                        (discount) =>
                                            discount.category?.name ===
                                            item.category?.name,
                                    )

                                let totalDiscount = 0

                                const discountLabels =
                                    matchingDiscounts.map(
                                        (discount) => {
                                            const discountValue =
                                                toNumber(
                                                    discount.amount,
                                                )

                                            let calculatedDiscount = 0

                                            if (
                                                discount.value ===
                                                'fixed'
                                            ) {
                                                calculatedDiscount =
                                                    discountValue
                                            } else {
                                                calculatedDiscount =
                                                    (baseSubtotal *
                                                        discountValue) /
                                                    100
                                            }

                                            totalDiscount +=
                                                calculatedDiscount

                                            return getDiscountLabel(
                                                discount,
                                            )
                                        },
                                    )

                                const finalSubtotal = Math.max(
                                    baseSubtotal - totalDiscount,
                                    0,
                                )

                                /*
                                 * Match payments primarily by billing
                                 * description, which is how the original
                                 * implementation worked.
                                 */
                                const totalPaid =
                                    payments
                                        .filter(
                                            (payment) =>
                                                payment.billing
                                                    ?.description ===
                                                item.description,
                                        )
                                        .reduce(
                                            (sum, payment) =>
                                                sum +
                                                toNumber(
                                                    payment.amount,
                                                ),
                                            0,
                                        )

                                const balance = Math.max(
                                    finalSubtotal - totalPaid,
                                    0,
                                )

                                const isPaid =
                                    finalSubtotal > 0 &&
                                    balance <= 0

                                const hasPayment =
                                    totalPaid > 0

                                return (
                                    <TableRow
                                        key={item.id}
                                        className="group border-border/50 transition-colors hover:bg-muted/30"
                                    >
                                        {/* Item */}
                                        <TableCell className="px-4 py-4">
                                            <div className="flex min-w-[190px] items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                                    <Package className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {
                                                            categoryName
                                                        }
                                                    </p>

                                                    {description !==
                                                        categoryName && (
                                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                            {
                                                                description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Unit Amount */}
                                        <TableCell className="px-4 py-4">
                                            <span className="whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
                                                {formatCurrency(
                                                    amount,
                                                )}
                                            </span>
                                        </TableCell>

                                        {/* Quantity */}
                                        <TableCell className="px-4 py-4 text-center">
                                            <Badge
                                                variant="outline"
                                                className="rounded-full border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground"
                                            >
                                                ×{' '}
                                                {formatQuantity(
                                                    quantity,
                                                )}
                                            </Badge>
                                        </TableCell>

                                        {/* Discount */}
                                        <TableCell className="px-4 py-4">
                                            {matchingDiscounts.length >
                                            0 ? (
                                                <div className="flex min-w-[130px] flex-wrap items-center gap-1.5">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        <Percent className="h-3.5 w-3.5" />
                                                    </div>

                                                    <div className="flex flex-wrap gap-1">
                                                        {discountLabels.map(
                                                            (
                                                                label,
                                                                index,
                                                            ) => (
                                                                <Badge
                                                                    key={`${item.id}-discount-${index}`}
                                                                    variant="outline"
                                                                    className="rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                                >
                                                                    -
                                                                    {label}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Minus className="h-3.5 w-3.5" />
                                                    No discount
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Subtotal */}
                                        <TableCell className="px-4 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">
                                                    {formatCurrency(
                                                        finalSubtotal,
                                                    )}
                                                </span>

                                                {totalDiscount > 0 && (
                                                    <span className="mt-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                                        {
                                                            formatCurrency(
                                                                totalDiscount,
                                                            )
                                                        }{' '}
                                                        saved
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Balance */}
                                        <TableCell className="px-4 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span
                                                    className={`whitespace-nowrap text-sm font-bold tabular-nums ${
                                                        isPaid
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-foreground'
                                                    }`}
                                                >
                                                    {formatCurrency(
                                                        balance,
                                                    )}
                                                </span>

                                                {isPaid ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1 rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                    >
                                                        <CircleDollarSign className="h-3 w-3" />
                                                        Paid
                                                    </Badge>
                                                ) : hasPayment ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1 rounded-full border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300"
                                                    >
                                                        <CreditCard className="h-3 w-3" />
                                                        Partial
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1 rounded-full border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                                                    >
                                                        <CreditCard className="h-3 w-3" />
                                                        Unpaid
                                                    </Badge>
                                                )}
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
