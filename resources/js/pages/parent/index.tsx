import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import {
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    GraduationCap,
    History,
    Sparkles,
    Users,
} from "lucide-react";

interface SchoolYear {
    id: number;
    name: string;
}

interface YearLevel {
    id: number;
    school_year_id: number;
    yearLevelName: string;
    school_year?: SchoolYear;
}

interface ClassArm {
    id: number;
    year_level_id: number;
    classArmName: string;
    year_level?: YearLevel;
}

interface Enrollment {
    id: number;
    student_id: number;
    class_arm_id: number;
    type: string;
    created_at: string;
    updated_at: string;
    class_arm?: ClassArm;
}

interface Student {
    id: number;
    lrn: string;
    lastName: string;
    firstName: string;
    middleName: string | null;
    suffix: string | null;
    enrollments?: Enrollment[];
}

interface Parent {
    id: number;
    name: string;
    email: string;
}

interface Props {
    parent: Parent;
    students: Student[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/parent/dashboard",
    },
];

function getStudentName(student: Student) {
    return [student.firstName, student.middleName, student.lastName, student.suffix]
        .filter(Boolean)
        .join(" ");
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export default function Page({ parent, students }: Props) {
    const totalEnrollments = students.reduce(
        (total, student) => total + (student.enrollments?.length ?? 0),
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parent Dashboard" />

            <div className="">
                <div className="mx-auto w-full max-w-lg px-4 py-5 sm:max-w-3xl sm:px-6 lg:max-w-5xl lg:px-8 lg:py-8">
                    {/* Hero */}
                    <section className="relative mb-6 overflow-hidden rounded-3xl border border-sky-200/70 bg-white p-5 dark:border-sky-500/20 dark:bg-slate-900 sm:mb-8 sm:p-7">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />

                        <div className="relative space-y-5">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                                <Sparkles className="h-3 w-3" />
                                Family workspace
                            </div>

                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                    {greeting()},{" "}
                                    <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                                        {parent.name}
                                    </span>
                                </h1>
                                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                    Your children’s enrollments and billing, in one calm place.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-sky-50 px-4 py-3 dark:bg-sky-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Students
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                                        {students.length}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-indigo-50 px-4 py-3 dark:bg-indigo-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Enrollments
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                                        {totalEnrollments}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mb-4 flex items-center gap-3 sm:mb-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                                My students
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Tap an enrollment to view billing
                            </p>
                        </div>
                    </div>

                    {students.length > 0 ? (
                        <div className="space-y-6">
                            {students.map((student) => {
                                const enrollments = student.enrollments ?? [];
                                const studentName = getStudentName(student);

                                return (
                                    <section
                                        key={student.id}
                                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-bold text-white">
                                                    {student.firstName.charAt(0)}
                                                    {student.lastName.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                                                        {studentName}
                                                    </h3>
                                                    {student.lrn && (
                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            LRN {student.lrn}
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                                        {enrollments.length}{" "}
                                                        {enrollments.length === 1
                                                            ? "enrollment"
                                                            : "enrollments"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 sm:p-4">
                                            {enrollments.length > 0 ? (
                                                <div className="space-y-3">
                                                    {enrollments.map((enrollment, index) => {
                                                        const schoolYear =
                                                            enrollment.class_arm?.year_level
                                                                ?.school_year?.name ?? "N/A";
                                                        const yearLevel =
                                                            enrollment.class_arm?.year_level
                                                                ?.yearLevelName ?? "N/A";
                                                        const classArm =
                                                            enrollment.class_arm?.classArmName ??
                                                            "N/A";
                                                        const isLatest = index === 0;

                                                        return (
                                                            <Link
                                                                key={enrollment.id}
                                                                href={`/parent/students/${enrollment.id}/billing`}
                                                                className="group block rounded-2xl border border-slate-200 bg-white p-4 active:bg-sky-50 dark:border-slate-700 dark:bg-slate-900 dark:active:bg-sky-950/20"
                                                            >
                                                                <div className="mb-3 flex items-start justify-between gap-3">
                                                                    <div className="flex min-w-0 items-center gap-3">
                                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                                                                            <CalendarDays className="h-5 w-5" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                                School year
                                                                            </p>
                                                                            <p className="truncate text-base font-extrabold text-sky-700 dark:text-sky-300">
                                                                                {schoolYear}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex shrink-0 items-center gap-1.5">
                                                                        <span
                                                                            className={
                                                                                isLatest
                                                                                    ? "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                                                                    : "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                                                            }
                                                                        >
                                                                            {isLatest ? (
                                                                                <>
                                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                                    Latest
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <History className="h-3 w-3" />
                                                                                    Previous
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-sky-500" />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2.5">
                                                                    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                                                                        <div className="mb-1 flex items-center gap-1.5">
                                                                            <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                                Year level
                                                                            </span>
                                                                        </div>
                                                                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                                            {yearLevel}
                                                                        </p>
                                                                    </div>
                                                                    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                                                                        <div className="mb-1 flex items-center gap-1.5">
                                                                            <Users className="h-3.5 w-3.5 text-indigo-500" />
                                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                                Class arm
                                                                            </span>
                                                                        </div>
                                                                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                                            {classArm}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                                                                    <span>
                                                                        Type:{" "}
                                                                        <span className="font-semibold capitalize text-slate-700 dark:text-slate-200">
                                                                            {enrollment.type}
                                                                        </span>
                                                                    </span>
                                                                    <span>
                                                                        Enrolled{" "}
                                                                        {formatDate(enrollment.created_at)}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-8 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
                                                    <GraduationCap className="mx-auto h-8 w-8 text-amber-500" />
                                                    <p className="mt-3 text-sm font-bold text-amber-800 dark:text-amber-300">
                                                        No enrollment yet
                                                    </p>
                                                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                                                        This student is linked, and a record will show here when enrolled.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-sky-950/50">
                                <GraduationCap className="h-7 w-7" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                                No students connected yet
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                                When a student is linked to your account, their journey and billing will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}