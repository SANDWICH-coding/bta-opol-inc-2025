import AppLayout from '@/layouts/app-layout'
import { Head, router, usePage } from '@inertiajs/react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { type BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast, Toaster } from 'sonner'
import { AlertCircleIcon, BadgeIcon, BanknoteIcon, CalendarIcon, CheckIcon, CircleAlert, CircleMinus, Coins, CreditCard, CreditCardIcon, FileTextIcon, LayersIcon, Loader2, LucideVenetianMask, MapPinIcon, Plus, ScrollTextIcon, TicketCheck, UserIcon, UsersIcon, WalletCards, WalletIcon, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import React from "react";

interface BillingCategory {
    name: string
}

interface BillingItem {
    id: number
    description: string
    amount: string
    category: BillingCategory
}

interface BillingDisc {
    id: number
    description: string
    value: 'fixed' | 'percentage'
    amount: string
    category: BillingCategory
}

interface SoaFile {
    id: number
    file_name: string
    file_path: string
    generated_at: string
}

interface EnrollmentDetails {
    id: number
    type: string
    student: {
        id: number
        lrn: string
        firstName: string
        lastName: string
        middleName?: string
        suffix?: string
        birthDate: string
        gender: 'male' | 'female'
    }
    class_arm: {
        classArmName: string
        year_level: {
            id: number
            yearLevelName: string
            billings: BillingItem[]
            school_year: {
                id: number
                name: string
            }
        }
    }
    billing_discounts: BillingDisc[]
    soa_files?: SoaFile[]
}

interface BillingPayment {
    id: number
    or_number: string
    payment_date: string
    amount: string
    payment_method: string
    billing: {
        category: {
            name: string
        }
        description: string
    }
}

export default function BillingStudentDetailsPage() {
    const { enrollment, availableDiscounts, paymentHistory, billingItems, soaFiles } = usePage().props as {
        enrollment: EnrollmentDetails
        availableDiscounts: BillingDisc[]
        paymentHistory: BillingPayment[]
        billingItems: BillingItem[]
        soaFiles: SoaFile[]
    }


    const fullName = `${enrollment.student.lastName}, ${enrollment.student.firstName} ${enrollment.student.middleName ?? ''} ${enrollment.student.suffix ?? ''}`

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Billing', href: '/billing' },
        {
            title: enrollment.class_arm.year_level.school_year.name,
            href: `/billing/school-year/${enrollment.class_arm.year_level.school_year.id}`,
        },
        {
            title: enrollment.class_arm.year_level.yearLevelName,
            href: `/billing/year-level/${enrollment.class_arm.year_level.id}`,
        },
        { title: enrollment.student.lastName, href: '#' },
    ]

    const billingByCategoryMap = enrollment.class_arm.year_level.billings.reduce((map, billing) => {
        const cat = billing.category.name
        if (!map[cat]) {
            map[cat] = {
                category: cat,
                totalBilling: 0,
                billingDescriptions: [],
            }
        }
        map[cat].totalBilling += Number(billing.amount)
        map[cat].billingDescriptions.push(billing.description ?? '—')
        return map
    }, {} as Record<string, {
        category: string
        totalBilling: number
        billingDescriptions: string[]
    }>)

    const discountByCategoryMap = enrollment.billing_discounts.reduce((map, discount) => {
        const cat = discount.category.name // ✅ FIXED LINE
        if (!map[cat]) {
            map[cat] = []
        }
        map[cat].push(discount) // ✅ no longer discount.billing_disc
        return map
    }, {} as Record<string, BillingDisc[]>)

    const paymentsByCategory = paymentHistory.reduce((map, payment) => {
        const cat = payment.billing.category.name
        if (!map[cat]) {
            map[cat] = 0
        }
        map[cat] += parseFloat(payment.amount)
        return map
    }, {} as Record<string, number>)

    const groupedSummary = Object.values(billingByCategoryMap).map((entry) => {
        const { category, totalBilling, billingDescriptions } = entry;
        const discounts = discountByCategoryMap[category] ?? [];

        let totalDiscount = 0;
        const discountDescriptions: string[] = [];

        discounts.filter(d => d.value === 'percentage').forEach(disc => {
            const discountAmount = totalBilling * (Number(disc.amount) / 100);
            totalDiscount += discountAmount;
            discountDescriptions.push(`${disc.description} (${disc.amount}%)`);
        });

        discounts.filter(d => d.value === 'fixed').forEach(disc => {
            const discountAmount = Number(disc.amount);
            totalDiscount += discountAmount;
            discountDescriptions.push(`${disc.description} (₱${discountAmount})`);
        });

        const totalAfterDiscount = Math.max(totalBilling - totalDiscount, 0);
        const paidAmount = paymentsByCategory[category] ?? 0;
        const remaining = Math.max(totalAfterDiscount - paidAmount, 0);

        const monthlyBalance = remaining / 10;

        return {
            category,
            billingAmount: totalBilling,
            discountAmount: totalDiscount,
            discountDescriptions,
            totalAfterDiscount,
            billingDescriptions,
            paidAmount,
            remaining,
            monthlyBalance, // <- include this if you'll use it elsewhere
        };
    });


    // Total Billing After Discount
    const grandTotalAfterDiscount = groupedSummary.reduce((sum, i) => sum + i.totalAfterDiscount, 0)

    // Total Amount Paid
    const totalPaid = paymentHistory.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)

    // Remaining Balance
    const remainingBalance = Math.max(grandTotalAfterDiscount - totalPaid, 0)

    const groupedPayments = paymentHistory.reduce<Record<string, BillingPayment[]>>((acc, payment) => {
        if (!acc[payment.or_number]) acc[payment.or_number] = [];
        acc[payment.or_number].push(payment);
        return acc;
    }, {});

    const soaMonths = [
        "June", "July", "August", "September", "October",
        "November", "December", "January", "February", "March",
    ];

    function calculateMonthlySOA(
        totalDue: number,
        payments: number[],
        startMonthIndex: number = 0,
        monthCount: number = 10
    ) {
        const monthStatus = Array.from({ length: 10 }, () => ({ paid: 0, balance: 0 }));

        const perMonth = totalDue / monthCount;

        for (let i = startMonthIndex; i < startMonthIndex + monthCount; i++) {
            if (i >= 10) break;
            monthStatus[i].balance = perMonth;
        }

        let remainingPayments = [...payments];

        for (let i = 0; i < 10; i++) {
            let expected = monthStatus[i].balance;
            let paid = 0;

            while (remainingPayments.length && paid < expected) {
                const pay = remainingPayments[0];
                const toApply = Math.min(expected - paid, pay);
                paid += toApply;
                remainingPayments[0] -= toApply;

                if (remainingPayments[0] <= 0) {
                    remainingPayments.shift();
                }
            }

            monthStatus[i].paid = paid;
            monthStatus[i].balance = Math.max(expected - paid, 0);
        }

        return monthStatus;
    }


    const today = new Date();
    const currentMonthIndex = Math.min(today.getMonth() - 5, 9); // June = index 0


    const soaTableData = groupedSummary.map((item) => {
        const category = item.category;

        const payments = paymentHistory
            .filter(p => p.billing.category.name === category)
            .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())
            .map(p => parseFloat(p.amount));

        // Start "BOOKS" in August (index 2), else default to June (index 0)
        const isBooks = category === 'BOOKS';
        const startMonthIndex = isBooks ? 2 : 0;
        const months = isBooks ? 8 : 10;

        const monthlyStatus = calculateMonthlySOA(item.totalAfterDiscount, payments, startMonthIndex, months);

        return {
            category,
            monthlyStatus,
        };
    });

    const paymentsByCategoryAndMonth = {} as Record<string, Record<string, number>>;

    paymentHistory.forEach(payment => {
        const cat = payment.billing.category.name;
        const month = new Date(payment.payment_date).toLocaleString('default', { month: 'long' });

        if (!paymentsByCategoryAndMonth[cat]) paymentsByCategoryAndMonth[cat] = {};
        if (!paymentsByCategoryAndMonth[cat][month]) paymentsByCategoryAndMonth[cat][month] = 0;

        paymentsByCategoryAndMonth[cat][month] += parseFloat(payment.amount);
    });

    const [showModal, setShowModal] = useState(false)
    const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>(
        enrollment.billing_discounts.map((disc) => disc.id)
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAdd = () => {
        setShowModal(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        router.post('/billing/apply-discount', {
            enrollment_id: enrollment.id,
            discount_ids: selectedDiscounts,
        }, {
            onSuccess: () => {
                setIsSubmitting(false)
                setShowModal(false)
                toast.success('Discounts updated successfully')
            },
            onError: () => {
                setIsSubmitting(false)
                toast.error('Failed to update discounts')
            },
        })
    }

    const handleCheckboxChange = (discountId: number) => {
        setSelectedDiscounts(prev =>
            prev.includes(discountId)
                ? prev.filter(id => id !== discountId)
                : [...prev, discountId]
        )
    }

    const [showAddPayment, setShowAddPayment] = useState(false)
    const [selectedBillingId, setSelectedBillingId] = useState<number | null>(null)
    const [orNumber, setOrNumber] = useState('')
    const [paymentDate, setPaymentDate] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('')
    const [amount, setAmount] = useState('')
    const [isAddingPayment, setIsAddingPayment] = useState(false)

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault()

        if (!orNumber || !paymentDate) {
            toast.error('OR Number and Date are required')
            return
        }

        const invalidRow = paymentRows.some(
            row => !row.billing_id || !row.amount || !row.payment_method
        )

        if (invalidRow) {
            toast.warning('Please fill in all billing item rows completely')
            return
        }

        setIsAddingPayment(true)

        router.post('/billing/add-payment', {
            enrollment_id: enrollment.id,
            or_number: orNumber,
            payment_date: paymentDate,
            items: paymentRows,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Payments recorded successfully')
                setIsAddingPayment(false)
                setShowAddPayment(false)
                setPaymentRows([{ billing_id: null, amount: '', payment_method: '' }])
                setOrNumber('')
                setPaymentDate('')
            },
            onError: () => {
                toast.error('Failed to record payment')
                setIsAddingPayment(false)
            },
        })
    }

    const [paymentRows, setPaymentRows] = useState([{ billing_id: null, amount: '', payment_method: '' }])

    const groupedBillingItems = billingItems.reduce((acc, item) => {
        const summary = groupedSummary.find(g => g.category === item.category.name)
        const remaining = summary?.remaining ?? 0
        if (remaining <= 0) return acc

        if (!acc[item.category.name]) acc[item.category.name] = []
        acc[item.category.name].push(item)
        return acc
    }, {} as Record<string, BillingItem[]>)

    const updateRow = (index: number, field: keyof typeof paymentRows[number], value: any) => {
        const updated = [...paymentRows]
        updated[index][field] = value
        setPaymentRows(updated)
    }

    const addPaymentRow = () => {
        setPaymentRows([...paymentRows, { billing_id: null, amount: '', payment_method: '' }])
    }

    const removePaymentRow = (idx: number) => {
        setPaymentRows((rows) => rows.filter((_, i) => i !== idx))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={fullName} />
            <Toaster richColors position="top-center" />
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Personal details of the enrolled student.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <Table>
                                <TableBody>
                                    {[
                                        {
                                            label: {
                                                text: "LRN",
                                                icon: <BadgeIcon className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: enrollment.student.lrn || <span className="text-muted-foreground">—</span>,
                                        },
                                        {
                                            label: {
                                                text: "Name",
                                                icon: <UserIcon className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: (
                                                <span className="capitalize">
                                                    {enrollment.student.firstName}{" "}
                                                    {enrollment.student.middleName
                                                        ? enrollment.student.middleName.charAt(0) + "."
                                                        : ""}
                                                    {" "}
                                                    {enrollment.student.lastName}{" "}
                                                    {enrollment.student.suffix ?? ""}
                                                </span>
                                            ),
                                        },
                                        {
                                            label: {
                                                text: "Gender",
                                                icon: <LucideVenetianMask className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: (
                                                <span className="capitalize">
                                                    {enrollment.student.gender}
                                                </span>
                                            ),
                                        },
                                        {
                                            label: {
                                                text: "Birth Date",
                                                icon: <CalendarIcon className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: enrollment.student.birthDate
                                                ? enrollment.student.birthDate
                                                : <CircleAlert className="text-destructive w-4 h-4 inline" />,
                                        },
                                        {
                                            label: {
                                                text: "Address",
                                                icon: <MapPinIcon className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: <span className="text-muted-foreground">Not set</span>,
                                        },
                                    ].map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={2} className="sm:hidden p-2 lg:p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">{item.label.text}</span>
                                                    {typeof item.value === "string" ? (
                                                        <span className="uppercase">{item.value}</span>
                                                    ) : (
                                                        item.value
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="hidden sm:table-cell font-medium text-muted-foreground sm:w-1/3 sm:p-2 lg:p-4">
                                                <span>{item.label.text}</span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell sm:p-2 lg:p-4">
                                                {typeof item.value === "string" ? (
                                                    <span className="uppercase">{item.value}</span>
                                                ) : (
                                                    item.value
                                                )}
                                            </TableCell>
                                        </TableRow>

                                    ))}
                                </TableBody>
                            </Table>

                            <Table>
                                <TableBody>
                                    {[
                                        {
                                            label: {
                                                text: "S.Y.",
                                                icon: <ScrollTextIcon className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: enrollment.class_arm.year_level.school_year.name,
                                        },
                                        {
                                            label: {
                                                text: "Enrollment Type",
                                                icon: <FileTextIcon className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: enrollment.type,
                                        },
                                        {
                                            label: {
                                                text: "Year Level",
                                                icon: <LayersIcon className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: enrollment.class_arm.year_level.yearLevelName,
                                        },
                                        {
                                            label: {
                                                text: "Class",
                                                icon: <UsersIcon className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: enrollment.class_arm.classArmName,
                                        },
                                        {
                                            label: {
                                                text: "Status",
                                                icon: <AlertCircleIcon className="w-4 h-4 text-muted-foreground" />,
                                            },
                                            value: <span className="text-muted-foreground">Not set</span>,
                                        },
                                    ].map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={2} className="sm:hidden p-2 lg:p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">{item.label.text}</span>
                                                    {typeof item.value === "string" ? (
                                                        <span className="uppercase">{item.value}</span>
                                                    ) : (
                                                        item.value
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="hidden sm:table-cell font-medium text-muted-foreground sm:w-1/3 sm:p-2 lg:p-4">
                                                <span>{item.label.text}</span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell sm:p-2 lg:p-4">
                                                {typeof item.value === "string" ? (
                                                    <span className="uppercase">{item.value}</span>
                                                ) : (
                                                    item.value
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="payments" className="mt-3">
                    <TabsList>
                        <TabsTrigger value="payments">Payment</TabsTrigger>
                        <TabsTrigger value="soa">Account</TabsTrigger>
                        <TabsTrigger value="files">Files</TabsTrigger>
                    </TabsList>

                    {/* Payment History */}
                    <TabsContent value="payments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Records</CardTitle>
                                <CardDescription>
                                    Track payment history and transaction details.
                                </CardDescription>
                                <CardAction>
                                    <Button onClick={() => setShowAddPayment(true)} variant="link">Add Payment</Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                {paymentHistory.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>OR #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.entries(groupedPayments).map(([orNumber, payments]) => {
                                                const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

                                                return (
                                                    <React.Fragment key={orNumber}>
                                                        {payments.map((payment, idx) => (
                                                            <TableRow key={payment.id}>
                                                                <TableCell>{idx === 0 ? payment.or_number : ''}</TableCell>
                                                                <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                                                <TableCell>{payment.billing.category.name}</TableCell>
                                                                <TableCell>{payment.payment_method}</TableCell>
                                                                <TableCell>
                                                                    ₱{parseFloat(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </TableCell>
                                                                <TableCell></TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {/* Total Row */}
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-right text-muted-foreground">
                                                            </TableCell>
                                                            <TableCell className="text-right text-muted-foreground">
                                                                <span className="font-bold text-green-700 ">₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-muted-foreground">No payments recorded yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SOA */}
                    <TabsContent value="soa">
                        <Card>
                            <CardHeader>
                                <CardTitle>Statement of Account</CardTitle>
                                <CardDescription>
                                    Summary of billing and payments.
                                </CardDescription>
                                <CardAction>
                                    <Button asChild>
                                        <a href={`/billing/generate-soa/student/${enrollment.student.id}`} target="_blank" rel="noopener noreferrer">
                                            Generate SOA
                                        </a>
                                    </Button>
                                    <Button onClick={handleAdd} variant="outline">Modify Discount</Button>
                                </CardAction>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    {/* Bill summary */}
                                    <Card>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead>Billing</TableHead>
                                                        <TableHead>Discounts</TableHead>
                                                        <TableHead>Total Payable</TableHead>
                                                        <TableHead>Paid</TableHead>
                                                        <TableHead>Remaining</TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {groupedSummary.map((item, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>{item.category}</TableCell>
                                                            <TableCell className="text-muted-foreground">₱{item.billingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                            <TableCell>
                                                                {item.discountDescriptions.length > 0
                                                                    ? item.discountDescriptions.map((desc, i) => <div key={i}>{desc}</div>)
                                                                    : <span className="text-muted-foreground">—</span>}
                                                            </TableCell>
                                                            <TableCell>
                                                                ₱{item.totalAfterDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                ₱{item.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </TableCell>
                                                            <TableCell className="text-red-400">
                                                                ₱{item.remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}

                                                    {/* Totals Row */}
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-right font-semibold"></TableCell>
                                                        <TableCell className="font-bold text-green-700">
                                                            ₱{groupedSummary.reduce((sum, i) => sum + i.totalAfterDiscount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell className="font-bold text-blue-600">
                                                            ₱{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell className="font-bold text-red-600">
                                                            ₱{remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>

                                    {/* Payment summary */}
                                    <Card>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead></TableHead>
                                                        {soaMonths.map((month, i) => (
                                                            <TableHead key={i} className="text-center">{month}</TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {soaTableData
                                                        .filter(({ category }) => category !== 'REGISTRATION' && category !== 'BOOKS' && category !== 'SCHOOL UNIFORM')
                                                        .map(({ category, monthlyStatus }, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className="font-medium">{category}</TableCell>
                                                                {monthlyStatus.map((month, i) => (
                                                                    <TableCell key={i} className="text-right">
                                                                        {i <= currentMonthIndex ? (
                                                                            <>
                                                                                <div className="text-green-700 font-semibold">
                                                                                    ₱{month.paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                                                </div>
                                                                                <div className="text-red-500 text-xs">
                                                                                    Bal: ₱{month.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <div className="text-gray-400 text-xs italic text-center">—</div>
                                                                        )}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}

                                                    {/* Total row per month */}
                                                    <TableRow className="border-t-2">
                                                        <TableCell className="font-bold">Total Balance</TableCell>
                                                        {Array.from({ length: 10 }).map((_, i) => {
                                                            if (i > currentMonthIndex) {
                                                                return (
                                                                    <TableCell key={i} className="text-center text-gray-400 italic">
                                                                        —
                                                                    </TableCell>
                                                                );
                                                            }

                                                            const totalBalance = soaTableData
                                                                .filter(row => row.category !== 'REGISTRATION' && row.category !== 'BOOKS' && row.category !== 'SCHOOL UNIFORM')
                                                                .reduce((sum, row) => sum + row.monthlyStatus[i].balance, 0);

                                                            return (
                                                                <TableCell key={i} className="text-right text-red-600 font-bold">
                                                                    ₱{totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>

                                                    {/* Due Today Total Balance */}
                                                    <TableRow className="border-t">
                                                        <TableCell className="font-bold"></TableCell>
                                                        {Array.from({ length: 10 }).map((_, i) => {
                                                            if (i === 0) {
                                                                const dueTodayTotal = soaTableData
                                                                    .filter(({ category }) => category !== 'REGISTRATION' && category !== 'BOOKS' && category !== 'SCHOOL UNIFORM')
                                                                    .reduce((sum, row) => {
                                                                        return sum + row.monthlyStatus
                                                                            .slice(0, currentMonthIndex + 1)
                                                                            .reduce((mSum, m) => mSum + m.balance, 0);
                                                                    }, 0);

                                                                return (
                                                                    <TableCell
                                                                        key={i}
                                                                        colSpan={10}
                                                                        className="text-right text-red-700 font-bold pr-4"
                                                                    >
                                                                        ₱{dueTodayTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} due as of {soaMonths[currentMonthIndex]}
                                                                    </TableCell>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>

                        </Card>
                    </TabsContent>

                    <TabsContent value="files">
                        {/* SOA Files */}
                        <Card>
                            <CardContent>
                                <div>
                                    {soaFiles.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>File Name</TableHead>
                                                    <TableHead>Date Generated</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {soaFiles.map((file) => (
                                                    <TableRow key={file.id}>
                                                        <TableCell>{file.file_name}</TableCell>
                                                        <TableCell>{new Date(file.generated_at).toLocaleString()}</TableCell>
                                                        <TableCell className="text-right">
                                                            <a
                                                                href={`/storage/${file.file_path}`}
                                                                target="_blank"
                                                                className="text-blue-600 hover:underline text-sm"
                                                            >
                                                                View PDF
                                                            </a>
                                                        </TableCell>

                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No SOA files generated yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Modify Discounts</DialogTitle>
                        <DialogDescription>
                            Select applicable discounts for this student.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {availableDiscounts.map((disc) => (
                                <Label
                                    key={disc.id}
                                    className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                                >
                                    <Checkbox
                                        id={`disc-${disc.id}`}
                                        checked={selectedDiscounts.includes(disc.id)}
                                        onCheckedChange={() => handleCheckboxChange(disc.id)}
                                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                                    />
                                    <div className="grid gap-1.5 font-normal w-full">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-medium leading-none">
                                                {disc.category.name}
                                            </p>
                                            <Badge variant="outline" className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums text-xs">
                                                - {disc.value === 'percentage' ? `${disc.amount}%` : `₱${disc.amount}`}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm">{disc.description}</p>
                                    </div>
                                </Label>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
                <DialogContent className={`sm:max-w-xl ${paymentRows.length >= 3 ? 'max-h-[80vh] overflow-y-auto' : ''}`}>
                    <DialogHeader>
                        <DialogTitle>Add Payment</DialogTitle>
                        <DialogDescription>Record a payment with multiple billing items under one receipt.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddPayment} className="space-y-4">
                        {/* OR and Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    type="text"
                                    placeholder="OR Number"
                                    value={orNumber}
                                    onChange={(e) => setOrNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Dynamic Payment Rows */}
                        {paymentRows.map((row, idx) => (
                            <div
                                key={idx}
                                className="relative grid gap-4 items-end border p-6 rounded-md sm:grid-cols-2 lg:grid-cols-3"
                            >
                                {paymentRows.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePaymentRow(idx)}
                                        className="absolute top-2 right-2 text-destructive hover:underline"
                                    >
                                        <CircleMinus />
                                    </button>
                                )}

                                {/* Bill Item */}
                                <div>
                                    <Label className="mb-2">Bill item</Label>
                                    <Select
                                        value={row.billing_id ? String(row.billing_id) : ""}
                                        onValueChange={(val) => updateRow(idx, "billing_id", Number(val))}
                                        required
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select item" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(groupedBillingItems).map(([category, items]) => (
                                                <SelectGroup key={category}>
                                                    {items.map((item) => (
                                                        <SelectItem key={item.id} value={String(item.id)}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Amount */}
                                <div>
                                    <Label className="mb-2">Amount</Label>
                                    <Input
                                        type="text"
                                        value={row.amount}
                                        onChange={(e) => updateRow(idx, "amount", e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Method */}
                                <div>
                                    <Label className="mb-2">Method</Label>
                                    <Select
                                        value={row.payment_method}
                                        onValueChange={(val) => updateRow(idx, "payment_method", val)}
                                        required
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Payment methods</SelectLabel>
                                                <SelectItem value="cash">
                                                    <div className="flex items-center gap-2">
                                                        <Coins className="w-4 h-4 text-muted-foreground" />
                                                        <span>Cash</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="gcash">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCardIcon className="w-4 h-4 text-muted-foreground" />
                                                        <span>GCash</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="bank_transfer">
                                                    <div className="flex items-center gap-2">
                                                        <WalletCards className="w-4 h-4 text-muted-foreground" />
                                                        <span>Bank Transfer</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="check">
                                                    <div className="flex items-center gap-2">
                                                        <TicketCheck className="w-4 h-4 text-muted-foreground" />
                                                        <span>Check / Cheque</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}

                        {/* Add More + Total Amount */}
                        <div className="flex items-center justify-between gap-4">
                            <Button type="button" variant="outline" onClick={addPaymentRow}>
                                <Plus className="w-4 h-4 mr-1" /> Bill item
                            </Button>

                            <div className="text-md font-bold text-green-700 text-right">
                                <span className="text-sm">TOTAL:</span> ₱{" "}
                                {paymentRows
                                    .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
                                    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowAddPayment(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isAddingPayment}>
                                {isAddingPayment ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                                    </>
                                ) : 'Record Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
