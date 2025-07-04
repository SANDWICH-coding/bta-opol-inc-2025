import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface SchoolYear {
    id: number;
    name: string;
    yearLevels_count: number;
}

interface RecentPayment {
    orNumber: string;
    amount: number;
    paymentDate: string;
    createdAt: string;
    student: {
        firstName: string;
        lastName: string;
        profilePhoto: string | null;
    };
}

interface SchoolYearPageProps {
    schoolYears: SchoolYear[];
    recentPayments: RecentPayment[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing',
        href: '#',
    },
];

export default function EnrollmentSYPage({ schoolYears, recentPayments }: SchoolYearPageProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Management" />
            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>School Years</CardTitle>
                        <CardDescription>
                            Manage billing, payments, and configurations for each school year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {schoolYears.map((sy) => (
                                <Card
                                    key={sy.id}
                                    className="relative group overflow-hidden rounded-xl bg-pink-100 text-pink-900 flex flex-col justify-between min-h-[140px] transition-shadow hover:shadow-md"
                                >
                                    {/* Background Icon */}
                                    <div className="absolute right-2 bottom-2 transform scale-[2.5] rotate-12 opacity-10 pointer-events-none">
                                        <CalendarIcon className="w-12 h-12 text-pink-700" />
                                    </div>

                                    {/* Content */}
                                    <CardHeader className="z-10 relative">
                                        <CardTitle className="text-lg font-semibold">{sy.name}</CardTitle>
                                    </CardHeader>

                                    {/* Button (visible on mobile, fades in on hover for sm+) */}
                                    <CardContent className="relative z-10 mt-auto">
                                        <button
                                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-sm text-pink-800 hover:underline flex items-center gap-1"
                                            onClick={() => router.get(`/billing/school-year/${sy.id}`)}
                                        >
                                            Manage <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            List of recently recorded payments with official receipts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentPayments.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                No records found.
                            </div>
                        ) : (
                            recentPayments.map((payment, idx) => (
                                <div
                                    key={idx}
                                    className="border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    {/* Avatar + Name + OR */}
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={
                                                    payment.student.profilePhoto
                                                        ? `/storage/${payment.student.profilePhoto}`
                                                        : "/images/avatar-place-holder.png"
                                                }
                                                alt={`${payment.student.firstName} ${payment.student.lastName}`}
                                            />
                                            <AvatarFallback>
                                                {(payment.student.firstName?.[0] ?? "") +
                                                    (payment.student.lastName?.[0] ?? "")}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="space-y-1">
                                            <div className="text-sm font-medium leading-tight">
                                                {payment.student.lastName}, {payment.student.firstName}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                OR #: {payment.orNumber}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount & Dates */}
                                    <div className="grid text-sm text-right sm:text-right sm:flex sm:flex-col sm:items-end gap-0.5">
                                        <div className="font-semibold text-green-700">
                                            ₱
                                            {payment.amount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Paid: {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Recorded: {format(new Date(payment.createdAt), "PPpp")}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>

                </Card>
            </div>
        </AppLayout>
    );
}
