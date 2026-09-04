import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast, Toaster } from 'sonner';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from '@/components/ui/menubar';
import {
    Trash,
    EllipsisVertical,
    FolderUp,
    Loader2,
    Plus,
    CalendarDays,
    Sparkles,
    GraduationCap,
    ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SchoolYear {
    id: number;
    name: string;
    yearLevels_count: number;
}

interface SchoolYearPageProps {
    schoolYears: SchoolYear[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'School Year',
        href: '#',
    },
];

export default function SchoolYearPage({ schoolYears }: SchoolYearPageProps) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = () => {
        setFormData({ name: '' });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this school year? This action cannot be undone.')) {
            router.delete(`/admin/school-year/${id}`, {
                onSuccess: () => {
                    toast.success('School year deleted successfully');
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Failed to delete school year');
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/admin/school-year', formData, {
            onSuccess: () => {
                setIsSubmitting(false);
                setShowModal(false);
                toast.success('New school year created successfully! 🎉');
            },
            onError: (errors) => {
                setIsSubmitting(false);
                toast.error(errors.name || 'Failed to create school year');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Years" />
            <Toaster richColors closeButton position="top-right" />

            <div className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-700 p-8 sm:p-10 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-400/30 blur-3xl" />

                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm border border-white/20">
                                <Sparkles className="h-4 w-4 text-amber-300" />
                                Academic Calendar
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                School Years
                            </h1>
                            <p className="text-sky-100 text-base sm:text-lg max-w-xl leading-relaxed">
                                Organize your academic journey. Create new school years and set up
                                grade levels with confidence — every great year starts here!
                            </p>
                        </div>

                        <Button
                            onClick={handleAdd}
                            size="lg"
                            className="shrink-0 rounded-full bg-white text-indigo-700 hover:bg-sky-50 hover:scale-[1.03] shadow-lg font-semibold px-6 h-12 transition-all"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Create New Year
                        </Button>
                    </div>
                </div>

                {/* Stats / Encouragement */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-950/40 px-4 py-2 border border-sky-100 dark:border-sky-900">
                        <GraduationCap className="h-4 w-4 text-sky-600" />
                        <span className="font-medium text-sky-700 dark:text-sky-300">
                            {schoolYears.length} {schoolYears.length === 1 ? 'School Year' : 'School Years'} ready
                        </span>
                    </div>
                    {schoolYears.length > 0 && (
                        <p className="text-slate-500 dark:text-slate-400">
                            Click any card to manage setups or keep building your academic structure.
                        </p>
                    )}
                </div>

                {/* Content */}
                {schoolYears.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 py-20 px-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/50 dark:to-indigo-900/50 mb-6">
                            <CalendarDays className="h-10 w-10 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                            Ready to start a new chapter?
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                            No school years yet. Create your first one and begin building an amazing
                            academic structure for your students!
                        </p>
                        <Button
                            onClick={handleAdd}
                            size="lg"
                            className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/25 px-8 h-12 font-semibold"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Create Your First School Year
                        </Button>
                    </div>
                ) : (
                    /* Cards Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {schoolYears.map((sy) => (
                            <Card
                                key={sy.id}
                                className="group relative flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-sky-200 dark:hover:border-sky-800 transition-all duration-300 rounded-2xl"
                            >
                                {/* Accent bar */}
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/60 dark:to-indigo-900/60 group-hover:scale-105 transition-transform">
                                                <CalendarDays className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                                    {sy.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {sy.yearLevels_count > 0
                                                        ? `${sy.yearLevels_count} year level${sy.yearLevels_count > 1 ? 's' : ''} set up`
                                                        : 'Ready for setup'}
                                                </p>
                                            </div>
                                        </div>

                                        <Menubar className="border-0 bg-transparent shadow-none h-auto p-0">
                                            <MenubarMenu>
                                                <MenubarTrigger className="cursor-pointer rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 transition">
                                                    <EllipsisVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                                </MenubarTrigger>
                                                <MenubarContent align="end" className="min-w-[180px]">
                                                    <MenubarItem
                                                        className="cursor-pointer text-sky-600 focus:text-sky-700 focus:bg-sky-50"
                                                        onClick={() =>
                                                            router.get(`/admin/school-year/${sy.id}`)
                                                        }
                                                    >
                                                        <FolderUp className="mr-2 h-4 w-4" />
                                                        Manage Setup
                                                    </MenubarItem>
                                                    <MenubarSeparator />
                                                    <MenubarItem
                                                        onClick={() => handleDelete(sy.id)}
                                                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </MenubarItem>
                                                </MenubarContent>
                                            </MenubarMenu>
                                        </Menubar>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-between text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 font-medium group/btn"
                                            onClick={() =>
                                                router.get(`/admin/school-year/${sy.id}`)
                                            }
                                        >
                                            Open & manage
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {/* Quick-add card */}
                        <button
                            onClick={handleAdd}
                            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all duration-300 min-h-[180px] group"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-110 group-hover:border-sky-300 transition-all">
                                <Plus className="h-6 w-6 text-slate-400 group-hover:text-sky-600 transition-colors" />
                            </div>
                            <span className="text-sm font-semibold text-slate-500 group-hover:text-sky-600 transition-colors">
                                Add another year
                            </span>
                        </button>
                    </div>
                )}

                {/* Create Modal */}
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-5 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-300" />
                                    New School Year
                                </DialogTitle>
                                <DialogDescription className="text-sky-100 mt-1">
                                    Let's create a fresh academic year. Enter the name below
                                    (e.g. 2025-2026) and you're all set!
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    School Year Name
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 2025-2026"
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
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md min-w-[120px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Year
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}