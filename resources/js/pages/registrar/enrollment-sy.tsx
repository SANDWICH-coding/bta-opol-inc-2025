import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    GraduationCap,
    School,
    Sparkles,
} from 'lucide-react'
import { useState } from 'react'

interface SchoolYear {
    id: number
    name: string
    year_levels_count: number
}

interface SchoolYearPageProps {
    schoolYears: SchoolYear[]
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Enrollment',
        href: '#',
    },
]

export default function EnrollmentSYPage({ schoolYears }: SchoolYearPageProps) {
    console.log('schoolYears:', schoolYears)

    const [isOpen, setIsOpen] = useState(true)
    const [loadingSchoolYearId, setLoadingSchoolYearId] = useState<number | null>(null)

    const handleGetStarted = (schoolYearId: number) => {
        // Optimistic UI:
        // Immediately show the selected school year as loading
        // before Inertia finishes the navigation.
        setLoadingSchoolYearId(schoolYearId)

        router.get(`/registrar/school-year-setup/${schoolYearId}`, {}, {
            preserveScroll: true,
            onError: () => {
                // If navigation fails, restore the button.
                setLoadingSchoolYearId(null)
            },
            onFinish: () => {
                // If the page does not navigate for any reason,
                // make sure the button isn't stuck in loading state.
                setLoadingSchoolYearId(null)
            },
        })
    }

    const totalSchoolYears = schoolYears.length
    const configuredSchoolYears = schoolYears.filter(
        (schoolYear) => schoolYear.year_levels_count > 0
    ).length

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enrollment" />

            <div className="min-h-full w-full bg-slate-50/50 dark:bg-slate-950">
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
                                    Enrollment Center
                                </div>

                                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                                    Let&apos;s get students enrolled! 🎓
                                </h1>

                                <p className="mt-4 max-w-xl text-base leading-relaxed text-sky-100 sm:text-lg">
                                    Choose a school year below to start setting up enrollment.
                                    You&apos;re just a few steps away from getting everything ready.
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:min-w-[230px]">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                                        <GraduationCap className="h-6 w-6 text-white" />
                                    </div>

                                    <div>
                                        <p className="text-2xl font-bold">
                                            {configuredSchoolYears}/{totalSchoolYears}
                                        </p>
                                        <p className="text-sm text-sky-100">
                                            School years configured
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Setup Card */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                        {/* Card Header */}
                        <button
                            type="button"
                            onClick={() => setIsOpen((current) => !current)}
                            aria-expanded={isOpen}
                            className="group flex w-full items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 text-left transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/50 sm:px-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 text-indigo-600 dark:from-sky-950/60 dark:to-indigo-950/60 dark:text-indigo-400">
                                    <School className="h-5 w-5" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            School Year Setup
                                        </h2>

                                        {totalSchoolYears > 0 && (
                                            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                                                {totalSchoolYears}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                        Select a school year to continue
                                    </p>
                                </div>
                            </div>

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all group-hover:bg-sky-100 group-hover:text-sky-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-sky-950/50 dark:group-hover:text-sky-400">
                                {isOpen ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </div>
                        </button>

                        {/* Collapsible Content */}
                        <div
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen
                                ? 'grid-rows-[1fr] opacity-100'
                                : 'grid-rows-[0fr] opacity-0'
                                }`}
                        >
                            <div className="min-h-0 overflow-hidden">
                                <div className="p-4 sm:p-6">

                                    {schoolYears.length === 0 ? (
                                        /* Empty State */
                                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-800/30">
                                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-950/60 dark:to-indigo-950/60">
                                                <School className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                No school years available yet
                                            </h3>

                                            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                                Once a school year is created, it will appear here
                                                and you&apos;ll be able to begin the enrollment setup.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {schoolYears.map((schoolYear) => {
                                                const isLoading =
                                                    loadingSchoolYearId === schoolYear.id

                                                const hasYearLevels = schoolYear.year_levels_count > 0

                                                return (
                                                    <div
                                                        key={schoolYear.id}
                                                        className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 sm:p-5 ${isLoading
                                                            ? 'border-indigo-300 bg-indigo-50/70 shadow-md shadow-indigo-500/10 dark:border-indigo-700 dark:bg-indigo-950/30'
                                                            : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/30 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-800 dark:hover:bg-slate-800/70'
                                                            }`}
                                                    >
                                                        {/* Accent */}
                                                        <div
                                                            className={`absolute inset-y-0 left-0 w-1 transition-colors ${hasYearLevels
                                                                ? 'bg-emerald-500'
                                                                : 'bg-slate-300 dark:bg-slate-600'
                                                                }`}
                                                        />

                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                            {/* Icon */}
                                                            <div
                                                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${hasYearLevels
                                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                                    : 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400'
                                                                    }`}
                                                            >
                                                                <School className="h-6 w-6" />
                                                            </div>

                                                            {/* Information */}
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h3 className="truncate text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                                                                        {schoolYear.name}
                                                                    </h3>

                                                                    {hasYearLevels && (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                                            Ready
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                                                    <span>
                                                                        {schoolYear.year_levels_count} year level
                                                                        {schoolYear.year_levels_count !== 1 ? 's' : ''}
                                                                    </span>


                                                                    <span className="hidden text-slate-300 dark:text-slate-700 sm:inline">
                                                                        •
                                                                    </span>

                                                                    <span>
                                                                        {hasYearLevels
                                                                            ? 'Enrollment setup available'
                                                                            : 'Ready for setup'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Action */}
                                                            <div className="shrink-0 sm:ml-auto">
                                                                <Button
                                                                    type="button"
                                                                    disabled={isLoading}
                                                                    onClick={() =>
                                                                        handleGetStarted(
                                                                            schoolYear.id
                                                                        )
                                                                    }
                                                                    className={`w-full rounded-xl px-5 font-semibold shadow-sm transition-all sm:w-auto ${isLoading
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sky-500/20 hover:from-sky-600 hover:to-indigo-700 hover:shadow-md'
                                                                        }`}
                                                                >
                                                                    {isLoading ? (
                                                                        <>
                                                                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                                            Opening...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            Get Started
                                                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Footer Hint */}
                                    {schoolYears.length > 0 && (
                                        <div className="mt-5 flex items-start gap-3 rounded-xl bg-sky-50/70 px-4 py-3.5 dark:bg-sky-950/20">
                                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />

                                            <p className="text-xs leading-relaxed text-sky-700 dark:text-sky-300">
                                                Choose a school year to configure its enrollment
                                                details, year levels, and other requirements.
                                                You&apos;ve got this!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
