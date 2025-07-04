import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, ChevronRight, Coins, CreditCard, FileText, GraduationCap, HandCoins, HardDriveDownload, Layers3, Loader2, Receipt, Users2, Wallet } from 'lucide-react';
import CountUp from 'react-countup';
import { CollapsibleComboboxWithSearch } from '@/components/ui/combobox-with-search';
import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ClassArm {
    id: number;
    classArmName: string;
}

interface Billing {
    id: number;
    billing_cat_id: number;
    description: string;
    amount: number;
    category: {
        id: number;
        name: string;
    };
}

interface BillingCategory {
    id: number;
    name: string;
}

interface BillingDiscount {
    id: number;
    billing_cat_id: number;
    category: BillingCategory;
    description?: string;
    value: 'fixed' | 'percentage';
    amount: number;
}

interface YearLevel {
    id: number;
    yearLevelName: string;
    class_arms: ClassArm[];
    billings: Billing[];
    student_count: number;
}

interface SchoolYear {
    id: number;
    name: string;
    year_levels: YearLevel[];
    billing_discounts: BillingDiscount[];
}

interface StudentOption {
    id: number;
    label: string;
    value: string;
    route: string;
    avatar: string;
    badge: string;
}

interface OverviewSummary {
    or_issued: number;
    total: number;
    cash: number;
    gcash: number;
    bank_transfer: number;
    check: number;
}

interface SyManagePageProps {
    schoolYear: SchoolYear;
    billingCategories: BillingCategory[];
    students: StudentOption[];
    overview: OverviewSummary;
    overall: OverviewSummary;
}

type SoaProgressEntry = {
    student: string;
    status: 'success' | 'error';
    message?: string;
};

export default function BillingYearLevelList({ schoolYear, students, overview, overall }: SyManagePageProps) {

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })



    const [openModal, setOpenModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<SoaProgressEntry[]>([]);
    const [finished, setFinished] = useState(false);

    const handleGenerate = async () => {
        setOpenModal(true);
        setLoading(true);
        setFinished(false);
        setProgress([]);

        try {
            const res = await axios.get(`/billing/generate-soa/all-student/${schoolYear.id}`);
            setProgress(res.data.results);
            setFinished(true);
        } catch (err) {
            setProgress([{ student: 'Error', status: 'error', message: 'Something went wrong.' }]);
            setFinished(true);
        } finally {
            setLoading(false);
        }
    };



    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Billing', href: '/billing/' },
                { title: `${schoolYear.name}`, href: '#' }
            ]}
        >
            <Head title={`${schoolYear.name}`} />

            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="max-w-md sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Generating SOAs</DialogTitle>
                    </DialogHeader>

                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Loader2 className="animate-spin w-4 h-4" />
                            Please wait while SOAs are being generated...
                        </div>
                    )}

                    <div className="bg-muted p-3 rounded-md max-h-72 overflow-y-auto space-y-1 text-sm">
                        {progress.map((entry, idx) => (
                            <div key={idx}>
                                {entry.status === 'success' ? (
                                    <span className="text-green-600">✅ {entry.student}</span>
                                ) : (
                                    <span className="text-red-600">❌ {entry.student} - {entry.message}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {finished && (
                        <div className="text-right mt-4">
                            <Button onClick={() => setOpenModal(false)}>Close</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="p-4 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold">{schoolYear.name}</h1>
                    <Button
                        variant="btapinky"
                        size="lg"
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full sm:w-auto flex items-center gap-2"
                    >
                        <HardDriveDownload className="w-4 h-4" />
                        {loading ? "Generating..." : "Generate SOA"}
                    </Button>
                </div>

                {/* Highlight Card for Today’s Transaction */}
                <Card className="w-full mb-6 bg-primary text-white shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <CalendarDays className="w-5 h-5" />
                                Today's transaction <span className="font-normal">({formattedDate})</span>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                        {/* OR Issued */}
                        <div className="flex justify-between items-center text-sm sm:flex-col sm:items-start sm:gap-1">
                            <span className="opacity-80">OR Issued</span>
                            <span className="text-2xl font-bold sm:mt-1">
                                {overview.or_issued === 0 ? "-" : (
                                    <CountUp end={overview.or_issued} duration={1.5} separator="," />
                                )}
                            </span>
                        </div>

                        {/* Total Collection */}
                        <div className="flex justify-between items-center text-sm sm:flex-col sm:items-start sm:gap-1">
                            <span className="opacity-80">Total collection</span>
                            <span className="text-2xl font-bold sm:mt-1">
                                {overview.total === 0 ? "-" : (
                                    <>₱<CountUp end={overview.total} duration={1.5} separator="," decimals={2} /></>
                                )}
                            </span>
                        </div>

                        {/* Cash */}
                        <div className="flex justify-between items-center text-sm sm:flex-col sm:items-start sm:gap-1">
                            <span className="opacity-80">Cash</span>
                            <span className="text-2xl font-bold sm:mt-1">
                                {overview.cash === 0 ? "-" : (
                                    <>₱<CountUp end={overview.cash} duration={1.5} separator="," decimals={2} /></>
                                )}
                            </span>
                        </div>

                        {/* GCash */}
                        <div className="flex justify-between items-center text-sm sm:flex-col sm:items-start sm:gap-1">
                            <span className="opacity-80">GCash</span>
                            <span className="text-2xl font-bold sm:mt-1">
                                {overview.gcash === 0 ? "-" : (
                                    <>₱<CountUp end={overview.gcash} duration={1.5} separator="," decimals={2} /></>
                                )}
                            </span>
                        </div>

                        {/* Bank */}
                        <div className="flex justify-between items-center text-sm sm:flex-col sm:items-start sm:gap-1">
                            <span className="opacity-80">Bank transfer</span>
                            <span className="text-2xl font-bold sm:mt-1">
                                {overview.bank_transfer === 0 ? "-" : (
                                    <>₱<CountUp end={overview.bank_transfer} duration={1.5} separator="," decimals={2} /></>
                                )}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Existing Overview Section */}
                <Card className="w-full mt-6">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                            {/* OR Issued */}
                            <div className="relative group bg-green-100 text-green-900 rounded-xl p-6 overflow-hidden flex flex-col justify-between min-h-[140px]">
                                {/* Background Icon */}
                                <div className="absolute right-2 bottom-2 transform scale-[2.5] rotate-12 opacity-10 pointer-events-none">
                                    <FileText className="w-12 h-12 text-green-800" />
                                </div>

                                {/* Content */}
                                <div className="z-10 relative">
                                    <p className="text-sm font-medium">OR Issued</p>
                                    <p className="text-2xl font-bold">
                                        <CountUp end={overall.or_issued} duration={1.5} separator="," />
                                    </p>
                                </div>

                                {/* Hover Footer Button */}
                                <div className="relative z-10 mt-4">
                                    <button
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-green-800 hover:underline flex items-center gap-1"
                                        onClick={() => console.log("View more ORs clicked")}
                                    >
                                        View more <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative group bg-blue-100 text-blue-900 rounded-xl p-6 overflow-hidden flex flex-col justify-between min-h-[140px]">
                                {/* Background Icon */}
                                <div className="absolute right-2 bottom-2 transform scale-[2.5] rotate-12 opacity-10 pointer-events-none">
                                    <Receipt className="w-12 h-12 text-blue-800" />
                                </div>

                                {/* Content */}
                                <div className="z-10 relative">
                                    <p className="text-sm font-medium">Total Transactions</p>
                                    <p className="text-2xl font-bold">
                                        ₱<CountUp end={overall.total} duration={1.5} separator="," decimals={2} />
                                    </p>
                                </div>

                                {/* Hover Footer Button */}
                                <div className="relative z-10 mt-4">
                                    <button
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-blue-800 hover:underline flex items-center gap-1"
                                        onClick={() => console.log("View more ORs clicked")}
                                    >
                                        View more <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Cash on Hand */}
                            <div className="relative group bg-yellow-100 text-yellow-900 rounded-xl p-6 overflow-hidden flex flex-col justify-between min-h-[140px]">
                                {/* Background Icon */}
                                <div className="absolute right-2 bottom-2 transform scale-[2.5] rotate-12 opacity-10 pointer-events-none">
                                    <HandCoins className="w-12 h-12 text-yellow-700" />
                                </div>

                                {/* Content */}
                                <div className="z-10 relative">
                                    <p className="text-sm font-medium">Cash</p>
                                    <p className="text-2xl font-bold">
                                        ₱<CountUp end={overall.cash} duration={1.5} separator="," decimals={2} />
                                    </p>
                                </div>

                                {/* Hover Footer Button */}
                                <div className="relative z-10 mt-4">
                                    <button
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-yellow-800 hover:underline flex items-center gap-1"
                                        onClick={() => console.log("View more cash transactions")}
                                    >
                                        View more <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Digital Payments */}
                            <div className="relative group bg-purple-100 text-purple-900 rounded-xl p-6 overflow-hidden flex flex-col justify-between min-h-[140px]">
                                {/* Background Icon */}
                                <div className="absolute right-2 bottom-2 transform scale-[2.5] rotate-12 opacity-10 pointer-events-none">
                                    <CreditCard className="w-13 h-13 text-purple-700" />
                                </div>

                                {/* Content */}
                                <div className="z-10 relative">
                                    <p className="text-sm font-medium">Digital Payments</p>
                                    <p className="text-2xl font-bold">
                                        ₱<CountUp end={overall.gcash + overall.bank_transfer} duration={1.5} separator="," decimals={2} />
                                    </p>
                                </div>

                                {/* Hover Footer Button */}
                                <div className="relative z-10 mt-4">
                                    <button
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-purple-800 hover:underline flex items-center gap-1"
                                        onClick={() => console.log("View more digital payments")}
                                    >
                                        View more <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <CollapsibleComboboxWithSearch
                            placeholder="Search student"
                            options={students.map((student) => ({
                                label: `${student.label}`,
                                value: student.id.toString(),
                                route: student.route,
                                avatar: student.avatar
                                    ? `/storage/${student.avatar}`
                                    : "/images/avatar-place-holder.png",
                                badge: student.badge
                            }))}
                        />
                    </div>

                    {/* Right Side: Year Level Cards - takes 3 columns on lg */}
                    <div className="lg:col-span-2">
                        <span className="text-lg font-semibold">Year levels</span>

                        {schoolYear.year_levels.length === 0 ? (
                            <p className="text-muted-foreground mt-3">
                                No year levels found for this school year.
                            </p>
                        ) : (
                            <div className="grid mt-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {schoolYear.year_levels.map((level) => (
                                    <Card
                                        key={level.id}
                                        className="hover:shadow transition-shadow h-full flex flex-col justify-between"
                                    >
                                        <CardHeader className="flex flex-row items-center gap-3">
                                            <GraduationCap className="text-muted-foreground w-6 h-6" />
                                            <CardTitle className="text-lg font-semibold">
                                                {level.yearLevelName}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-3 mt-auto">
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Users2 className="w-4 h-4" />
                                                {level.student_count} student
                                                {level.student_count !== 1 ? "s" : ""}
                                            </div>

                                            <Button
                                                variant="btapink"
                                                onClick={() => router.get(`/billing/year-level/${level.id}`)}
                                                className="mt-2"
                                                disabled={level.student_count === 0}
                                            >
                                                View <ChevronRight />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
