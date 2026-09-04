import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';

import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    FilePlus2,
    Loader2,
    NotebookPen,
    Percent,
    Plus,
    Printer,
    Receipt,
    Search,
    Settings2,
    Sparkles,
    Trash2,
    WalletCards,
} from 'lucide-react';

import { useMemo, useState } from 'react';
import { toast, Toaster } from 'sonner';

import SearchBarWithSuggestions from '@/components/ui/searchbar';

import { StudentCard } from './student-details/student-card-name';
import { PaymentTable } from './student-details/payment-table';
import { BillingBreakdownTable } from './student-details/billing-breakdown-table';
import { InstallmentPlanTable } from './student-details/installment-plan-table';

type SameSchoolYearEnrollment = {
    id: number;
    lrn: string;
    firstName: string;
    middleName?: string;
    lastName: string;
};

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    gender: 'male' | 'female';
    birthDate?: string;
    profilePhoto?: string;
    lrn?: string;
}

interface BillingItem {
    id: number;
    description: string;
    amount: string;
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
    id: number;
    description: string;
    value: 'fixed' | 'percentage';
    amount: string;
    category: {
        name: string;
    };
}

interface Payment {
    id: number;
    or_number: string;
    payment_date: string;
    payment_method: string;
    remarks: string;
    amount: string;
    billing: {
        description: string;
        category?: {
            name: string;
        };
    };
}

interface EnrollmentDetails {
    id: number;
    student: Student;
    class_arm: {
        classArmName: string;
        year_level: {
            yearLevelName: string;
            school_year: {
                name: string;
            };
        };
    };
    billing_items: BillingItem[];
    billing_discounts: Discount[];
    payments: Payment[];
}

interface Props extends PageProps {
    enrollment: EnrollmentDetails;
    availableDiscounts: Discount[];
    availableBillings: BillingItem[];
    sameSchoolYearEnrollments: SameSchoolYearEnrollment[];
}

type SelectedPayment = {
    billing_id: number | null;
    amount: string;
    payment_method: string;
    remarks: string;
};

const breadcrumbs = (studentName: string): BreadcrumbItem[] => [
    {
        title: 'Students',
        href: '/billing/students',
    },
    {
        title: studentName,
        href: '#',
    },
];

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

const paymentMethodColors: Record<string, string> = {
    cash: '#6366f1',
    gcash: '#8b5cf6',
    bank_transfer: '#ec4899',
    check: '#14b8a6',
};

function toProperCase(name: string) {
    return name
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCurrency(value: number | string) {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function getStudentName(student: Student) {
    return `${toProperCase(student.firstName)}${student.middleName ? ` ${student.middleName.charAt(0).toUpperCase()}.` : ''
        } ${toProperCase(student.lastName)}`;
}

export default function StudentDetails({
    enrollment,
    availableDiscounts = [],
    availableBillings = [],
    sameSchoolYearEnrollments = [],
}: Props) {
    const student = enrollment.student;
    const classArm = enrollment.class_arm;
    const yearLevel = classArm?.year_level;

    const studentName = getStudentName(student);
    const schoolYear = yearLevel?.school_year?.name ?? 'School Year';

    /*
     * --------------------------------------------------------------------------
     * DISCOUNTS
     * --------------------------------------------------------------------------
     */

    const [showDiscountModal, setShowDiscountModal] = useState(false);

    const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>(
        enrollment.billing_discounts.map((discount) => discount.id),
    );

    const [isSubmittingDiscount, setIsSubmittingDiscount] = useState(false);

    const handleDiscountSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        setIsSubmittingDiscount(true);

        router.post(
            '/billing/apply-discount',
            {
                enrollment_id: enrollment.id,
                discount_ids: selectedDiscounts,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDiscountModal(false);
                    toast.success('Discounts updated successfully', {
                        description:
                            'The student billing record has been updated.',
                    });
                },
                onError: () => {
                    toast.error('Unable to update discounts', {
                        description:
                            'Please check the selected discounts and try again.',
                    });
                },
                onFinish: () => {
                    setIsSubmittingDiscount(false);
                },
            },
        );
    };

    const handleCheckboxChange = (discountId: number) => {
        setSelectedDiscounts((previous) =>
            previous.includes(discountId)
                ? previous.filter((id) => id !== discountId)
                : [...previous, discountId],
        );
    };

    /*
     * --------------------------------------------------------------------------
     * BILLING ITEM
     * --------------------------------------------------------------------------
     */

    const [showBillItemModal, setShowBillItemModal] = useState(false);
    const [billingId, setBillingId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [monthInstallment, setMonthInstallment] = useState<number | null>(
        null,
    );
    const [startMonth, setStartMonth] = useState<number | null>(null);
    const [endMonth, setEndMonth] = useState<number | null>(null);

    const [isSubmittingBillItem, setIsSubmittingBillItem] = useState(false);

    const resetBillItemForm = () => {
        setBillingId(null);
        setQuantity(1);
        setMonthInstallment(null);
        setStartMonth(null);
        setEndMonth(null);
    };

    const handleBillItemModalChange = (open: boolean) => {
        setShowBillItemModal(open);

        if (!open) {
            resetBillItemForm();
        }
    };

    const handleAddBillItem = (event: React.FormEvent) => {
        event.preventDefault();

        if (!billingId) {
            toast.error('Select a billing item first.');
            return;
        }

        if (quantity < 1) {
            toast.error('Quantity must be at least 1.');
            return;
        }

        setIsSubmittingBillItem(true);

        router.post(
            '/billing/add-billing-item',
            {
                enrollment_id: enrollment.id,
                billing_id: billingId,
                quantity,
                month_installment: monthInstallment,
                start_month: startMonth,
                end_month: endMonth,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Billing item added!', {
                        description:
                            'The new billing item is now part of the student account.',
                    });

                    setShowBillItemModal(false);
                    resetBillItemForm();
                },
                onError: () => {
                    toast.error('Unable to add billing item', {
                        description:
                            'Please review the information and try again.',
                    });
                },
                onFinish: () => {
                    setIsSubmittingBillItem(false);
                },
            },
        );
    };

    /*
     * --------------------------------------------------------------------------
     * STUDENT SEARCH
     * --------------------------------------------------------------------------
     */

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] =
        useState<SameSchoolYearEnrollment | null>(null);

    const studentSuggestions = useMemo(
        () =>
            sameSchoolYearEnrollments.map(
                (item) =>
                    `${item.firstName} ${item.lastName}`,
            ),
        [sameSchoolYearEnrollments],
    );

    const handleStudentSelect = (value: string) => {
        setSearchQuery(value);

        const match = sameSchoolYearEnrollments.find(
            (item) =>
                `${item.firstName} ${item.lastName}`.toLowerCase() ===
                value.toLowerCase(),
        );

        if (!match) {
            setSelectedStudent(null);
            return;
        }

        setSelectedStudent(match);

        router.get(`/billing/students/${match.id}`, {}, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    /*
     * --------------------------------------------------------------------------
     * PAYMENT
     * --------------------------------------------------------------------------
     */

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [orNumber, setOrNumber] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [selectedPayments, setSelectedPayments] = useState<
        SelectedPayment[]
    >([]);

    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const totalPaymentAmount = useMemo(
        () =>
            selectedPayments.reduce((sum, payment) => {
                const amount = Number.parseFloat(payment.amount);

                return sum + (Number.isFinite(amount) ? amount : 0);
            }, 0),
        [selectedPayments],
    );

    const selectedPaymentCount = selectedPayments.length;

    const resetPaymentForm = () => {
        setOrNumber('');
        setPaymentDate('');
        setSelectedPayments([]);
    };

    const handlePaymentModalChange = (open: boolean) => {
        setShowPaymentModal(open);

        if (!open && !isSubmittingPayment) {
            resetPaymentForm();
        }
    };

    const addPaymentRow = () => {
        setSelectedPayments((previous) => [
            ...previous,
            {
                billing_id: null,
                amount: '',
                payment_method: 'cash',
                remarks: 'partial_payment',
            },
        ]);
    };

    const updatePaymentRow = (
        index: number,
        updates: Partial<SelectedPayment>,
    ) => {
        setSelectedPayments((previous) =>
            previous.map((payment, paymentIndex) =>
                paymentIndex === index
                    ? { ...payment, ...updates }
                    : payment,
            ),
        );
    };

    const removePaymentRow = (index: number) => {
        setSelectedPayments((previous) =>
            previous.filter((_, paymentIndex) => paymentIndex !== index),
        );
    };

    const handlePaymentSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!orNumber.trim()) {
            toast.error('OR number is required.');
            return;
        }

        if (!paymentDate) {
            toast.error('Payment date is required.');
            return;
        }

        if (selectedPayments.length === 0) {
            toast.error('Add at least one billing item.');
            return;
        }

        const hasInvalidPayment = selectedPayments.some(
            (payment) =>
                !payment.billing_id ||
                !payment.amount ||
                Number(payment.amount) <= 0,
        );

        if (hasInvalidPayment) {
            toast.error('Complete all payment details.', {
                description:
                    'Each payment needs a billing item and a valid amount.',
            });
            return;
        }

        setIsSubmittingPayment(true);

        router.post(
            '/billing/add-payment',
            {
                enrollment_id: enrollment.id,
                or_number: orNumber.trim(),
                payment_date: paymentDate,
                items: selectedPayments.filter(
                    (payment) => payment.billing_id !== null,
                ),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Payment recorded successfully!', {
                        description: `OR ${orNumber} has been recorded for ${formatCurrency(
                            totalPaymentAmount,
                        )}.`,
                    });

                    setShowPaymentModal(false);
                    resetPaymentForm();
                },
                onError: () => {
                    toast.error('Payment could not be recorded', {
                        description:
                            'Please review the payment details and try again.',
                    });
                },
                onFinish: () => {
                    setIsSubmittingPayment(false);
                },
            },
        );
    };

    /*
     * --------------------------------------------------------------------------
     * SUMMARY
     * --------------------------------------------------------------------------
     */

    const totalPayments = useMemo(
        () =>
            enrollment.payments.reduce(
                (sum, payment) => sum + Number(payment.amount || 0),
                0,
            ),
        [enrollment.payments],
    );

    const totalBillingItems = enrollment.billing_items.length;
    const totalDiscounts = enrollment.billing_discounts.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs(studentName)}>
            <Head title={`${studentName} · Billing`} />

            <Toaster
                richColors
                position="top-center"
                closeButton
            />

            <div className="bg-background">
                <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

                    {/* -----------------------------------------------------------------
                        STUDENT SWITCHER
                    ------------------------------------------------------------------ */}
                    <section className="mb-6">
                        <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Search className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Switch student
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Quickly open another student in{' '}
                                                {schoolYear}.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full lg:max-w-md">
                                        <SearchBarWithSuggestions
                                            suggestions={studentSuggestions}
                                            onSelect={handleStudentSelect}
                                            placeholder="Search student name..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* -----------------------------------------------------------------
                        HERO
                    ------------------------------------------------------------------ */}
                    <section className="relative mb-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-xl shadow-indigo-500/10 sm:p-7">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_35%)]" />
                        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="pointer-events-none absolute -right-20 top-8 h-52 w-52 rounded-full bg-fuchsia-300/20 blur-3xl" />

                        <div className="relative">
                            <div className="mb-5 flex flex-wrap items-center gap-2">
                                <Badge className="border-white/20 bg-white/10 text-white shadow-none backdrop-blur-sm hover:bg-white/15">
                                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
                                    Student Billing
                                </Badge>

                                <Badge className="border-white/20 bg-white/10 text-white shadow-none backdrop-blur-sm hover:bg-white/15">
                                    {schoolYear}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div className="min-w-0">
                                    <p className="mb-1 text-sm font-medium text-indigo-100">
                                        Billing profile
                                    </p>

                                    <h1 className="truncate text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                                        {studentName}
                                    </h1>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-indigo-100">
                                        {student.lrn && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <Receipt className="h-4 w-4" />
                                                LRN {student.lrn}
                                            </span>
                                        )}

                                        {yearLevel?.yearLevelName && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <WalletCards className="h-4 w-4" />
                                                {yearLevel.yearLevelName}
                                            </span>
                                        )}

                                        {classArm?.classArmName && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <NotebookPen className="h-4 w-4" />
                                                {classArm.classArmName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                                            Payments
                                        </p>

                                        <p className="mt-1 text-lg font-bold">
                                            {enrollment.payments.length}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                                            Billings
                                        </p>

                                        <p className="mt-1 text-lg font-bold">
                                            {totalBillingItems}
                                        </p>
                                    </div>

                                    <div className="col-span-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm sm:col-span-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                                            Collected
                                        </p>

                                        <p className="mt-1 text-lg font-bold">
                                            {formatCurrency(totalPayments)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Keep selectedStudent referenced so the state remains
                        available for future search UI enhancements. */}
                    {selectedStudent && searchQuery && null}

                    {/* -----------------------------------------------------------------
                        MAIN TABS
                    ------------------------------------------------------------------ */}
                    <Tabs
                        defaultValue="payment"
                        className="space-y-5"
                    >
                        <div className="sticky top-0 z-20 -mx-4 border-y border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                            <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-muted/70 p-1 sm:max-w-md">
                                <TabsTrigger
                                    value="payment"
                                    className="gap-2 rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                >
                                    <CircleDollarSign className="h-4 w-4" />
                                    Payments
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                                    >
                                        {enrollment.payments.length}
                                    </Badge>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="billing"
                                    className="gap-2 rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                >
                                    <Receipt className="h-4 w-4" />
                                    Billings
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                                    >
                                        {totalBillingItems}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* -----------------------------------------------------------------
                            BILLING TAB
                        ------------------------------------------------------------------ */}
                        <TabsContent
                            value="billing"
                            className="space-y-5 outline-none"
                        >
                            <Card className="overflow-hidden rounded-3xl border-border/70 shadow-sm">
                                <CardHeader className="">
                                    {/* Header content */}
                                    <div className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            {/* Title / Description */}
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                    <Receipt className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <CardTitle className="text-lg font-bold sm:text-xl">
                                                        Billing details
                                                    </CardTitle>

                                                    <CardDescription className="mt-1 max-w-2xl leading-relaxed">
                                                        Review billable items, applied discounts, payments, and
                                                        the installment plan.
                                                    </CardDescription>
                                                </div>
                                            </div>

                                            {/* Manage Action */}
                                            <div className="shrink-0 self-start sm:self-center">
                                                <Menubar className="h-10 border-border/70 bg-background shadow-sm">
                                                    <MenubarMenu>
                                                        <MenubarTrigger className="cursor-pointer gap-2 px-4 font-semibold">
                                                            <Settings2 className="h-4 w-4" />
                                                            <span>Manage</span>
                                                        </MenubarTrigger>

                                                        <MenubarContent align="end" className="w-56">
                                                            <MenubarItem
                                                                onClick={() => setShowBillItemModal(true)}
                                                            >
                                                                <FilePlus2 className="mr-2 h-4 w-4" />
                                                                <span>Add bill item</span>

                                                                <MenubarShortcut>
                                                                    +
                                                                </MenubarShortcut>
                                                            </MenubarItem>

                                                            <MenubarItem
                                                                onClick={() => setShowDiscountModal(true)}
                                                            >
                                                                <Percent className="mr-2 h-4 w-4" />
                                                                <span>Manage discounts</span>
                                                            </MenubarItem>

                                                            <MenubarItem asChild>
                                                                <a
                                                                    href={route(
                                                                        'billing.pdf',
                                                                        enrollment.id,
                                                                    )}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center"
                                                                >
                                                                    <Printer className="mr-2 h-4 w-4" />
                                                                    <span>Generate statement</span>
                                                                </a>
                                                            </MenubarItem>
                                                        </MenubarContent>
                                                    </MenubarMenu>
                                                </Menubar>
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            {/* Billing Items */}
                                            <div className="group rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.03]">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <Receipt className="h-4 w-4" />
                                                    </div>

                                                    <span className="text-xs font-medium">
                                                        Billing items
                                                    </span>
                                                </div>

                                                <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                                                    {totalBillingItems}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Items currently assigned
                                                </p>
                                            </div>

                                            {/* Discounts */}
                                            <div className="group rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.03]">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <Percent className="h-4 w-4" />
                                                    </div>

                                                    <span className="text-xs font-medium">
                                                        Active discounts
                                                    </span>
                                                </div>

                                                <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                                                    {totalDiscounts}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Discounts currently applied
                                                </p>
                                            </div>

                                            {/* Total Collected */}
                                            <div className="group rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/[0.07]">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <CircleDollarSign className="h-4 w-4" />
                                                    </div>

                                                    <span className="text-xs font-medium">
                                                        Total collected
                                                    </span>
                                                </div>

                                                <p className="mt-3 text-2xl font-bold tracking-tight text-primary">
                                                    {formatCurrency(totalPayments)}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Payments recorded for this student
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6">
                                    <BillingBreakdownTable
                                        billingItems={enrollment.billing_items}
                                        discounts={enrollment.billing_discounts}
                                        payments={enrollment.payments}
                                    />

                                    <InstallmentPlanTable
                                        enrollment={enrollment}
                                        months={months}
                                        title="Installment plan"
                                        description="Monitor monthly billing progress, discounts, and payments."
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* -----------------------------------------------------------------
                            PAYMENT TAB
                        ------------------------------------------------------------------ */}
                        <TabsContent
                            value="payment"
                            className="space-y-5 outline-none"
                        >
                            <Card className="overflow-hidden rounded-3xl border-border/70 shadow-sm">
                                <CardHeader className="">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                <CircleDollarSign className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <CardTitle className="text-lg sm:text-xl">
                                                    Payment records
                                                </CardTitle>

                                                <CardDescription className="mt-1 max-w-xl">
                                                    Track payment history and
                                                    transaction details for this
                                                    student.
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <CardAction>
                                            <Button
                                                onClick={() =>
                                                    setShowPaymentModal(true)
                                                }
                                                className="w-full rounded-xl font-semibold shadow-sm sm:w-auto"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add payment
                                            </Button>
                                        </CardAction>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6">
                                    {enrollment.payments.length > 0 ? (
                                        <PaymentTable
                                            payments={enrollment.payments}
                                            paymentMethodColors={
                                                paymentMethodColors
                                            }
                                        />
                                    ) : (
                                        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 text-center">
                                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                <WalletCards className="h-6 w-6" />
                                            </div>

                                            <h3 className="font-semibold text-foreground">
                                                No payments recorded yet
                                            </h3>

                                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                                Ready when you are. Record the
                                                student's first payment to start
                                                building their payment history.
                                            </p>

                                            <Button
                                                className="mt-5 rounded-xl"
                                                onClick={() =>
                                                    setShowPaymentModal(true)
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Record first payment
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* =========================================================================
                DISCOUNT MODAL
            ========================================================================= */}
            <Dialog
                open={showDiscountModal}
                onOpenChange={(open) => {
                    if (!isSubmittingDiscount) {
                        setShowDiscountModal(open);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
                    <DialogHeader>
                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Percent className="h-5 w-5" />
                        </div>

                        <DialogTitle>Manage discounts</DialogTitle>

                        <DialogDescription>
                            Choose the discounts currently applicable to{' '}
                            <span className="font-medium text-foreground">
                                {studentName}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleDiscountSubmit}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            {availableDiscounts.length > 0 ? (
                                availableDiscounts.map((discount) => {
                                    const isSelected =
                                        selectedDiscounts.includes(
                                            discount.id,
                                        );

                                    return (
                                        <Label
                                            key={discount.id}
                                            htmlFor={`discount-${discount.id}`}
                                            className={[
                                                'group flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all',
                                                'hover:border-primary/40 hover:bg-accent/50',
                                                isSelected
                                                    ? 'border-primary/50 bg-primary/5 shadow-sm'
                                                    : 'border-border bg-background',
                                            ].join(' ')}
                                        >
                                            <Checkbox
                                                id={`discount-${discount.id}`}
                                                checked={isSelected}
                                                onCheckedChange={() =>
                                                    handleCheckboxChange(
                                                        discount.id,
                                                    )
                                                }
                                                className="mt-0.5"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-foreground">
                                                            {
                                                                discount
                                                                    .category
                                                                    .name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                            {
                                                                discount.description
                                                            }
                                                        </p>
                                                    </div>

                                                    <Badge
                                                        variant="secondary"
                                                        className="shrink-0 font-mono"
                                                    >
                                                        -
                                                        {discount.value ===
                                                            'percentage'
                                                            ? ` ${discount.amount}%`
                                                            : ` ${formatCurrency(
                                                                discount.amount,
                                                            )}`}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Label>
                                    );
                                })
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                                    <Percent className="mx-auto h-7 w-7 text-muted-foreground" />

                                    <p className="mt-3 font-semibold text-foreground">
                                        No discounts available
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        There are currently no discount options
                                        configured for this student.
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmittingDiscount}
                                onClick={() =>
                                    setShowDiscountModal(false)
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={isSubmittingDiscount}
                            >
                                {isSubmittingDiscount ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving changes...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Save discounts
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* =========================================================================
                ADD BILLING ITEM MODAL
            ========================================================================= */}
            <Dialog
                open={showBillItemModal}
                onOpenChange={handleBillItemModalChange}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
                    <DialogHeader>
                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <FilePlus2 className="h-5 w-5" />
                        </div>

                        <DialogTitle>Add billing item</DialogTitle>

                        <DialogDescription>
                            Add a new charge or installment item to this
                            student's account.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleAddBillItem}
                        className="space-y-5"
                    >
                        <div className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-3">
                                <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Billing configuration
                                    </p>

                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Select the billing item and configure
                                        quantity or installment details if
                                        applicable.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="billing-item">
                                Billing item
                            </Label>

                            <Select
                                value={
                                    billingId !== null
                                        ? String(billingId)
                                        : ''
                                }
                                onValueChange={(value) =>
                                    setBillingId(Number(value))
                                }
                            >
                                <SelectTrigger
                                    id="billing-item"
                                    className="h-11 w-full rounded-xl"
                                >
                                    <SelectValue placeholder="Select a billing item" />
                                </SelectTrigger>

                                <SelectContent>
                                    {availableBillings.map((bill) => (
                                        <SelectItem
                                            key={bill.id}
                                            value={String(bill.id)}
                                        >
                                            <span className="font-medium">
                                                {bill.category?.name ??
                                                    bill.description}
                                            </span>
                                            <span className="ml-2 text-muted-foreground">
                                                {formatCurrency(bill.amount)}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quantity">
                                Quantity
                            </Label>

                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                step={1}
                                value={quantity}
                                onChange={(event) =>
                                    setQuantity(
                                        Math.max(
                                            1,
                                            Number(event.target.value) || 1,
                                        ),
                                    )
                                }
                                className="h-11 rounded-xl"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="month-installment">
                                Installment months{' '}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>

                            <Input
                                id="month-installment"
                                type="number"
                                min={1}
                                value={monthInstallment ?? ''}
                                onChange={(event) =>
                                    setMonthInstallment(
                                        event.target.value
                                            ? Number(event.target.value)
                                            : null,
                                    )
                                }
                                placeholder="e.g. 10"
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="start-month">
                                    Start month{' '}
                                    <span className="font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>

                                <Select
                                    value={
                                        startMonth
                                            ? String(startMonth)
                                            : ''
                                    }
                                    onValueChange={(value) =>
                                        setStartMonth(Number(value))
                                    }
                                >
                                    <SelectTrigger
                                        id="start-month"
                                        className="h-11 rounded-xl"
                                    >
                                        <SelectValue placeholder="Start month" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem
                                                key={month.value}
                                                value={String(month.value)}
                                            >
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="end-month">
                                    End month{' '}
                                    <span className="font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>

                                <Select
                                    value={
                                        endMonth
                                            ? String(endMonth)
                                            : ''
                                    }
                                    onValueChange={(value) =>
                                        setEndMonth(Number(value))
                                    }
                                >
                                    <SelectTrigger
                                        id="end-month"
                                        className="h-11 rounded-xl"
                                    >
                                        <SelectValue placeholder="End month" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem
                                                key={month.value}
                                                value={String(month.value)}
                                            >
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmittingBillItem}
                                onClick={() =>
                                    setShowBillItemModal(false)
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    isSubmittingBillItem ||
                                    !billingId
                                }
                            >
                                {isSubmittingBillItem ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding item...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add billing item
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* =========================================================================
                PAYMENT MODAL
            ========================================================================= */}
            <Dialog
                open={showPaymentModal}
                onOpenChange={handlePaymentModalChange}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-4xl">
                    <DialogHeader>
                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CircleDollarSign className="h-5 w-5" />
                        </div>

                        <DialogTitle className="text-xl">
                            Record payment
                        </DialogTitle>

                        <DialogDescription>
                            Create one OR and allocate its payment across one
                            or more billing items.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handlePaymentSubmit}
                        className="space-y-5"
                    >
                        {/* OR DETAILS */}
                        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="or-number">
                                    OR number
                                </Label>

                                <Input
                                    id="or-number"
                                    type="text"
                                    value={orNumber}
                                    onChange={(event) =>
                                        setOrNumber(event.target.value)
                                    }
                                    placeholder="Enter OR number"
                                    className="h-11 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment-date">
                                    Payment date
                                </Label>

                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        id="payment-date"
                                        type="date"
                                        value={paymentDate}
                                        onChange={(event) =>
                                            setPaymentDate(
                                                event.target.value,
                                            )
                                        }
                                        className="h-11 rounded-xl pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PAYMENT ITEMS */}
                        <div className="overflow-hidden rounded-2xl border border-border">
                            <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        Payment allocation
                                    </h3>

                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {selectedPaymentCount === 0
                                            ? 'Add billing items to this payment.'
                                            : `${selectedPaymentCount} item${selectedPaymentCount === 1
                                                ? ''
                                                : 's'
                                            } selected.`}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={addPaymentRow}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add bill item
                                </Button>
                            </div>

                            <div className="p-3 sm:p-4">
                                {selectedPayments.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Receipt className="h-5 w-5" />
                                        </div>

                                        <h3 className="mt-3 font-semibold text-foreground">
                                            Nothing selected yet
                                        </h3>

                                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                                            Choose a billing item and enter the
                                            amount you are collecting.
                                        </p>

                                        <Button
                                            type="button"
                                            className="mt-4 rounded-xl"
                                            onClick={addPaymentRow}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add first item
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedPayments.map(
                                            (payment, index) => (
                                                <div
                                                    key={index}
                                                    className="rounded-2xl border border-border bg-background p-4 shadow-sm transition-colors hover:border-primary/30"
                                                >
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                                                {index + 1}
                                                            </div>

                                                            <span className="text-sm font-semibold text-foreground">
                                                                Payment item
                                                            </span>
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() =>
                                                                removePaymentRow(
                                                                    index,
                                                                )
                                                            }
                                                            aria-label="Remove payment item"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                                        <div className="grid gap-2 xl:col-span-1">
                                                            <Label className="text-xs">
                                                                Billing item
                                                            </Label>

                                                            <Select
                                                                value={
                                                                    payment.billing_id !==
                                                                        null
                                                                        ? String(
                                                                            payment.billing_id,
                                                                        )
                                                                        : ''
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    updatePaymentRow(
                                                                        index,
                                                                        {
                                                                            billing_id:
                                                                                Number(
                                                                                    value,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="h-10 w-full rounded-xl">
                                                                    <SelectValue placeholder="Select item" />
                                                                </SelectTrigger>

                                                                <SelectContent>
                                                                    {enrollment.billing_items.map(
                                                                        (
                                                                            item,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    item.id
                                                                                }
                                                                                value={String(
                                                                                    item.id,
                                                                                )}
                                                                            >
                                                                                {item
                                                                                    .category
                                                                                    ?.name ??
                                                                                    item.description}
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label className="text-xs">
                                                                Amount
                                                            </Label>

                                                            <Input
                                                                type="number"
                                                                min="0.01"
                                                                step="0.01"
                                                                value={
                                                                    payment.amount
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updatePaymentRow(
                                                                        index,
                                                                        {
                                                                            amount:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="0.00"
                                                                className="h-10 rounded-xl"
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label className="text-xs">
                                                                Payment method
                                                            </Label>

                                                            <Select
                                                                value={
                                                                    payment.payment_method
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    updatePaymentRow(
                                                                        index,
                                                                        {
                                                                            payment_method:
                                                                                value,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="h-10 w-full rounded-xl">
                                                                    <SelectValue placeholder="Method" />
                                                                </SelectTrigger>

                                                                <SelectContent>
                                                                    <SelectItem value="cash">
                                                                        Cash
                                                                    </SelectItem>
                                                                    <SelectItem value="gcash">
                                                                        GCash
                                                                    </SelectItem>
                                                                    <SelectItem value="bank_transfer">
                                                                        Bank
                                                                        Transfer
                                                                    </SelectItem>
                                                                    <SelectItem value="check">
                                                                        Check
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label className="text-xs">
                                                                Remarks
                                                            </Label>

                                                            <Select
                                                                value={
                                                                    payment.remarks
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    updatePaymentRow(
                                                                        index,
                                                                        {
                                                                            remarks:
                                                                                value,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="h-10 w-full rounded-xl">
                                                                    <SelectValue placeholder="Remarks" />
                                                                </SelectTrigger>

                                                                <SelectContent>
                                                                    <SelectItem value="partial_payment">
                                                                        Partial
                                                                        Payment
                                                                    </SelectItem>

                                                                    <SelectItem value="down_payment">
                                                                        Down
                                                                        Payment
                                                                    </SelectItem>

                                                                    <SelectItem value="full_payment">
                                                                        Full
                                                                        Payment
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* PAYMENT TOTAL */}
                            <div className="border-t border-border bg-muted/30 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CircleDollarSign className="h-4 w-4 text-primary" />

                                        <span>
                                            {selectedPaymentCount}{' '}
                                            {selectedPaymentCount === 1
                                                ? 'item'
                                                : 'items'}{' '}
                                            in this OR
                                        </span>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Total amount
                                        </p>

                                        <p className="text-2xl font-extrabold tracking-tight text-primary">
                                            {formatCurrency(
                                                totalPaymentAmount,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONFIRMATION NOTE */}
                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Ready to record?
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    Verify the OR number, date, billing items,
                                    and amounts before submitting. The payment
                                    will be recorded under this student's
                                    account.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmittingPayment}
                                onClick={() =>
                                    setShowPaymentModal(false)
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    isSubmittingPayment ||
                                    selectedPayments.length === 0 ||
                                    selectedPayments.some(
                                        (payment) =>
                                            !payment.billing_id ||
                                            !payment.amount ||
                                            Number(payment.amount) <= 0,
                                    )
                                }
                                className="min-w-[150px] rounded-xl font-semibold"
                            >
                                {isSubmittingPayment ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Recording...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Record payment
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
