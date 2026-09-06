import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    FileCheck2,
    FileText,
    Filter,
    Loader2,
    Receipt,
    Search,
    UserRound,
    Wallet,
    X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/billing/dashboard",
    },
    {
        title: "Official Receipts",
        href: "/billing/official-receipts",
    },
];

interface Student {
    id: number;
    lrn: string | null;
    lastName: string;
    firstName: string;
    middleName: string | null;
    suffix: string | null;
    gender?: "male" | "female";
    birthDate?: string | null;
    profilePhoto?: string | null;
}

interface SchoolYear {
    id: number;
    name: string;
    is_active: boolean;
}

interface YearLevel {
    id: number;
    yearLevelName: string;
    school_year: SchoolYear;
}

interface ClassArm {
    id: number;
    classArmName: string;
    year_level: YearLevel;
}

interface Enrollment {
    id: number;
    type: "new" | "transferee" | "old/continuing";
    student: Student;
    class_arm: ClassArm;
}

interface BillingCat {
    id: number;
    name: string;
}

interface Billing {
    id: number;
    description: string | null;
    amount: string;
    billing_cat: BillingCat;
    year_level?: YearLevel;
}

interface BillingPayment {
    id: number;
    or_number: string;
    payment_date: string;
    payment_method: "cash" | "gcash" | "bank_transfer" | "check" | string;
    remarks:
        | "partial_payment"
        | "full_payment"
        | "down_payment"
        | ""
        | null;
    amount: string;
    enrollment: Enrollment;
    billing: Billing;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPayments {
    data: BillingPayment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface PageProps {
    payments: PaginatedPayments;
    filters: {
        search: string;
    };
}

function formatPaymentDate(value: string): string {
    if (!value) {
        return "—";
    }

    /*
     * Handles:
     * 2026-08-19
     * 2026-08-19T16:00:00.000000Z
     *
     * We intentionally take the calendar-date portion first
     * to avoid timezone-related date changes.
     */
    const datePart = value.substring(0, 10);

    const parts = datePart.split("-");

    if (parts.length !== 3) {
        return value;
    }

    const [year, month, day] = parts;

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}

function formatCurrency(value: string | number): string {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
        return "₱0.00";
    }

    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatPaymentMethod(value: string): string {
    const labels: Record<string, string> = {
        cash: "Cash",
        gcash: "GCash",
        bank_transfer: "Bank Transfer",
        check: "Check",
    };

    return labels[value] ?? value.replace(/_/g, " ");
}

function formatPaymentStatus(
    value: BillingPayment["remarks"],
): string {
    const labels: Record<string, string> = {
        partial_payment: "Partial Payment",
        full_payment: "Full Payment",
        down_payment: "Down Payment",
    };

    return value ? labels[value] ?? value.replace(/_/g, " ") : "Payment";
}

function getStudentName(student: Student): string {
    const middleName = student.middleName
        ? ` ${student.middleName}`
        : "";

    const suffix = student.suffix
        ? ` ${student.suffix}`
        : "";

    return `${student.firstName}${middleName}${suffix} ${student.lastName}`;
}

function getStudentInitials(student: Student): string {
    const first = student.firstName?.charAt(0) ?? "";
    const last = student.lastName?.charAt(0) ?? "";

    return `${first}${last}`.toUpperCase();
}

function getPaymentMethodClasses(method: string): string {
    switch (method) {
        case "gcash":
            return "bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20";

        case "bank_transfer":
            return "bg-violet-50 text-violet-700 ring-violet-600/10 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20";

        case "check":
            return "bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20";

        case "cash":
        default:
            return "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20";
    }
}

function getStatusClasses(
    status: BillingPayment["remarks"],
): string {
    switch (status) {
        case "full_payment":
            return "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20";

        case "partial_payment":
            return "bg-orange-50 text-orange-700 ring-orange-600/10 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20";

        case "down_payment":
            return "bg-sky-50 text-sky-700 ring-sky-600/10 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20";

        default:
            return "bg-slate-50 text-slate-600 ring-slate-500/10 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20";
    }
}

function getPaginationLabel(label: string): string {
    return label
        .replace("&laquo;", "Previous")
        .replace("&raquo;", "Next");
}

export default function BillingOfficialReceipts() {
    const { payments, filters } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search ?? "");
    const [selectedPayment, setSelectedPayment] =
        useState<BillingPayment | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const hasSearch = search.trim().length > 0;

    const totalAmount = useMemo(() => {
        return payments.data.reduce(
            (total, payment) => total + Number(payment.amount || 0),
            0,
        );
    }, [payments.data]);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsSearching(true);

        router.get(
            "/billing/official-receipts",
            {
                search: search.trim(),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const clearSearch = () => {
        setSearch("");
        setIsSearching(true);

        router.get(
            "/billing/official-receipts",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const handlePageChange = (url: string | null) => {
        if (!url) {
            return;
        }

        router.get(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Official Receipts" />

            <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950">
                <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
                    {/* Hero Header */}
                    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-xl shadow-indigo-500/10 sm:p-8">
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20 backdrop-blur-sm">
                                    <FileCheck2 className="h-3.5 w-3.5" />
                                    Billing & Payments
                                </div>

                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    Official Receipts
                                </h1>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                                    Keep track of every payment, receipt,
                                    student, and billing transaction in one
                                    organized place.
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                                    <Receipt className="h-6 w-6" />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-indigo-100">
                                        Total Records
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {payments.total.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Statistics */}
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Receipts
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                        {payments.total.toLocaleString()}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Total recorded payments
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-105 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    <Receipt className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Current Page
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                        {payments.data.length}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Receipts currently displayed
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105 dark:bg-emerald-500/10 dark:text-emerald-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Displayed Amount
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(totalAmount)}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Sum of current results
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-105 dark:bg-amber-500/10 dark:text-amber-400">
                                    <CircleDollarSign className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Page
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                        {payments.current_page}
                                        <span className="ml-1 text-base font-medium text-slate-400">
                                            / {payments.last_page}
                                        </span>
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Receipt pages
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform group-hover:scale-105 dark:bg-violet-500/10 dark:text-violet-400">
                                    <FileText className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Search */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                                    <Filter className="h-4 w-4 text-indigo-500" />
                                    Find a receipt
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Search using an OR number
                                </p>
                            </div>

                            {hasSearch && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 sm:self-auto dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Clear search
                                </button>
                            )}
                        </div>

                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search OR number or payment date..."
                                    aria-label="Search official receipts"
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-950"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSearching}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4" />
                                        Search
                                    </>
                                )}
                            </button>
                        </form>

                        {filters.search && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>Showing results for:</span>

                                <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                                    "{filters.search}"
                                </span>
                            </div>
                        )}
                    </section>

                    {/* Receipt List */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Payment Receipts
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Click any receipt to view complete details.
                                </p>
                            </div>

                            {payments.from !== null &&
                                payments.to !== null && (
                                    <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        Showing {payments.from}–{payments.to}{" "}
                                        of {payments.total}
                                    </div>
                                )}
                        </div>

                        {payments.data.length === 0 ? (
                            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    <Receipt className="h-8 w-8" />
                                </div>

                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    No receipts found
                                </h3>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    {hasSearch
                                        ? "We couldn't find a receipt matching your search. Try another OR number or payment date."
                                        : "There are no official receipts available yet."}
                                </p>

                                {hasSearch && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50">
                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    Receipt
                                                </th>

                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    Student
                                                </th>

                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    Academic
                                                </th>

                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    Billing
                                                </th>

                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    Payment
                                                </th>

                                                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    Amount
                                                </th>

                                                <th className="px-5 py-3.5 text-right">
                                                    <span className="sr-only">
                                                        View
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {payments.data.map(
                                                (payment) => {
                                                    const student =
                                                        payment.enrollment
                                                            .student;

                                                    const classArm =
                                                        payment.enrollment
                                                            .class_arm;

                                                    const yearLevel =
                                                        classArm.year_level;

                                                    return (
                                                        <tr
                                                            key={payment.id}
                                                            onClick={() =>
                                                                setSelectedPayment(
                                                                    payment,
                                                                )
                                                            }
                                                            className="group cursor-pointer transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5"
                                                        >
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">

                                                                    <div>
                                                                        <p className="font-bold text-slate-900 dark:text-white">
                                                                            {
                                                                                payment.or_number
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                                            {formatPaymentDate(
                                                                                payment.payment_date,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    

                                                                    <div className="min-w-0">
                                                                        <p className="truncate font-semibold text-slate-900 dark:text-white">
                                                                            {getStudentName(
                                                                                student,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                                                    {
                                                                        yearLevel.yearLevelName
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {
                                                                        classArm.classArmName
                                                                    }
                                                                </p>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                                    {
                                                                        payment
                                                                            .billing
                                                                            .billing_cat
                                                                            .name
                                                                    }
                                                                </p>

                                                                <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                                                                    {payment
                                                                        .billing
                                                                        .description ??
                                                                        "No description"}
                                                                </p>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <div className="flex flex-col items-start gap-2">
                                                                    <span
                                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${getPaymentMethodClasses(
                                                                            payment.payment_method,
                                                                        )}`}
                                                                    >
                                                                        {formatPaymentMethod(
                                                                            payment.payment_method,
                                                                        )}
                                                                    </span>

                                                                    <span
                                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                                                                            payment.remarks,
                                                                        )}`}
                                                                    >
                                                                        {formatPaymentStatus(
                                                                            payment.remarks,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-4 text-right">
                                                                <p className="font-bold text-slate-900 dark:text-white">
                                                                    {formatCurrency(
                                                                        payment.amount,
                                                                    )}
                                                                </p>
                                                            </td>

                                                            <td className="px-5 py-4 text-right">
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400">
                                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile / Tablet Cards */}
                                <div className="divide-y divide-slate-100 lg:hidden dark:divide-slate-800">
                                    {payments.data.map((payment) => {
                                        const student =
                                            payment.enrollment.student;

                                        const classArm =
                                            payment.enrollment.class_arm;

                                        const yearLevel =
                                            classArm.year_level;

                                        return (
                                            <button
                                                key={payment.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedPayment(
                                                        payment,
                                                    )
                                                }
                                                className="block w-full text-left transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5"
                                            >
                                                <div className="space-y-4 p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                                <Receipt className="h-5 w-5" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-bold text-slate-900 dark:text-white">
                                                                    {
                                                                        payment.or_number
                                                                    }
                                                                </p>

                                                                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                                    {formatPaymentDate(
                                                                        payment.payment_date,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-400" />
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                                                            {student.profilePhoto ? (
                                                                <img
                                                                    src={
                                                                        student.profilePhoto
                                                                    }
                                                                    alt={getStudentName(
                                                                        student,
                                                                    )}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                getStudentInitials(
                                                                    student,
                                                                )
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                                                                {getStudentName(
                                                                    student,
                                                                )}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {yearLevel.yearLevelName}{" "}
                                                                •{" "}
                                                                {
                                                                    classArm.classArmName
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                                Billing
                                                            </p>

                                                            <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                                {
                                                                    payment
                                                                        .billing
                                                                        .billing_cat
                                                                        .name
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                                Amount
                                                            </p>

                                                            <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                                {formatCurrency(
                                                                    payment.amount,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPaymentMethodClasses(
                                                                payment.payment_method,
                                                            )}`}
                                                        >
                                                            {formatPaymentMethod(
                                                                payment.payment_method,
                                                            )}
                                                        </span>

                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                                                                payment.remarks,
                                                            )}`}
                                                        >
                                                            {formatPaymentStatus(
                                                                payment.remarks,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </section>

                    {/* Pagination */}
                    {payments.last_page > 1 && (
                        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Page{" "}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {payments.current_page}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {payments.last_page}
                                </span>
                            </p>

                            <div className="flex items-center gap-1">
                                {payments.links.map((link, index) => {
                                    const label = getPaginationLabel(
                                        link.label,
                                    );

                                    const isPrevious =
                                        label.toLowerCase().includes("previous");

                                    const isNext =
                                        label.toLowerCase().includes("next");

                                    return (
                                        <button
                                            key={`${link.label}-${index}`}
                                            type="button"
                                            disabled={
                                                !link.url || link.active
                                            }
                                            onClick={() =>
                                                handlePageChange(link.url)
                                            }
                                            aria-label={label}
                                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors ${
                                                link.active
                                                    ? "bg-indigo-600 text-white shadow-sm"
                                                    : link.url
                                                      ? "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                                      : "cursor-not-allowed text-slate-300 dark:text-slate-700"
                                            }`}
                                        >
                                            {isPrevious ? (
                                                <ChevronLeft className="h-4 w-4" />
                                            ) : isNext ? (
                                                <ChevronRight className="h-4 w-4" />
                                            ) : (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: label,
                                                    }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Receipt Details Dialog */}
            {selectedPayment && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="receipt-dialog-title"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedPayment(null);
                        }
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
                        {/* Dialog Header */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-7 text-white sm:px-8">
                            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
                                        <FileCheck2 className="h-3.5 w-3.5" />
                                        Official Receipt
                                    </div>

                                    <h2
                                        id="receipt-dialog-title"
                                        className="text-2xl font-bold"
                                    >
                                        {selectedPayment.or_number}
                                    </h2>

                                    <p className="mt-1 text-sm text-indigo-100">
                                        {formatPaymentDate(
                                            selectedPayment.payment_date,
                                        )}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedPayment(null)
                                    }
                                    aria-label="Close receipt details"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 p-6 sm:p-8">
                            {/* Student */}
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <UserRound className="h-4 w-4 text-indigo-500" />

                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Student Information
                                    </h3>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                                            {selectedPayment.enrollment.student
                                                .profilePhoto ? (
                                                <img
                                                    src={
                                                        selectedPayment
                                                            .enrollment.student
                                                            .profilePhoto
                                                    }
                                                    alt={getStudentName(
                                                        selectedPayment
                                                            .enrollment.student,
                                                    )}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                getStudentInitials(
                                                    selectedPayment.enrollment
                                                        .student,
                                                )
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                {getStudentName(
                                                    selectedPayment.enrollment
                                                        .student,
                                                )}
                                            </p>

                                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                <span>
                                                    LRN:{" "}
                                                    {selectedPayment
                                                        .enrollment.student
                                                        .lrn ?? "Not available"}
                                                </span>

                                                <span>
                                                    Enrollment:{" "}
                                                    <span className="capitalize">
                                                        {selectedPayment.enrollment.type.replace(
                                                            "/",
                                                            " / ",
                                                        )}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-indigo-500" />

                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Academic Information
                                    </h3>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <p className="text-xs text-slate-500">
                                            Year Level
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                                            {
                                                selectedPayment.enrollment
                                                    .class_arm.year_level
                                                    .yearLevelName
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <p className="text-xs text-slate-500">
                                            Class / Section
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                                            {
                                                selectedPayment.enrollment
                                                    .class_arm.classArmName
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <p className="text-xs text-slate-500">
                                            School Year
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                                            {
                                                selectedPayment.enrollment
                                                    .class_arm.year_level
                                                    .school_year.name
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Billing */}
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-indigo-500" />

                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Billing Information
                                    </h3>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between gap-4 bg-slate-50 px-4 py-3 dark:bg-slate-950/50">
                                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Category
                                        </span>

                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {
                                                selectedPayment.billing
                                                    .billing_cat.name
                                            }
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between gap-4 border-t border-slate-200 px-4 py-4 dark:border-slate-800">
                                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Description
                                        </span>

                                        <span className="max-w-sm text-right text-sm text-slate-700 dark:text-slate-300">
                                            {selectedPayment.billing
                                                .description ??
                                                "No description provided"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-4 dark:border-slate-800">
                                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Billing Amount
                                        </span>

                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {formatCurrency(
                                                selectedPayment.billing.amount,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment */}
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <CircleDollarSign className="h-4 w-4 text-indigo-500" />

                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Payment Information
                                    </h3>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <p className="text-xs text-slate-500">
                                            Payment Method
                                        </p>

                                        <span
                                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPaymentMethodClasses(
                                                selectedPayment.payment_method,
                                            )}`}
                                        >
                                            {formatPaymentMethod(
                                                selectedPayment.payment_method,
                                            )}
                                        </span>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <p className="text-xs text-slate-500">
                                            Payment Status
                                        </p>

                                        <span
                                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                                                selectedPayment.remarks,
                                            )}`}
                                        >
                                            {formatPaymentStatus(
                                                selectedPayment.remarks,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-600/20">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-indigo-100">
                                            Total Amount Paid
                                        </p>

                                        <p className="mt-1 text-xs text-indigo-200">
                                            Official receipt amount
                                        </p>
                                    </div>

                                    <p className="text-2xl font-bold sm:text-3xl">
                                        {formatCurrency(
                                            selectedPayment.amount,
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Close */}
                            <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedPayment(null)
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
