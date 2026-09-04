import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast, Toaster } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { StudentDataTable } from '@/components/tables/student-data-table'
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    CornerDownRight,
    GraduationCap,
    Loader2,
    Mars,
    Presentation,
    School,
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
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer'
import { useMediaQuery } from '@/hooks/use-media-query'

interface Student {
    id: number
    lrn: string
    firstName: string
    lastName: string
    middleName?: string
    suffix?: string
    gender: 'male' | 'female'
}

interface ClassArm {
    id: number
    classArmName: string
}

interface SchoolYear {
    id: number
    name: string
}

interface YearLevel {
    id: number
    yearLevelName: string
}

interface BillingDiscount {
    id: number
    amount: number
    value: 'fixed' | 'percentage'
    category: {
        id: number
        name: string
    }
}

interface ClassListPageProps {
    classArm: ClassArm
    students: Student[]
    schoolYear: SchoolYear
    yearLevel: YearLevel
    billingDiscounts: BillingDiscount[]
}

interface EnrollmentFormProps {
    formData: {
        class_arm_id: number
        type: string
        lrn: string
        lastName: string
        firstName: string
        middleName: string
        suffix: string
        gender: string
    }
    isSubmitting: boolean
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onTypeChange: (value: string) => void
    onSuffixChange: (value: string) => void
    onGenderChange: (value: string) => void
}

function EnrollmentForm({
    formData,
    isSubmitting,
    onSubmit,
    onCancel,
    onInputChange,
    onTypeChange,
    onSuffixChange,
    onGenderChange,
}: EnrollmentFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Intro */}
            <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50 p-4 dark:border-sky-900/40 dark:from-sky-950/30 dark:to-indigo-950/30">
                <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                        <UserPlus className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            Add a student
                        </p>

                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            Enter the student&apos;s information below. Required fields are
                            marked automatically by the form.
                        </p>
                    </div>
                </div>
            </div>

            {/* Enrollment Information */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-sky-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Enrollment Information
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Enrollment Type */}
                    <div className="space-y-1.5">
                        <Label htmlFor="enrollmentType">
                            Enrollment Type
                        </Label>

                        <Select
                            value={formData.type}
                            onValueChange={onTypeChange}
                        >
                            <SelectTrigger
                                id="enrollmentType"
                                className="h-11 rounded-xl"
                            >
                                <SelectValue placeholder="Select enrollment type" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="new">
                                    New
                                </SelectItem>

                                <SelectItem value="transferee">
                                    Transferee
                                </SelectItem>

                                <SelectItem value="old/continuing">
                                    Old / Continuing
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* LRN */}
                    <div className="space-y-1.5">
                        <Label htmlFor="enrollmentLRN">
                            Learner Reference Number
                            <span className="ml-1 text-xs font-normal text-slate-400">
                                (LRN)
                            </span>
                        </Label>

                        <Input
                            id="enrollmentLRN"
                            name="lrn"
                            value={formData.lrn}
                            onChange={onInputChange}
                            placeholder="Enter LRN"
                            className="h-11 rounded-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Student Information */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Student Information
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Last Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="enrollmentLastName">
                            Last Name
                        </Label>

                        <Input
                            id="enrollmentLastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={onInputChange}
                            placeholder="e.g. Dela Cruz"
                            required
                            autoFocus
                            className="h-11 rounded-xl"
                        />
                    </div>

                    {/* First Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="enrollmentFirstName">
                            First Name
                        </Label>

                        <Input
                            id="enrollmentFirstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={onInputChange}
                            placeholder="e.g. Juan"
                            required
                            className="h-11 rounded-xl"
                        />
                    </div>

                    {/* Middle Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="enrollmentMiddleName">
                            Middle Name
                            <span className="ml-1 text-xs font-normal text-slate-400">
                                (Optional)
                            </span>
                        </Label>

                        <Input
                            id="enrollmentMiddleName"
                            name="middleName"
                            value={formData.middleName}
                            onChange={onInputChange}
                            placeholder="e.g. Santos"
                            className="h-11 rounded-xl"
                        />
                    </div>

                    {/* Suffix */}
                    <div className="space-y-1.5">
                        <Label htmlFor="enrollmentSuffixName">
                            Suffix
                            <span className="ml-1 text-xs font-normal text-slate-400">
                                (Optional)
                            </span>
                        </Label>

                        <Select
                            value={formData.suffix || 'none'}
                            onValueChange={onSuffixChange}
                        >
                            <SelectTrigger
                                id="enrollmentSuffixName"
                                className="h-11 rounded-xl"
                            >
                                <SelectValue placeholder="Select suffix" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="none">
                                    None
                                </SelectItem>

                                <SelectItem value="Jr.">
                                    Jr.
                                </SelectItem>

                                <SelectItem value="II">
                                    II
                                </SelectItem>

                                <SelectItem value="III">
                                    III
                                </SelectItem>

                                <SelectItem value="IV">
                                    IV
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Gender */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-violet-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Additional Information
                    </h3>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="enrollmentGender">
                        Gender
                    </Label>

                    <Select
                        value={formData.gender}
                        onValueChange={onGenderChange}
                    >
                        <SelectTrigger
                            id="enrollmentGender"
                            className="h-11 rounded-xl"
                        >
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="male">
                                Male
                            </SelectItem>

                            <SelectItem value="female">
                                Female
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="h-11 rounded-xl"
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-sky-600 hover:to-indigo-700"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enrolling...
                        </>
                    ) : (
                        <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Enroll Student
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}

export default function ClassListPage({
    classArm,
    students,
    schoolYear,
    yearLevel,
}: ClassListPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Enrollment',
            href: '/registrar/',
        },
        {
            title: schoolYear.name,
            href: `/registrar/school-year-setup/${schoolYear.id}`,
        },
        {
            title: classArm.classArmName,
            href: '#',
        },
    ]

    const totalStudents = students.length

    const maleCount = students.filter(
        (student) => student.gender === 'male',
    ).length

    const femaleCount = students.filter(
        (student) => student.gender === 'female',
    ).length

    const isDesktop = useMediaQuery('(min-width: 768px)')

    const [showModalEnrollForm, setShowModalEnrollForm] = useState(false)

    const [isSubmittingEnrollment, setIsSubmittingEnrollment] =
        useState(false)

    const [formDataEnroll, setFormDataEnroll] = useState({
        class_arm_id: classArm.id,
        type: '',
        lrn: '',
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
        gender: '',
    })

    const handleEnrollment = () => {
        setFormDataEnroll({
            class_arm_id: classArm.id,
            type: '',
            lrn: '',
            lastName: '',
            firstName: '',
            middleName: '',
            suffix: '',
            gender: '',
        })

        setShowModalEnrollForm(true)
    }

    const handleSubmitEnrollment = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formDataEnroll.type) {
            toast.error('Please select an enrollment type.')
            return
        }

        if (!formDataEnroll.gender) {
            toast.error('Please select the student gender.')
            return
        }

        setIsSubmittingEnrollment(true)

        router.post(
            '/registrar/enrollment/enroll-student',
            formDataEnroll,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowModalEnrollForm(false)
                    setIsSubmittingEnrollment(false)

                    toast.success('Student enrolled successfully! 🎉', {
                        description: `${formDataEnroll.firstName} ${formDataEnroll.lastName} has been added to ${classArm.classArmName}.`,
                    })

                    router.reload({
                        only: ['students'],
                    })
                },

                onError: (errors) => {
                    setIsSubmittingEnrollment(false)

                    const firstError = Object.values(errors)[0]

                    toast.error(
                        typeof firstError === 'string'
                            ? firstError
                            : 'Unable to enroll student. Please check the form and try again.',
                    )
                },

                onFinish: () => {
                    setIsSubmittingEnrollment(false)
                },
            },
        )
    }

    const handleInputChangeEnrollment = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const { name, value } = e.target

        setFormDataEnroll((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleTypeChange = (value: string) => {
        setFormDataEnroll((prev) => ({
            ...prev,
            type: value,
        }))
    }

    const handleSuffixChange = (value: string) => {
        setFormDataEnroll((prev) => ({
            ...prev,
            suffix: value === 'none' ? '' : value,
        }))
    }

    const handleGenderChange = (value: string) => {
        setFormDataEnroll((prev) => ({
            ...prev,
            gender: value,
        }))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${classArm.classArmName} • ${schoolYear.name}`} />

            <Toaster
                richColors
                position="top-center"
                closeButton
            />

            <div className="w-full bg-slate-50/50 dark:bg-slate-950">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

                    {/* Hero */}
                    <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-500/10 sm:p-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%)]" />

                        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />

                        <div className="relative">
                            {/* Breadcrumb-style context */}
                            <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-sky-100">
                                <div className="flex items-center gap-1.5">
                                    <School className="h-4 w-4" />
                                    <span>{schoolYear.name}</span>
                                </div>

                                <ChevronRight className="h-4 w-4 text-white/50" />

                                <div className="flex items-center gap-1.5">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>{yearLevel.yearLevelName}</span>
                                </div>

                                <ChevronRight className="h-4 w-4 text-white/50" />

                                <div className="flex items-center gap-1.5 font-semibold text-white">
                                    <Presentation className="h-4 w-4" />
                                    <span>{classArm.classArmName}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-2xl">
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm">
                                        <Sparkles className="h-4 w-4 text-amber-300" />
                                        Enrollment Class
                                    </div>

                                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                        {classArm.classArmName}
                                    </h1>

                                    <p className="mt-3 text-base leading-relaxed text-sky-100 sm:text-lg">
                                        Manage students and keep this class ready for a
                                        successful school year. 🎓
                                    </p>
                                </div>

                                {/* Main CTA */}
                                <Button
                                    onClick={handleEnrollment}
                                    size="lg"
                                    className="h-12 w-full rounded-xl bg-white px-6 font-bold text-indigo-700 shadow-lg transition-all hover:scale-[1.02] hover:bg-sky-50 sm:w-auto"
                                >
                                    <UserPlus className="mr-2 h-5 w-5" />
                                    Enroll Student
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {/* Total */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Total Students
                                    </p>

                                    <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {totalStudents}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Class roster
                            </div>
                        </div>

                        {/* Male */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Male
                                    </p>

                                    <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {maleCount}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                    <Mars className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                                {totalStudents > 0
                                    ? `${Math.round((maleCount / totalStudents) * 100)}% of class`
                                    : 'No students yet'}
                            </div>
                        </div>

                        {/* Female */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Female
                                    </p>

                                    <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {femaleCount}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400">
                                    <Venus className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                                {totalStudents > 0
                                    ? `${Math.round((femaleCount / totalStudents) * 100)}% of class`
                                    : 'No students yet'}
                            </div>
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        

                        <div className="p-4 sm:p-6">
                            {students.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-800/30">
                                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-950/60 dark:to-indigo-950/60">
                                        <Users className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Your class is ready for its first student! 🎉
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        Start building your class roster by enrolling the
                                        first student. It only takes a moment.
                                    </p>

                                    <Button
                                        onClick={handleEnrollment}
                                        className="mt-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-sky-600 hover:to-indigo-700"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Enroll First Student
                                    </Button>
                                </div>
                            ) : (
                                <StudentDataTable students={students} />
                            )}
                        </div>
                    </div>

                    {/* Helpful Footer */}
                    <div className="mt-5 flex items-start gap-3 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 px-4 py-3.5 dark:from-sky-950/20 dark:to-indigo-950/20">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />

                        <p className="text-xs leading-relaxed text-indigo-700 dark:text-indigo-300">
                            <span className="font-semibold">
                                Keep going!
                            </span>{' '}
                            Add students to build your class roster and get your
                            section ready for enrollment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Enrollment Dialog / Drawer */}
            {isDesktop ? (
                <Dialog
                    open={showModalEnrollForm}
                    onOpenChange={(open) => {
                        if (!isSubmittingEnrollment) {
                            setShowModalEnrollForm(open)
                        }
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/50">
                                    <UserPlus className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                </div>

                                Enroll New Student
                            </DialogTitle>

                            <DialogDescription>
                                Add a student to{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {classArm.classArmName}
                                </span>
                                .
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-2">
                            <EnrollmentForm
                                formData={formDataEnroll}
                                isSubmitting={isSubmittingEnrollment}
                                onSubmit={handleSubmitEnrollment}
                                onCancel={() => setShowModalEnrollForm(false)}
                                onInputChange={handleInputChangeEnrollment}
                                onTypeChange={handleTypeChange}
                                onSuffixChange={handleSuffixChange}
                                onGenderChange={handleGenderChange}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            ) : (
                <Drawer
                    open={showModalEnrollForm}
                    onOpenChange={(open) => {
                        if (!isSubmittingEnrollment) {
                            setShowModalEnrollForm(open)
                        }
                    }}
                >
                    <DrawerContent className="max-h-[95vh]">
                        <DrawerHeader className="border-b border-slate-100 text-left dark:border-slate-800">
                            <DrawerTitle className="flex items-center gap-2 text-xl">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/50">
                                    <UserPlus className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                </div>

                                Enroll New Student
                            </DrawerTitle>

                            <DrawerDescription>
                                Add a student to {classArm.classArmName}.
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-5">
                            <EnrollmentForm
                                formData={formDataEnroll}
                                isSubmitting={isSubmittingEnrollment}
                                onSubmit={handleSubmitEnrollment}
                                onCancel={() => setShowModalEnrollForm(false)}
                                onInputChange={handleInputChangeEnrollment}
                                onTypeChange={handleTypeChange}
                                onSuffixChange={handleSuffixChange}
                                onGenderChange={handleGenderChange}
                            />
                        </div>
                    </DrawerContent>
                </Drawer>
            )}
        </AppLayout>
    )
}
