import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    CircleDollarSign,
    NotebookPen,
    Receipt,
    Sparkles,
    WalletCards,
} from 'lucide-react';

import { BillingBreakdownTable } from '@/pages/billing/student-details/billing-breakdown-table'; // adjust path
import { InstallmentPlanTable } from '@/pages/billing/student-details/installment-plan-table'; // adjust path
import { PaymentTableReadonly } from './payment-table-readonly'; // see below

// ---- Types (simplified / same as staff version) ----
interface Student {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    lrn?: string;
}

interface EnrollmentDetails {
    id: number;
    student: Student;
    class_arm: {
        classArmName: string;
        year_level: {
            yearLevelName: string;
            school_year: { name: string };
        };
    };
    billing_items: any[];
    billing_discounts: any[];
    payments: any[];
}

interface Props extends PageProps {
    enrollment: EnrollmentDetails;
}

const breadcrumbs = (studentName: string): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/parent/dashboard' },
    { title: studentName, href: '#' },
];

function toProperCase(name: string) {
    return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStudentName(student: Student) {
    return `${toProperCase(student.firstName)}${
        student.middleName ? ` ${student.middleName.charAt(0).toUpperCase()}.` : ''
    } ${toProperCase(student.lastName)}`;
}

function formatCurrency(value: number | string) {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
}

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

export default function ParentStudentBillingDetails({ enrollment }: Props) {
    const student = enrollment.student;
    const classArm = enrollment.class_arm;
    const yearLevel = classArm?.year_level;
    const studentName = getStudentName(student);
    const schoolYear = yearLevel?.school_year?.name ?? 'School Year';

    const totalPayments = enrollment.payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0,
    );
    const totalBillingItems = enrollment.billing_items.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs(studentName)}>
            <Head title={`${studentName} · Billing`} />

            <div className="bg-background">
                <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

                    {/* Hero – same visual style, no actions */}
                    <section className="relative mb-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-xl sm:p-7">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_35%)]" />
                        <div className="relative">
                            <div className="mb-5 flex flex-wrap items-center gap-2">
                                <Badge className="border-white/20 bg-white/10 text-white">
                                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
                                    Student Billing
                                </Badge>
                                <Badge className="border-white/20 bg-white/10 text-white">
                                    {schoolYear}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div>
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
                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                                            Payments
                                        </p>
                                        <p className="mt-1 text-lg font-bold">
                                            {enrollment.payments.length}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                                            Billings
                                        </p>
                                        <p className="mt-1 text-lg font-bold">
                                            {totalBillingItems}
                                        </p>
                                    </div>
                                    <div className="col-span-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 sm:col-span-1">
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

                    {/* Tabs – only display */}
                    <Tabs defaultValue="payment" className="space-y-5">
                        <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-muted/70 p-1 sm:max-w-md">
                            <TabsTrigger value="payment" className="gap-2 rounded-lg text-sm font-semibold">
                                <CircleDollarSign className="h-4 w-4" />
                                Payments
                                <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]">
                                    {enrollment.payments.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="billing" className="gap-2 rounded-lg text-sm font-semibold">
                                <Receipt className="h-4 w-4" />
                                Billings
                                <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]">
                                    {totalBillingItems}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* BILLING TAB */}
                        <TabsContent value="billing" className="space-y-5 outline-none">
                            <Card className="overflow-hidden rounded-3xl border-border/70 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Receipt className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold sm:text-xl">
                                                Billing details
                                            </CardTitle>
                                            <CardDescription className="mt-1 max-w-2xl">
                                                Billable items, applied discounts, and installment plan.
                                            </CardDescription>
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
                                        description="Monthly billing progress, discounts, and payments."
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* PAYMENT TAB */}
                        <TabsContent value="payment" className="space-y-5 outline-none">
                            <Card className="overflow-hidden rounded-3xl border-border/70 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                                            <CircleDollarSign className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg sm:text-xl">
                                                Payment records
                                            </CardTitle>
                                            <CardDescription className="mt-1 max-w-xl">
                                                Payment history and transaction details for this student.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6">
                                    <PaymentTableReadonly payments={enrollment.payments} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}