import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-dropdown-menu';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    Plus,
    GraduationCap,
    Users,
    CreditCard,
    Tag,
    Sparkles,
    BookOpen,
    Layers,
} from 'lucide-react';

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
}

interface SchoolYear {
    id: number;
    name: string;
    year_levels: YearLevel[];
    billing_discounts: BillingDiscount[];
}

interface SyManagePageProps {
    schoolYear: SchoolYear;
    billingCategories: BillingCategory[];
}

export default function SyManagePage({ schoolYear, billingCategories }: SyManagePageProps) {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Year Level
    const [showModal, setShowModal] = useState(false);
    const [isSubmittingYearLevel, setIsSubmittingYearLevel] = useState(false);

    const [openYearLevelId, setOpenYearLevelId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        school_year_id: schoolYear.id,
        yearLevelName: '',
    });

    const handleAddYearLevel = () => {
        setFormData({ school_year_id: schoolYear.id, yearLevelName: '' });
        setShowModal(true);
    };

    const handleSubmitYearLevel = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingYearLevel(true);

        router.post('/admin/year-level', formData, {
            onSuccess: () => {
                setIsSubmittingYearLevel(false);
                setShowModal(false);
                toast.success('Year level created successfully');
                router.reload();
            },
            onError: (errors) => {
                setIsSubmittingYearLevel(false);
                toast.error(errors.yearLevelName || 'Failed to create year level');
            },
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Class Arm
    const [showModalClassArm, setShowModalClassArm] = useState(false);
    const [isSubmittingClassArm, setIsSubmittingClassArm] = useState(false);

    const [formDataClassArm, setFormDataClassArm] = useState({
        year_level_id: 0,
        classArmName: '',
    });

    const handleAddClass = (yearLevelId: number) => {
        setFormDataClassArm({ year_level_id: yearLevelId, classArmName: '' });
        setShowModalClassArm(true);
    };

    const handleSubmitClassArm = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingClassArm(true);

        router.post('/admin/class-arm', formDataClassArm, {
            onSuccess: () => {
                setIsSubmittingClassArm(false);
                setShowModalClassArm(false);
                setErrors({});
                toast.success('Class arm created successfully');
                router.reload();
            },
            onError: (err) => {
                setIsSubmittingClassArm(false);
                if (err && typeof err === 'object') {
                    setErrors(err);
                } else {
                    toast.error('Failed to create class arm');
                }
            },
        });
    };

    const handleInputChangeClassArm = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormDataClassArm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Billing
    const [showModalBilling, setShowModalBilling] = useState(false);

    const [formDataBilling, setFormDataBilling] = useState({
        year_level_id: 0,
        category: '',
        description: '',
        amount: 0,
    });

    const handleAddBilling = (yearLevelId: number) => {
        setFormDataBilling({
            year_level_id: yearLevelId,
            category: '',
            description: '',
            amount: 0,
        });
        setShowModalBilling(true);
    };

    const handleSubmitBilling = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/admin/billing', formDataBilling, {
            preserveScroll: true,
            onSuccess: () => {
                setShowModalBilling(false);
                toast.success('Billing created successfully');
            },
            onError: (errors) => {
                toast.error(errors.category || 'Failed to create billing');
            },
        });
    };

    const handleInputChangeBilling = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormDataBilling((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Discount
    const [showModalDiscount, setShowModalDiscount] = useState(false);

    const [formDataDiscount, setFormDataDiscount] = useState({
        school_year_id: schoolYear.id,
        billing_cat_id: 0,
        description: '',
        value: '',
        amount: 0,
    });

    const handleAddDiscount = () => {
        setFormDataDiscount({
            school_year_id: schoolYear.id,
            billing_cat_id: 0,
            description: '',
            value: '',
            amount: 0,
        });
        setShowModalDiscount(true);
    };

    const handleSubmitDiscount = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/admin/billing-discount', formDataDiscount, {
            preserveScroll: true,
            onSuccess: () => {
                setShowModalDiscount(false);
                toast.success('Discount created successfully');
            },
            onError: (errors) => {
                toast.error(errors.description || 'Failed to create discount');
            },
        });
    };

    const handleInputChangeDiscount = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormDataDiscount((prev) => ({
            ...prev,
            [name]: name === 'billing_cat_id' ? parseInt(value) : value,
        }));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'School Year', href: '/admin/school-year' },
                { title: 'Manage School Year', href: '#' },
            ]}
        >
            <Head title={`${schoolYear.name}`} />
            <Toaster richColors position="top-center" />

            <div className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-700 p-8 sm:p-10 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-400/30 blur-3xl" />

                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm border border-white/20">
                                <Sparkles className="h-4 w-4 text-amber-300" />
                                Academic Setup
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                {schoolYear.name}
                            </h1>
                            <p className="text-sky-100 text-base sm:text-lg max-w-xl leading-relaxed">
                                Build the foundation of this school year — add grade levels, class
                                sections, billing items, and discounts with ease.
                            </p>
                        </div>

                        <Button
                            onClick={handleAddYearLevel}
                            size="lg"
                            className="shrink-0 rounded-full bg-white text-indigo-700 hover:bg-sky-50 hover:scale-[1.03] shadow-lg font-semibold px-6 h-12 transition-all"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Add Year Level
                        </Button>
                    </div>
                </div>

                {/* Year Levels Section */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/40">
                            <GraduationCap className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Year Levels
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {schoolYear.year_levels.length} level
                                {schoolYear.year_levels.length !== 1 ? 's' : ''} configured
                            </p>
                        </div>
                    </div>

                    {schoolYear.year_levels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 py-16 px-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/50 dark:to-indigo-900/50 mb-5">
                                <BookOpen className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                No year levels yet
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                                Start by creating your first year level (e.g. Grade 1, Grade 7) and
                                then add class sections and billing.
                            </p>
                            <Button
                                onClick={handleAddYearLevel}
                                className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/25 px-6"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create First Year Level
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {schoolYear.year_levels.map((level) => (
                                <Card
                                    key={level.id}
                                    className="overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
                                >
                                    <CardHeader
                                        className="cursor-pointer bg-gradient-to-r from-slate-50 to-sky-50/50 dark:from-slate-900 dark:to-sky-950/30 border-b border-slate-100 dark:border-slate-800 py-4 px-6"
                                        onClick={() =>
                                            setOpenYearLevelId((current) =>
                                                current === level.id ? null : level.id
                                            )
                                        }
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                                                    <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>

                                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {level.yearLevelName}
                                                </CardTitle>
                                            </div>

                                            {/* Chevron */}
                                            <svg
                                                className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${openYearLevelId === level.id ? 'rotate-180' : ''
                                                    }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </CardHeader>

                                    {openYearLevelId === level.id && (
                                        <CardContent className="p-6 space-y-8">

                                            {/* Class Arms */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-sky-600" />
                                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                                            Class Arms
                                                        </h3>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {level.class_arms.length} section
                                                        {level.class_arms.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>

                                                {level.class_arms.length === 0 ? (
                                                    <p className="text-sm text-slate-400 italic py-2">
                                                        No class arms added yet. Add one to get started!
                                                    </p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {level.class_arms.map((arm) => (
                                                            <span
                                                                key={arm.id}
                                                                className="inline-flex items-center rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 px-3.5 py-1.5 text-sm font-medium text-sky-700 dark:text-sky-300"
                                                            >
                                                                {arm.classArmName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-4 rounded-full border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/40"
                                                    onClick={() => handleAddClass(level.id)}
                                                >
                                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                    Add Class
                                                </Button>
                                            </div>

                                            {/* Billing Items */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4 text-indigo-600" />
                                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                                            Billing Items
                                                        </h3>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {level.billings.length} item
                                                        {level.billings.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>

                                                {level.billings.length === 0 ? (
                                                    <p className="text-sm text-slate-400 italic py-2">
                                                        No billing items yet. Add tuition, fees, and more.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {level.billings.map((billing) => (
                                                            <div
                                                                key={billing.id}
                                                                className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 px-4 py-3"
                                                            >
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                                        {billing.category?.name}
                                                                    </p>
                                                                    {billing.description && (
                                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                                            {billing.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                                                                    ₱
                                                                    {Number(
                                                                        billing.amount
                                                                    ).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-4 rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
                                                    onClick={() => handleAddBilling(level.id)}
                                                >
                                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                    Add Billing
                                                </Button>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Billing Discounts Section */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                                <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Billing Discounts
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {schoolYear.billing_discounts.length} discount
                                    {schoolYear.billing_discounts.length !== 1 ? 's' : ''} available
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => handleAddDiscount()}
                            className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Discount
                        </Button>
                    </div>

                    {schoolYear.billing_discounts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 py-10 px-6 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                No discounts configured yet. Add scholarships, early-bird, or sibling
                                discounts to support families.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {schoolYear.billing_discounts.map((disc) => (
                                <div
                                    key={disc.id}
                                    className="flex items-center justify-between rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 px-5 py-4 shadow-sm"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            {disc.category?.name}
                                        </p>
                                        {disc.description && (
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {disc.description}
                                            </p>
                                        )}
                                        <span className="inline-flex mt-1.5 items-center rounded-full bg-white/80 dark:bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                                            {disc.value === 'percentage'
                                                ? 'Percentage'
                                                : 'Fixed amount'}
                                        </span>
                                    </div>
                                    <span className="text-base font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                                        {disc.value === 'percentage'
                                            ? `${disc.amount}%`
                                            : `₱${Number(disc.amount).toLocaleString()}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ==================== MODALS ==================== */}

                {/* Year Level Modal */}
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-5 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-amber-300" />
                                    New Year Level
                                </DialogTitle>
                                <DialogDescription className="text-sky-100 mt-1">
                                    Create a grade or year level for {schoolYear.name}. Example:
                                    Grade 1, Grade 7, Senior High.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <form onSubmit={handleSubmitYearLevel} className="px-6 py-5 space-y-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor="yearLevelName"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Year Level Name
                                </label>
                                <Input
                                    id="yearLevelName"
                                    name="yearLevelName"
                                    value={formData.yearLevelName}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Grade 1"
                                    required
                                    autoFocus
                                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-sky-500"
                                />
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmittingYearLevel}
                                    className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md min-w-[120px]"
                                >
                                    {isSubmittingYearLevel ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Class Arm Modal */}
                <Dialog open={showModalClassArm} onOpenChange={setShowModalClassArm}>
                    <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-5 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users className="h-5 w-5 text-amber-300" />
                                    New Class Arm
                                </DialogTitle>
                                <DialogDescription className="text-sky-100 mt-1">
                                    Add a section or class arm (e.g. Section A, Section B, Ruby,
                                    Emerald).
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <form onSubmit={handleSubmitClassArm} className="px-6 py-5 space-y-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor="classArmName"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Class Arm Name
                                </label>
                                <Input
                                    id="classArmName"
                                    name="classArmName"
                                    value={formDataClassArm.classArmName}
                                    onChange={handleInputChangeClassArm}
                                    placeholder="e.g. Section A"
                                    className={`h-11 rounded-xl border-slate-200 focus-visible:ring-sky-500 ${errors.classArmName ? 'border-red-500' : ''
                                        }`}
                                    autoFocus
                                />
                                {errors.classArmName && (
                                    <p className="text-sm text-red-500">{errors.classArmName}</p>
                                )}
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModalClassArm(false)}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmittingClassArm}
                                    className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md min-w-[120px]"
                                >
                                    {isSubmittingClassArm ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Class
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Billing Modal */}
                <Dialog open={showModalBilling} onOpenChange={setShowModalBilling}>
                    <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-5 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-amber-300" />
                                    New Billing Item
                                </DialogTitle>
                                <DialogDescription className="text-indigo-100 mt-1">
                                    Add a fee or charge for this year level (tuition, books,
                                    miscellaneous, etc.).
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <form onSubmit={handleSubmitBilling} className="px-6 py-5 space-y-5">
                            <div className="space-y-2">
                                <Label
                                    id="billingCategory"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Category
                                </Label>
                                <Input
                                    id="billingCategory"
                                    name="category"
                                    value={formDataBilling.category}
                                    onChange={handleInputChangeBilling}
                                    placeholder="e.g. Tuition Fee"
                                    required
                                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    id="billingDescription"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Description
                                </Label>
                                <Input
                                    id="billingDescription"
                                    name="description"
                                    value={formDataBilling.description}
                                    onChange={handleInputChangeBilling}
                                    placeholder="e.g. Monthly Fee"
                                    required
                                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    id="billingAmount"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Amount (₱)
                                </Label>
                                <Input
                                    id="billingAmount"
                                    name="amount"
                                    type="number"
                                    value={formDataBilling.amount}
                                    onChange={handleInputChangeBilling}
                                    placeholder="0.00"
                                    required
                                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                />
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModalBilling(false)}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md min-w-[120px]"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Discount Modal */}
                <Dialog open={showModalDiscount} onOpenChange={setShowModalDiscount}>
                    <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-white" />
                                    New Discount
                                </DialogTitle>
                                <DialogDescription className="text-amber-100 mt-1">
                                    Create a discount that can be applied to billing categories
                                    (sibling discount, early payment, scholarship, etc.).
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <form onSubmit={handleSubmitDiscount} className="px-6 py-5 space-y-5">
                            <div className="space-y-2">
                                <Label
                                    id="billingCategory"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Category
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormDataDiscount((prev) => ({
                                            ...prev,
                                            billing_cat_id: Number(value),
                                        }))
                                    }
                                    value={
                                        formDataDiscount.billing_cat_id > 0
                                            ? formDataDiscount.billing_cat_id.toString()
                                            : undefined
                                    }
                                >
                                    <SelectTrigger className="w-full h-11 rounded-xl">
                                        <SelectValue placeholder="Select category to apply" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {billingCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    id="billingDescription"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Description
                                </Label>
                                <Input
                                    id="billingDescription"
                                    name="description"
                                    value={formDataDiscount.description}
                                    onChange={handleInputChangeDiscount}
                                    required
                                    placeholder="e.g. Sibling Discount"
                                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-amber-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    id="billingValue"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Discount Type
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormDataDiscount((prev) => ({
                                            ...prev,
                                            value: value as 'fixed' | 'percentage',
                                        }))
                                    }
                                    value={formDataDiscount.value || undefined}
                                >
                                    <SelectTrigger className="w-full h-11 rounded-xl">
                                        <SelectValue placeholder="Select discount type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="fixed">Fixed Amount (₱)</SelectItem>
                                            <SelectItem value="percentage">
                                                Percentage (%)
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    id="billingAmount"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Amount
                                </Label>
                                <Input
                                    id="billingAmount"
                                    name="amount"
                                    type="number"
                                    value={formDataDiscount.amount}
                                    onChange={handleInputChangeDiscount}
                                    required
                                    placeholder={
                                        formDataDiscount.value === 'percentage' ? '10' : '500'
                                    }
                                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-amber-500"
                                />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModalDiscount(false)}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md min-w-[120px]"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}