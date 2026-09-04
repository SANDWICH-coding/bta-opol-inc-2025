'use client'

import { Head, router, usePage } from '@inertiajs/react'
import { useMemo, useState } from 'react'
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    GraduationCap,
    Loader2,
    Search,
    Sparkles,
    Users,
} from 'lucide-react'

import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

type Student = {
    id: number
    lrn: string
    firstName: string
    middleName?: string
    lastName: string
    yearLevel: string
    section: string
    totalPaid: number
}

type SchoolYear = {
    id: number
    name: string
}

type PageProps = {
    students: Student[]
    schoolYears: SchoolYear[]
    selectedSchoolYear: string
    selectedYearLevel?: string
    yearLevels: string[]
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: '/billing/students',
    },
]

const toProperCase = (value: string) => {
    return value
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getStudentName = (student: Student) => {
    return `${student.firstName} ${student.middleName ?? ''} ${student.lastName}`
        .replace(/\s+/g, ' ')
        .trim()
}

const getInitials = (student: Student) => {
    return `${student.firstName?.[0] ?? ''}${student.lastName?.[0] ?? ''}`.toUpperCase()
}

export default function StudentList() {
    const {
        students = [],
        schoolYears = [],
        selectedSchoolYear,
    } = usePage<PageProps>().props

    const [searchQuery, setSearchQuery] = useState('')
    const [isNavigating, setIsNavigating] = useState(false)
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        null
    )

    const studentsByYearLevel = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        const filteredStudents = query
            ? students.filter((student) => {
                const searchableText = [
                    student.lrn,
                    student.firstName,
                    student.middleName,
                    student.lastName,
                    student.yearLevel,
                    student.section,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()

                return searchableText.includes(query)
            })
            : students

        return filteredStudents.reduce(
            (acc, student) => {
                if (!acc[student.yearLevel]) {
                    acc[student.yearLevel] = []
                }

                acc[student.yearLevel].push(student)

                return acc
            },
            {} as Record<string, Student[]>
        )
    }, [students, searchQuery])

    const visibleStudents = useMemo(() => {
        return Object.values(studentsByYearLevel).flat()
    }, [studentsByYearLevel])

    const yearLevelCount = Object.keys(studentsByYearLevel).length

    const handleStudentDetails = (student: Student) => {
        setSelectedStudentId(student.id)
        setIsNavigating(true)

        router.get(`/billing/students/${student.id}`, undefined, {
            preserveScroll: true,
            onFinish: () => {
                setIsNavigating(false)
                setSelectedStudentId(null)
            },
        })
    }

    const handleSchoolYearChange = (schoolYear: string) => {
        if (schoolYear === selectedSchoolYear) {
            return
        }

        setIsNavigating(true)

        router.get(
            route('billing.students'),
            {
                school_year: schoolYear,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setIsNavigating(false)
                },
            }
        )
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />

            <div className="full bg-gradient-to-b from-muted/30 via-background to-background">
                <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

                    {/* Hero */}
                    <Card className="relative overflow-hidden rounded-3xl border-border/60 bg-gradient-to-br from-primary via-primary/90 to-violet-600 text-primary-foreground shadow-xl shadow-primary/10">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        </div>

                        <CardContent className="relative p-6 sm:p-8">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">
                                        <GraduationCap className="h-7 w-7" />
                                    </div>

                                    <div>
                                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                                            Student Directory
                                        </div>

                                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                            Your students, all in one place
                                        </h1>

                                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                                            Browse enrollment records, find a
                                            student quickly, and jump straight
                                            into their billing details.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
                                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                                        <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
                                            <Users className="h-4 w-4" />
                                            Students
                                        </div>

                                        <p className="mt-1 text-2xl font-bold">
                                            {students.length.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                                        <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
                                            <BookOpen className="h-4 w-4" />
                                            Year Levels
                                        </div>

                                        <p className="mt-1 text-2xl font-bold">
                                            {yearLevelCount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Card */}
                    <Card className="overflow-hidden rounded-3xl border-border/60 bg-card shadow-sm">
                        <CardHeader className="border-b border-border/60 bg-muted/20 px-5 py-5 sm:px-6">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-xl font-bold">
                                            Enrollment Directory
                                        </CardTitle>

                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {selectedSchoolYear}
                                        </span>
                                    </div>

                                    <CardDescription className="mt-1">
                                        Browse and manage enrolled students for
                                        the selected school year.
                                    </CardDescription>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isNavigating && (
                                        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Loading...
                                        </div>
                                    )}

                                    <Select
                                        value={selectedSchoolYear}
                                        onValueChange={handleSchoolYearChange}
                                        disabled={isNavigating}
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl bg-background sm:w-[210px]">
                                            <SelectValue placeholder="School Year" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {schoolYears.map((schoolYear) => (
                                                <SelectItem
                                                    key={schoolYear.id}
                                                    value={schoolYear.name}
                                                >
                                                    {schoolYear.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-5 sm:p-6">

                            {/* Search */}
                            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative w-full sm:max-w-md">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        value={searchQuery}
                                        onChange={(event) =>
                                            setSearchQuery(event.target.value)
                                        }
                                        placeholder="Search by name, LRN, year level, or section..."
                                        className="h-11 rounded-xl pl-10 pr-10"
                                    />

                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearchQuery('')
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />

                                    <span>
                                        Showing{' '}
                                        <span className="font-semibold text-foreground">
                                            {visibleStudents.length}
                                        </span>{' '}
                                        {visibleStudents.length === 1
                                            ? 'student'
                                            : 'students'}
                                    </span>
                                </div>
                            </div>

                            {/* Search Result Banner */}
                            {searchQuery && (
                                <div className="mb-5 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Search className="h-4 w-4 text-primary" />

                                        <p className="text-sm">
                                            Search results for{' '}
                                            <span className="font-semibold text-foreground">
                                                "{searchQuery}"
                                            </span>
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchQuery('')}
                                        className="h-8 rounded-lg text-xs"
                                    >
                                        Clear search
                                    </Button>
                                </div>
                            )}

                            {/* Student Groups */}
                            {visibleStudents.length > 0 ? (
                                <Accordion
                                    type="multiple"
                                    defaultValue={Object.keys(
                                        studentsByYearLevel
                                    )}
                                    className="w-full space-y-3"
                                >
                                    {Object.entries(studentsByYearLevel).map(
                                        ([yearLevel, group]) => (
                                            <AccordionItem
                                                key={yearLevel}
                                                value={yearLevel}
                                                className="overflow-hidden rounded-2xl border border-border/60 bg-card px-0"
                                            >
                                                <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5">
                                                    <div className="flex w-full items-center justify-between pr-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                                <GraduationCap className="h-5 w-5" />
                                                            </div>

                                                            <div className="text-left">
                                                                <p className="font-bold">
                                                                    {yearLevel}
                                                                </p>

                                                                <p className="text-xs text-muted-foreground">
                                                                    {group.length}{' '}
                                                                    {group.length ===
                                                                        1
                                                                        ? 'student'
                                                                        : 'students'}{' '}
                                                                    enrolled
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
                                                            {group.length}
                                                        </span>
                                                    </div>
                                                </AccordionTrigger>

                                                <AccordionContent className="border-t border-border/50 bg-muted/10 px-0 pb-0">
                                                    {/* Desktop Table */}
                                                    <div className="hidden overflow-x-auto md:block">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                                                    <TableHead className="pl-5">
                                                                        LRN
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        Student
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        Section
                                                                    </TableHead>
                                                                    <TableHead className="text-right pr-5">
                                                                        Action
                                                                    </TableHead>
                                                                </TableRow>
                                                            </TableHeader>

                                                            <TableBody>
                                                                {group.map(
                                                                    (
                                                                        student
                                                                    ) => (
                                                                        <TableRow
                                                                            key={
                                                                                student.id
                                                                            }
                                                                            className="group cursor-pointer transition-colors hover:bg-primary/5"
                                                                            onClick={() =>
                                                                                handleStudentDetails(
                                                                                    student
                                                                                )
                                                                            }
                                                                        >
                                                                            <TableCell className="pl-5 font-mono text-xs font-medium text-muted-foreground">
                                                                                {
                                                                                    student.lrn
                                                                                }
                                                                            </TableCell>

                                                                            <TableCell>
                                                                                <div className="flex items-center gap-3">
                                                                                    <div>
                                                                                        <p className="font-semibold">
                                                                                            {toProperCase(
                                                                                                getStudentName(
                                                                                                    student
                                                                                                )
                                                                                            )}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </TableCell>

                                                                            <TableCell>
                                                                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                                                    {student.section ||
                                                                                        '—'}
                                                                                </span>
                                                                            </TableCell>

                                                                            <TableCell className="pr-5 text-right">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    disabled={
                                                                                        isNavigating
                                                                                    }
                                                                                    className="rounded-xl text-primary hover:bg-primary/10 hover:text-primary"
                                                                                    onClick={(
                                                                                        event
                                                                                    ) => {
                                                                                        event.stopPropagation()
                                                                                        handleStudentDetails(
                                                                                            student
                                                                                        )
                                                                                    }}
                                                                                >
                                                                                    {selectedStudentId ===
                                                                                        student.id ? (
                                                                                        <>
                                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                            Opening...
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            View
                                                                                            details
                                                                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                                                        </>
                                                                                    )}
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>

                                                    {/* Mobile Cards */}
                                                    <div className="space-y-3 p-3 md:hidden">
                                                        {group.map(
                                                            (student) => (
                                                                <button
                                                                    key={
                                                                        student.id
                                                                    }
                                                                    type="button"
                                                                    disabled={
                                                                        isNavigating
                                                                    }
                                                                    onClick={() =>
                                                                        handleStudentDetails(
                                                                            student
                                                                        )
                                                                    }
                                                                    className="group w-full rounded-2xl border border-border/60 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md disabled:cursor-wait disabled:opacity-70"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-violet-500/15 font-bold text-primary ring-1 ring-primary/10">
                                                                            {getInitials(
                                                                                student
                                                                            )}
                                                                        </div>

                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <p className="truncate font-bold">
                                                                                    {toProperCase(
                                                                                        getStudentName(
                                                                                            student
                                                                                        )
                                                                                    )}
                                                                                </p>

                                                                                {selectedStudentId ===
                                                                                    student.id ? (
                                                                                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                                                                                ) : (
                                                                                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                                                                )}
                                                                            </div>

                                                                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                                                {
                                                                                    student.lrn
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                                                                            {
                                                                                student.yearLevel
                                                                            }
                                                                        </span>

                                                                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                                                            Section:{' '}
                                                                            {student.section ||
                                                                                '—'}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )
                                    )}
                                </Accordion>
                            ) : (
                                /* Empty / No Search Results */
                                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 px-6 text-center">
                                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        {searchQuery ? (
                                            <Search className="h-7 w-7" />
                                        ) : (
                                            <GraduationCap className="h-7 w-7" />
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold">
                                        {searchQuery
                                            ? 'No students found'
                                            : 'No students enrolled yet'}
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                                        {searchQuery
                                            ? `We couldn't find a student matching "${searchQuery}". Try a different name, LRN, year level, or section.`
                                            : `There are currently no enrollment records for ${selectedSchoolYear}.`}
                                    </p>

                                    {searchQuery ? (
                                        <Button
                                            variant="outline"
                                            className="mt-5 rounded-xl"
                                            onClick={() =>
                                                setSearchQuery('')
                                            }
                                        >
                                            Clear search
                                        </Button>
                                    ) : (
                                        <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs font-medium text-primary">
                                            <Sparkles className="h-4 w-4" />
                                            Students will appear here once
                                            enrollment is recorded.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            {visibleStudents.length > 0 && (
                                <div className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

                                        <span>
                                            Enrollment records are up to date
                                            for{' '}
                                            <span className="font-semibold text-foreground">
                                                {selectedSchoolYear}
                                            </span>
                                        </span>
                                    </div>

                                    <span>
                                        {visibleStudents.length.toLocaleString()}{' '}
                                        visible student
                                        {visibleStudents.length === 1
                                            ? ''
                                            : 's'}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
