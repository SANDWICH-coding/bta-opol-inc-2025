import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import {
    ArrowRight,
    CheckCircle2,
    GraduationCap,
    Presentation,
    Sparkles,
    Users,
} from 'lucide-react'
import { useState } from 'react'

interface ClassArm {
    id: number
    classArmName: string
}

interface Billing {
    id: number
    billing_cat_id: number
    description: string
    amount: number
    category: {
        id: number
        name: string
    }
}

interface BillingCategory {
    id: number
    name: string
}

interface BillingDiscount {
    id: number
    billing_cat_id: number
    category: BillingCategory
    description?: string
    value: 'fixed' | 'percentage'
    amount: number
}

interface YearLevel {
    id: number
    yearLevelName: string
    class_arms: ClassArm[]
    billings: Billing[]
}

interface SchoolYear {
    id: number
    name: string
    year_levels: YearLevel[]
    billing_discounts: BillingDiscount[]
}

interface SyManagePageProps {
    schoolYear: SchoolYear
    billingCategories: BillingCategory[]
}

export default function EnrollmentChoosePage({
    schoolYear,
}: SyManagePageProps) {
    const [loadingClassArmId, setLoadingClassArmId] = useState<number | null>(null)

    const totalYearLevels = schoolYear.year_levels.length

    const totalClassArms = schoolYear.year_levels.reduce(
        (total, level) => total + level.class_arms.length,
        0,
    )

    const yearLevelsWithSections = schoolYear.year_levels.filter(
        (level) => level.class_arms.length > 0,
    ).length

    const handleManageClassArm = (classArmId: number) => {
        // Optimistic UI feedback
        setLoadingClassArmId(classArmId)

        router.get(`/registrar/enrollment/class-arm-setup/${classArmId}`, {}, {
            onError: () => {
                setLoadingClassArmId(null)
            },
            onFinish: () => {
                setLoadingClassArmId(null)
            },
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Enrollment', href: '/registrar/' },
                { title: schoolYear.name, href: '#' },
            ]}
        >
            <Head title={`Enrollment • ${schoolYear.name}`} />

            <div className="w-full bg-slate-50/50 dark:bg-slate-950">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

                    {/* Hero */}
                    <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-500/10 sm:p-8 lg:p-10">
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%)]" />

                        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />

                        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm">
                                    <Sparkles className="h-4 w-4 text-amber-300" />
                                    Enrollment Setup
                                </div>

                                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                    Let&apos;s get enrollment ready! 🎓
                                </h1>

                                <p className="mt-4 max-w-xl text-base leading-relaxed text-sky-100 sm:text-lg">
                                    Choose a year level and select a class section to begin
                                    configuring enrollment for{' '}
                                    <span className="font-semibold text-white">
                                        {schoolYear.name}
                                    </span>
                                    .
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 sm:max-w-sm lg:w-[280px]">
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>

                                    <p className="text-2xl font-bold">
                                        {totalYearLevels}
                                    </p>

                                    <p className="text-xs text-sky-100">
                                        Year levels
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                                        <Users className="h-5 w-5" />
                                    </div>

                                    <p className="text-2xl font-bold">
                                        {totalClassArms}
                                    </p>

                                    <p className="text-xs text-sky-100">
                                        Class sections
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                        {/* Card Header */}
                        <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 text-indigo-600 dark:from-sky-950/60 dark:to-indigo-950/60 dark:text-indigo-400">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Choose a Year Level
                                        </h2>

                                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                            Expand a level to view its available sections.
                                        </p>
                                    </div>
                                </div>

                                {totalYearLevels > 0 && (
                                    <div className="flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 sm:self-auto">
                                        <CheckCircle2 className="h-3.5 w-3.5" />

                                        {yearLevelsWithSections} of {totalYearLevels}{' '}
                                        ready
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6">
                            {schoolYear.year_levels.length === 0 ? (
                                /* Empty State */
                                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-800/30">
                                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-950/60 dark:to-indigo-950/60">
                                        <GraduationCap className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        No year levels available
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        This school year doesn&apos;t have any year levels
                                        configured yet. Add year levels first before
                                        starting enrollment.
                                    </p>
                                </div>
                            ) : (
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="w-full space-y-3"
                                >
                                    {schoolYear.year_levels.map((level) => {
                                        const hasSections = level.class_arms.length > 0

                                        return (
                                            <AccordionItem
                                                key={level.id}
                                                value={`year-${level.id}`}
                                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-0 shadow-sm transition-all data-[state=open]:border-indigo-200 data-[state=open]:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:data-[state=open]:border-indigo-800"
                                            >
                                                <AccordionTrigger className="group px-5 py-4 hover:no-underline sm:px-6">
                                                    <div className="flex min-w-0 flex-1 items-center gap-4 text-left">
                                                        {/* Icon */}
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 text-indigo-600 transition-colors group-hover:from-sky-100 group-hover:to-indigo-100 dark:from-sky-950/50 dark:to-indigo-950/50 dark:text-indigo-400 dark:group-hover:from-sky-950/70 dark:group-hover:to-indigo-950/70">
                                                            <GraduationCap className="h-5 w-5" />
                                                        </div>

                                                        {/* Name */}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                                                                    {level.yearLevelName}
                                                                </span>

                                                                {hasSections && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        Ready
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                                                                {level.class_arms.length}{' '}
                                                                section
                                                                {level.class_arms.length !== 1
                                                                    ? 's'
                                                                    : ''}{' '}
                                                                available
                                                            </p>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>

                                                <AccordionContent className="border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-800 sm:px-6">
                                                    {level.class_arms.length === 0 ? (
                                                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
                                                            <Presentation className="mx-auto mb-3 h-7 w-7 text-slate-400" />

                                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                No sections available
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                There are no class sections
                                                                configured for this year
                                                                level yet.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="mb-4 flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                                        Available Sections
                                                                    </p>

                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                        Select a section to
                                                                        continue.
                                                                    </p>
                                                                </div>

                                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                                    {level.class_arms.length}{' '}
                                                                    available
                                                                </span>
                                                            </div>

                                                            {level.class_arms.map((arm) => {
                                                                const isLoading =
                                                                    loadingClassArmId === arm.id

                                                                return (
                                                                    <div
                                                                        key={arm.id}
                                                                        className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 sm:p-5 ${
                                                                            isLoading
                                                                                ? 'border-indigo-300 bg-indigo-50/70 shadow-md shadow-indigo-500/10 dark:border-indigo-700 dark:bg-indigo-950/30'
                                                                                : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/30 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-800 dark:hover:bg-slate-800/70'
                                                                        }`}
                                                                    >
                                                                        {/* Accent */}
                                                                        <div className="absolute inset-y-0 left-0 w-1 bg-sky-500 opacity-0 transition-opacity group-hover:opacity-100" />

                                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                                            {/* Icon */}
                                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                                                                                <Presentation className="h-5 w-5" />
                                                                            </div>

                                                                            {/* Information */}
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                                                                                        {arm.classArmName}
                                                                                    </h3>

                                                                                    <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline-flex">
                                                                                        Section
                                                                                    </span>
                                                                                </div>

                                                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                                    Ready for enrollment setup
                                                                                </p>
                                                                            </div>

                                                                            {/* Action */}
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                disabled={isLoading}
                                                                                onClick={() =>
                                                                                    handleManageClassArm(
                                                                                        arm.id,
                                                                                    )
                                                                                }
                                                                                className={`w-full rounded-xl px-5 font-semibold transition-all sm:w-auto ${
                                                                                    isLoading
                                                                                        ? 'bg-indigo-600 text-white'
                                                                                        : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/20 hover:from-sky-600 hover:to-indigo-700 hover:shadow-md'
                                                                                }`}
                                                                            >
                                                                                {isLoading ? (
                                                                                    <>
                                                                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                                                        Opening...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        Manage
                                                                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        )
                                    })}
                                </Accordion>
                            )}

                            {/* Helpful Footer */}
                            {schoolYear.year_levels.length > 0 && (
                                <div className="mt-5 flex items-start gap-3 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 px-4 py-3.5 dark:from-sky-950/20 dark:to-indigo-950/20">
                                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />

                                    <p className="text-xs leading-relaxed text-indigo-700 dark:text-indigo-300">
                                        <span className="font-semibold">
                                            Almost there!
                                        </span>{' '}
                                        Expand a year level, choose a class section,
                                        and you&apos;ll be ready to continue with
                                        enrollment.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
