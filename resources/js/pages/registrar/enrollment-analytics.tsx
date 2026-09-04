import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router } from '@inertiajs/react'
import { useMemo, type ReactNode } from 'react'
import CountUp from 'react-countup'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import {
    GraduationCap,
    Layers,
    Mars,
    RefreshCw,
    Sparkles,
    UserPlus,
    Users,
    Venus,
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Enrollment', href: '#' },
    { title: 'Analytics', href: '#' },
]

const COLORS = {
    new: '#0ea5e9',
    transferee: '#f59e0b',
    continuing: '#10b981',
    male: '#3b82f6',
    female: '#ec4899',
}

const LINE_COLORS = [
    '#0ea5e9',
    '#8b5cf6',
    '#10b981',
    '#f59e0b',
    '#f43f5e',
    '#06b6d4',
    '#6366f1',
    '#ec4899',
    '#14b8a6',
]

interface Props {
    summary: {
        total_enrollments: number
        new: number
        transferee: number
        continuing: number
        male: number
        female: number
    }
    bySchoolYear: Array<{
        id: number
        name: string
        is_active: boolean
        total: number
        new_count: number
        transferee_count: number
        continuing_count: number
        male_count: number
        female_count: number
    }>
    typeDistribution: Record<string, number>
    genderDistribution: Record<string, number>
    yearLevelGrowth: Record<string, Array<{ school_year: string; total: number }>>
    byYearLevel: Array<{
        id: number
        yearLevelName: string
        total: number
        new_count: number
        transferee_count: number
        continuing_count: number
        male_count: number
        female_count: number
    }> | null
    byClassArm: Array<{
        id: number
        classArmName: string
        yearLevelName: string
        total: number
    }> | null
    schoolYears: Array<{ id: number; name: string; is_active: boolean }>
    filters: { school_year_id: number | null }
}

type NamedSlice = { name: string; value: number; color: string }

type SchoolYearBarRow = {
    name: string
    tick: string
    New: number
    Transferee: number
    Continuing: number
    Male: number
    Female: number
    Total: number
}

type GrowthRow = { year: string; tick: string } & Record<string, string | number>

type TooltipItem = {
    name?: string
    value?: number
    color?: string
    payload?: Record<string, unknown>
}

function abbreviate(name: string): string {
    const trimmed = name.trim()

    const schoolYear = trimmed.match(/^(\d{4})\s*[–-]\s*(\d{4})$/)
    if (schoolYear) return `${schoolYear[1].slice(2)}–${schoolYear[2].slice(2)}`

    const grade = trimmed.match(/^grade\s+(\d+)(?:\s*[-–:]\s*(.+))?/i)
    if (grade) {
        return grade[2]
            ? `G${grade[1]}-${grade[2].trim().slice(0, 3)}`
            : `G${grade[1]}`
    }

    if (/^kindergarten/i.test(trimmed)) return 'K'
    if (/^nursery/i.test(trimmed)) return 'N'
    if (/^preparatory/i.test(trimmed)) return 'Prep'

    const words = trimmed.split(/[\s/_-]+/).filter(Boolean)
    if (words.length >= 2) {
        return words
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 4)
    }

    return trimmed.length > 6 ? trimmed.slice(0, 6) : trimmed
}

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean
    payload?: TooltipItem[]
    label?: string
}) {
    if (!active || !payload?.length) return null

    const fullName =
        (typeof payload[0].payload?.name === 'string' && payload[0].payload.name) ||
        (typeof payload[0].payload?.year === 'string' && payload[0].payload.year) ||
        label

    return (
        <div className="rounded-xl border border-sky-200/70 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm dark:border-sky-500/20 dark:bg-slate-900/95">
            {fullName && (
                <p className="mb-1.5 font-semibold text-slate-800 dark:text-slate-100">
                    {fullName}
                </p>
            )}
            {payload.map((p) => (
                <p key={p.name} className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                    />
                    <span className="text-slate-500 dark:text-slate-400">{p.name}</span>
                    <span className="ml-auto font-semibold text-slate-800 dark:text-slate-100">
                        {(p.value ?? 0).toLocaleString()}
                    </span>
                </p>
            ))}
        </div>
    )
}

function AxisTick({
    x = 0,
    y = 0,
    payload,
}: {
    x?: number
    y?: number
    payload?: { value: string }
}) {
    const label = String(payload?.value ?? '')

    return (
        <g transform={`translate(${x},${y})`}>
            <text dy={12} textAnchor="middle" className="fill-slate-400" fontSize={10}>
                {label}
            </text>
        </g>
    )
}

function DonutCard({
    title,
    description,
    data,
}: {
    title: string
    description: string
    data: NamedSlice[]
}) {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    const empty = total === 0

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            </div>

            <div className="grid min-h-72 grid-cols-1 items-center gap-2 px-4 py-3 sm:grid-cols-[1fr_140px]">
                {empty ? (
                    <p className="col-span-full py-10 text-center text-sm text-slate-400">
                        Nothing to chart yet.
                    </p>
                ) : (
                    <>
                        <div className="relative h-56 sm:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={52}
                                        outerRadius={84}
                                        paddingAngle={3}
                                        stroke="none"
                                    >
                                        {data.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                    Total
                                </p>
                                <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                                    {total.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <ul className="space-y-2 pb-2">
                            {data.map((d) => {
                                const pct = total ? Math.round((d.value / total) * 100) : 0
                                return (
                                    <li key={d.name} className="flex items-center gap-2 text-xs">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: d.color }}
                                        />
                                        <span className="min-w-0 flex-1 truncate font-medium text-slate-600 dark:text-slate-300">
                                            {d.name}
                                        </span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {pct}%
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                )}
            </div>
        </div>
    )
}

function ChartShell({
    title,
    description,
    children,
    empty,
}: {
    title: string
    description: string
    children: ReactNode
    empty?: boolean
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                    <Layers className="h-4 w-4" />
                </div>
            </div>
            <div className="h-72 px-1 pb-2 pt-4 sm:h-80 sm:px-2">
                {empty ? (
                    <p className="flex h-full items-center justify-center text-sm text-slate-400">
                        No data yet — the story is still unfolding.
                    </p>
                ) : (
                    children
                )}
            </div>
        </div>
    )
}

function SummaryCard({
    title,
    value,
    hint,
    icon,
    accent,
}: {
    title: string
    value: number
    hint: string
    icon: ReactNode
    accent: string
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {title}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        <CountUp end={value} duration={1.2} separator="," />
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
                </div>
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${accent}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    )
}

export default function EnrollmentAnalyticsPage({
    summary,
    bySchoolYear,
    typeDistribution,
    genderDistribution,
    yearLevelGrowth,
    byYearLevel,
    byClassArm,
    schoolYears,
    filters,
}: Props) {
    const typeChartData = useMemo<NamedSlice[]>(
        () => [
            { name: 'New', value: typeDistribution['new'] ?? 0, color: COLORS.new },
            {
                name: 'Transferee',
                value: typeDistribution['transferee'] ?? 0,
                color: COLORS.transferee,
            },
            {
                name: 'Continuing',
                value: typeDistribution['old/continuing'] ?? 0,
                color: COLORS.continuing,
            },
        ],
        [typeDistribution],
    )

    const genderChartData = useMemo<NamedSlice[]>(
        () => [
            { name: 'Male', value: genderDistribution['male'] ?? 0, color: COLORS.male },
            { name: 'Female', value: genderDistribution['female'] ?? 0, color: COLORS.female },
        ],
        [genderDistribution],
    )

    const schoolYearComparison = useMemo<SchoolYearBarRow[]>(() => {
        const useAbbr = bySchoolYear.length > 3
        return bySchoolYear.map((sy) => ({
            name: sy.name,
            tick: useAbbr ? abbreviate(sy.name) : sy.name,
            New: sy.new_count,
            Transferee: sy.transferee_count,
            Continuing: sy.continuing_count,
            Male: sy.male_count,
            Female: sy.female_count,
            Total: sy.total,
        }))
    }, [bySchoolYear])

    const yearLevelKeys = Object.keys(yearLevelGrowth)

    const growthLines = useMemo<GrowthRow[]>(() => {
        const years = [
            ...new Set(
                Object.values(yearLevelGrowth).flatMap((arr) =>
                    arr.map((item) => item.school_year),
                ),
            ),
        ].sort()

        const useAbbr = years.length > 3

        return years.map((year) => {
            const row: GrowthRow = {
                year,
                tick: useAbbr ? abbreviate(year) : year,
            }
            for (const [level, data] of Object.entries(yearLevelGrowth)) {
                row[level] = data.find((d) => d.school_year === year)?.total ?? 0
            }
            return row
        })
    }, [yearLevelGrowth])

    const handleFilter = (value: string) => {
        router.get(
            '/registrar/enrollment-analytics',
            { school_year_id: value === 'all' ? null : value },
            { preserveState: true, replace: true },
        )
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enrollment Analytics" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                    <header className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-white p-5 dark:border-sky-500/20 dark:bg-slate-900 sm:p-7">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />

                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                                    <Sparkles className="h-3 w-3" />
                                    Enrollment insights
                                </div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                    See the{' '}
                                    <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                                        story
                                    </span>{' '}
                                    of every year
                                </h1>
                                <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                                    Types, gender, year levels, and class arms — compared with optimism and clarity.
                                </p>
                            </div>

                            <Select
                                value={filters.school_year_id?.toString() ?? 'all'}
                                onValueChange={handleFilter}
                            >
                                <SelectTrigger className="h-11 w-full rounded-xl sm:w-[220px]">
                                    <SelectValue placeholder="All school years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All school years</SelectItem>
                                    {schoolYears.map((sy) => (
                                        <SelectItem key={sy.id} value={sy.id.toString()}>
                                            {sy.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </header>

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                        <SummaryCard
                            title="Total enrolled"
                            value={summary.total_enrollments}
                            hint="Every learner counted"
                            icon={<Users className="h-5 w-5" />}
                            accent="from-sky-400 to-indigo-500"
                        />
                        <SummaryCard
                            title="New"
                            value={summary.new}
                            hint="First time with us"
                            icon={<UserPlus className="h-5 w-5" />}
                            accent="from-sky-500 to-cyan-500"
                        />
                        <SummaryCard
                            title="Transferee"
                            value={summary.transferee}
                            hint="Joining from elsewhere"
                            icon={<RefreshCw className="h-5 w-5" />}
                            accent="from-amber-400 to-orange-500"
                        />
                        <SummaryCard
                            title="Continuing"
                            value={summary.continuing}
                            hint="Growing with us"
                            icon={<GraduationCap className="h-5 w-5" />}
                            accent="from-emerald-400 to-teal-500"
                        />
                        <SummaryCard
                            title="Male"
                            value={summary.male}
                            hint="Boys enrolled"
                            icon={<Mars className="h-5 w-5" />}
                            accent="from-blue-500 to-indigo-500"
                        />
                        <SummaryCard
                            title="Female"
                            value={summary.female}
                            hint="Girls enrolled"
                            icon={<Venus className="h-5 w-5" />}
                            accent="from-pink-400 to-rose-500"
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <DonutCard
                            title="Enrollment by type"
                            description="New, transferee, and continuing mix"
                            data={typeChartData}
                        />
                        <DonutCard
                            title="Enrollment by gender"
                            description="A balanced look at the community"
                            data={genderChartData}
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">

                        <ChartShell
                            title="School years — enrollment types"
                            description="Stacked new, transferee, and continuing"
                            empty={schoolYearComparison.length === 0}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={schoolYearComparison}
                                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="currentColor"
                                        className="text-slate-200 dark:text-slate-800"
                                    />
                                    <XAxis
                                        dataKey="tick"
                                        tickLine={false}
                                        axisLine={false}
                                        interval={0}
                                        height={36}
                                        tick={<AxisTick />}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                        width={36}
                                        tick={{ fontSize: 11, fill: 'currentColor' }}
                                        className="text-slate-400"
                                    />
                                    <Tooltip
                                        content={<ChartTooltip />}
                                        cursor={{ fill: 'rgba(14,165,233,0.08)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="New" stackId="a" fill={COLORS.new} maxBarSize={48} />
                                    <Bar
                                        dataKey="Transferee"
                                        stackId="a"
                                        fill={COLORS.transferee}
                                        maxBarSize={48}
                                    />
                                    <Bar
                                        dataKey="Continuing"
                                        stackId="a"
                                        fill={COLORS.continuing}
                                        maxBarSize={48}
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartShell>

                        <ChartShell
                            title="School years — gender"
                            description="Male and female side by side"
                            empty={schoolYearComparison.length === 0}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={schoolYearComparison}
                                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="currentColor"
                                        className="text-slate-200 dark:text-slate-800"
                                    />
                                    <XAxis
                                        dataKey="tick"
                                        tickLine={false}
                                        axisLine={false}
                                        interval={0}
                                        height={36}
                                        tick={<AxisTick />}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                        width={36}
                                        tick={{ fontSize: 11, fill: 'currentColor' }}
                                        className="text-slate-400"
                                    />
                                    <Tooltip
                                        content={<ChartTooltip />}
                                        cursor={{ fill: 'rgba(14,165,233,0.08)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                    <Bar
                                        dataKey="Male"
                                        fill={COLORS.male}
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={40}
                                    />
                                    <Bar
                                        dataKey="Female"
                                        fill={COLORS.female}
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartShell>
                    </div>

                    {yearLevelKeys.length > 0 && (
                        <ChartShell
                            title="Year level growth"
                            description="How each level grows across school years"
                            empty={growthLines.length === 0}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={growthLines}
                                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="currentColor"
                                        className="text-slate-200 dark:text-slate-800"
                                    />
                                    <XAxis
                                        dataKey="tick"
                                        tickLine={false}
                                        axisLine={false}
                                        interval={0}
                                        height={36}
                                        tick={<AxisTick />}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                        width={36}
                                        tick={{ fontSize: 11, fill: 'currentColor' }}
                                        className="text-slate-400"
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                    {yearLevelKeys.map((level, idx) => (
                                        <Line
                                            key={level}
                                            type="monotone"
                                            dataKey={level}
                                            stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartShell>
                    )}
                    

                    {filters.school_year_id && byYearLevel && (
                        <>
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Breakdown by year level
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Type and gender for the selected school year
                                    </p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[640px] text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 text-left dark:bg-slate-800/40">
                                                <th className="px-4 py-3 font-semibold text-slate-500">
                                                    Year level
                                                </th>
                                                <th className="px-4 py-3 text-right font-semibold text-slate-500">
                                                    Total
                                                </th>
                                                <th className="px-4 py-3 text-right font-semibold text-slate-500">
                                                    New
                                                </th>
                                                <th className="px-4 py-3 text-right font-semibold text-slate-500">
                                                    Transferee
                                                </th>
                                                <th className="px-4 py-3 text-right font-semibold text-slate-500">
                                                    Continuing
                                                </th>
                                                <th className="px-4 py-3 text-right font-semibold text-slate-500">
                                                    Male
                                                </th>
                                                <th className="px-4 py-3 text-right font-semibold text-slate-500">
                                                    Female
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {byYearLevel.map((yl) => (
                                                <tr
                                                    key={yl.id}
                                                    className="border-t border-slate-100 dark:border-slate-800"
                                                >
                                                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                                        {yl.yearLevelName}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">{yl.total}</td>
                                                    <td className="px-4 py-3 text-right">{yl.new_count}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        {yl.transferee_count}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {yl.continuing_count}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">{yl.male_count}</td>
                                                    <td className="px-4 py-3 text-right">{yl.female_count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {byClassArm && byClassArm.length > 0 && (
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                    <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Class arm occupancy
                                        </h3>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            How full each classroom is this year
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[420px] text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-left dark:bg-slate-800/40">
                                                    <th className="px-4 py-3 font-semibold text-slate-500">
                                                        Year level
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-slate-500">
                                                        Class arm
                                                    </th>
                                                    <th className="px-4 py-3 text-right font-semibold text-slate-500">
                                                        Enrolled
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {byClassArm.map((ca) => (
                                                    <tr
                                                        key={ca.id}
                                                        className="border-t border-slate-100 dark:border-slate-800"
                                                    >
                                                        <td className="px-4 py-3">{ca.yearLevelName}</td>
                                                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                                            {ca.classArmName}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">{ca.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}