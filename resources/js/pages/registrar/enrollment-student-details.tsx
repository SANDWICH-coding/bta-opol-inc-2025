import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    BadgeCheckIcon,
    CalendarDays,
    Camera,
    ChevronRight,
    CircleAlert,
    Contact,
    GraduationCap,
    Loader2,
    MapPin,
    School,
    Sparkles,
    User,
    Users,
} from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/components/ui/table'
import Cropper from 'react-easy-crop'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as React from 'react'
import { toast, Toaster } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface SchoolYear {
    id: number
    name: string
}

interface YearLevel {
    id: number
    yearLevelName: string
    school_year: SchoolYear
}

interface ClassArm {
    id: number
    classArmName: string
    year_level: YearLevel
}

interface Enrollment {
    id: number
    type: string
    class_arm: ClassArm
}

interface Student {
    id: number
    lrn?: string
    firstName: string
    lastName: string
    middleName?: string
    suffix?: string
    gender: string
    birthDate: string
    profilePhoto: string
    enrollments: Enrollment[]
}

interface Props {
    student: Student
}

export default function EnrollmentStudentDetailsPage({ student }: Props) {
    const enrollment = student.enrollments[0]
    const classArm = enrollment?.class_arm
    const yearLevel = classArm?.year_level
    const schoolYear = yearLevel?.school_year

    /*
    |--------------------------------------------------------------------------
    | Profile Photo
    |--------------------------------------------------------------------------
    */

    const [showCropModal, setShowCropModal] = React.useState(false)
    const [imageSrc, setImageSrc] = React.useState<string | null>(null)
    const [crop, setCrop] = React.useState({ x: 0, y: 0 })
    const [zoom, setZoom] = React.useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] =
        React.useState<{
            x: number
            y: number
            width: number
            height: number
        } | null>(null)

    const [photoLoading, setPhotoLoading] = React.useState(false)

    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const cameraInputRef = React.useRef<HTMLInputElement>(null)

    /*
    |--------------------------------------------------------------------------
    | Birth Date
    |--------------------------------------------------------------------------
    */

    const [showBirthDateModal, setShowBirthDateModal] = React.useState(false)
    const [birthDate, setBirthDate] = React.useState(student.birthDate ?? '')
    const [birthDateLoading, setBirthDateLoading] = React.useState(false)

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const fullName = [
        student.firstName,
        student.middleName,
        student.lastName,
        student.suffix,
    ]
        .filter(Boolean)
        .join(' ')

    const displayName = `${student.lastName}, ${student.firstName}${
        student.middleName ? ` ${student.middleName.charAt(0)}.` : ''
    }${student.suffix ? ` ${student.suffix}` : ''}`

    const initials = `${student.firstName?.charAt(0) ?? ''}${student.lastName?.charAt(0) ?? ''}`.toUpperCase()

    const genderLabel =
        student.gender === 'male'
            ? 'Male'
            : student.gender === 'female'
                ? 'Female'
                : student.gender || 'Not specified'

    const formattedBirthDate = birthDate
        ? new Date(`${birthDate}T00:00:00`).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : null

    /*
    |--------------------------------------------------------------------------
    | Profile Photo Handlers
    |--------------------------------------------------------------------------
    */

    const resetCropper = () => {
        setImageSrc(null)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedAreaPixels(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        if (cameraInputRef.current) {
            cameraInputRef.current.value = ''
        }
    }

    const openPhotoModal = () => {
        resetCropper()
        setShowCropModal(true)
    }

    const closePhotoModal = () => {
        if (photoLoading) return

        resetCropper()
        setShowCropModal(false)
    }

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]

        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Please choose an image smaller than 5MB.')
            return
        }

        const reader = new FileReader()

        reader.onload = () => {
            setImageSrc(reader.result as string)
            setCrop({ x: 0, y: 0 })
            setZoom(1)
        }

        reader.onerror = () => {
            toast.error('Unable to read the selected image.')
        }

        reader.readAsDataURL(file)
    }

    const getCroppedImg = async (
        source: string,
        area: {
            x: number
            y: number
            width: number
            height: number
        },
    ): Promise<Blob> => {
        const createImage = (url: string) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image()

                image.onload = () => resolve(image)
                image.onerror = reject
                image.crossOrigin = 'anonymous'
                image.src = url
            })

        const image = await createImage(source)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            throw new Error('Unable to create image canvas.')
        }

        canvas.width = area.width
        canvas.height = area.height

        ctx.drawImage(
            image,
            area.x,
            area.y,
            area.width,
            area.height,
            0,
            0,
            area.width,
            area.height,
        )

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob)
                    } else {
                        reject(new Error('Unable to create cropped image.'))
                    }
                },
                'image/jpeg',
                0.92,
            )
        })
    }

    const handleSavePhoto = async () => {
        if (!imageSrc || !croppedAreaPixels) {
            toast.warning('Please select and crop a photo first.')
            return
        }

        setPhotoLoading(true)

        try {
            const croppedBlob = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
            )

            const file = new File(
                [croppedBlob],
                'profile.jpg',
                {
                    type: 'image/jpeg',
                },
            )

            const formData = new FormData()

            formData.append('photo', file)
            formData.append('_method', 'POST')

            router.post(
                `/registrar/enrollment/student/${student.id}/update-profile-photo`,
                formData,
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        toast.success(
                            'Profile photo updated! 🎉',
                        )

                        setShowCropModal(false)
                        resetCropper()
                    },

                    onError: (errors) => {
                        console.error(errors)

                        toast.error(
                            'We could not update the profile photo. Please try again.',
                        )
                    },

                    onFinish: () => {
                        setPhotoLoading(false)
                    },
                },
            )
        } catch (error) {
            console.error(error)

            toast.error(
                'Something went wrong while preparing the photo.',
            )

            setPhotoLoading(false)
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Birth Date
    |--------------------------------------------------------------------------
    */

    const openBirthDateModal = () => {
        setBirthDate(student.birthDate ?? '')
        setShowBirthDateModal(true)
    }

    const handleBirthDateSubmit = () => {
        if (!birthDate) {
            toast.warning('Please select a birth date.')
            return
        }

        const previousBirthDate = student.birthDate

        /*
         * Optimistic UI:
         * Update the local displayed value immediately.
         */
        setBirthDateLoading(true)

        router.post(
            `/registrar/enrollment/student/${student.id}/update-birth-date`,
            {
                birthDate,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowBirthDateModal(false)

                    toast.success(
                        'Birth date updated successfully! 🎉',
                    )
                },

                onError: (errors) => {
                    console.error(errors)

                    /*
                     * Roll back the optimistic state.
                     */
                    setBirthDate(previousBirthDate ?? '')

                    toast.error(
                        'We could not update the birth date. Please try again.',
                    )
                },

                onFinish: () => {
                    setBirthDateLoading(false)
                },
            },
        )
    }

    /*
    |--------------------------------------------------------------------------
    | Information Rows
    |--------------------------------------------------------------------------
    */

    const informationRows = [
        {
            label: 'LRN',
            value: student.lrn || '-',
            icon: BadgeCheckIcon,
            clickable: false,
        },
        {
            label: 'Name',
            value: displayName,
            icon: User,
            clickable: false,
        },
        {
            label: 'Gender',
            value: genderLabel,
            icon: Users,
            clickable: false,
        },
        {
            label: 'Birth Date',
            value: formattedBirthDate || 'Add birth date',
            icon: CalendarDays,
            clickable: true,
            onClick: openBirthDateModal,
            warning: !birthDate,
        },
        {
            label: 'Address',
            value: 'Add address',
            icon: MapPin,
            clickable: true,
            onClick: () =>
                toast.info('Address management is coming soon.'),
            muted: true,
        },
    ]

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Enrollment',
                    href: '/registrar/',
                },
                {
                    title: schoolYear?.name || 'School Year',
                    href: schoolYear
                        ? `/registrar/school-year-setup/${schoolYear.id}`
                        : '#',
                },
                {
                    title:
                        classArm?.classArmName || 'Class Arm',
                    href: classArm
                        ? `/registrar/enrollment/class-arm-setup/${classArm.id}`
                        : '#',
                },
                {
                    title: student.lastName,
                    href: '#',
                },
            ]}
        >
            <Head title={`${student.lastName}, ${student.firstName}`} />

            <Toaster
                richColors
                position="top-center"
            />

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* =========================================================
                    Student Hero
                ========================================================== */}

                <Card className="overflow-hidden border-0 shadow-lg">
                    <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-700 px-6 py-8 sm:px-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%)]" />

                        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            {/* Avatar */}

                            <button
                                type="button"
                                onClick={openPhotoModal}
                                className="group relative shrink-0 rounded-full focus:outline-none focus:ring-4 focus:ring-white/30"
                                title="Change profile photo"
                            >
                                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white/80 bg-white/20 p-1 shadow-2xl">
                                    {student.profilePhoto ? (
                                        <img
                                            src={`/storage/${student.profilePhoto}`}
                                            alt={`${fullName} profile`}
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white backdrop-blur-sm">
                                            {initials}
                                        </div>
                                    )}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-7 w-7 text-white" />
                                </div>

                                <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-indigo-600 shadow-lg">
                                    <Camera className="h-4 w-4" />
                                </span>
                            </button>

                            {/* Student information */}

                            <div className="flex-1 text-center sm:text-left text-white min-w-0">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-3">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                    Student Profile
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words">
                                    {displayName}
                                </h1>

                                <p className="mt-1 text-sm text-indigo-100">
                                    LRN:{' '}
                                    <span className="font-semibold text-white">
                                        {student.lrn || '-'}
                                    </span>
                                </p>

                                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                                    <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/20">
                                        <User className="mr-1.5 h-3.5 w-3.5" />
                                        {genderLabel}
                                    </Badge>

                                    {yearLevel && (
                                        <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/20">
                                            <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                                            {yearLevel.yearLevelName}
                                        </Badge>
                                    )}

                                    {classArm && (
                                        <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/20">
                                            <School className="mr-1.5 h-3.5 w-3.5" />
                                            {classArm.classArmName}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic context */}

                    <CardContent className="p-5 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-2xl border bg-muted/30 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    School Year
                                </p>
                                <p className="mt-1 font-semibold text-foreground">
                                    {schoolYear?.name || '—'}
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-muted/30 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Year Level
                                </p>
                                <p className="mt-1 font-semibold text-foreground">
                                    {yearLevel?.yearLevelName || '—'}
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-muted/30 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Class Arm
                                </p>
                                <p className="mt-1 font-semibold text-foreground">
                                    {classArm?.classArmName || '—'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* =========================================================
                    Student Information
                ========================================================== */}

                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>

                            <div>
                                <p className="text-base font-bold">
                                    Student Information
                                </p>
                                <p className="text-xs font-normal text-muted-foreground">
                                    Personal information and basic details
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableBody>
                                {informationRows.map(
                                    (item) => {
                                        const Icon = item.icon

                                        return (
                                            <TableRow
                                                key={item.label}
                                                onClick={
                                                    item.clickable
                                                        ? item.onClick
                                                        : undefined
                                                }
                                                className={
                                                    item.clickable
                                                        ? 'group cursor-pointer hover:bg-muted/40 transition-colors'
                                                        : ''
                                                }
                                            >
                                                <TableCell className="w-14 sm:w-16 pl-5 sm:pl-6">
                                                    <div
                                                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                                            item.warning
                                                                ? 'bg-red-100 dark:bg-red-900/30'
                                                                : 'bg-muted'
                                                        }`}
                                                    >
                                                        <Icon
                                                            className={`h-4 w-4 ${
                                                                item.warning
                                                                    ? 'text-red-500'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                    </div>
                                                </TableCell>

                                                <TableCell className="w-32 sm:w-40">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {item.label}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span
                                                            className={`text-sm sm:text-base ${
                                                                item.warning
                                                                    ? 'font-semibold text-red-500'
                                                                    : item.muted
                                                                        ? 'text-muted-foreground'
                                                                        : 'font-medium text-foreground'
                                                            }`}
                                                        >
                                                            {item.value}
                                                        </span>

                                                        {item.clickable && (
                                                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    },
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* =========================================================
                    Contact Information
                ========================================================== */}

                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="flex flex-wrap items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                                <Contact className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>

                            <span>Contact Information</span>

                            <Badge
                                variant="secondary"
                                className="ml-1 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                            >
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                Coming soon
                            </Badge>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center">
                            <Contact className="mx-auto h-8 w-8 text-muted-foreground/50" />

                            <p className="mt-3 text-sm font-medium text-muted-foreground">
                                Contact details will be available here soon.
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground/70">
                                Phone numbers, email addresses, and emergency contacts.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* =========================================================
                    Enrollment Details
                ========================================================== */}

                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="flex flex-wrap items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                                <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>

                            <span>Enrollment Details</span>

                            <Badge
                                variant="secondary"
                                className="ml-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            >
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                Coming soon
                            </Badge>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border bg-muted/20 p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Enrollment Type
                                </p>
                                <p className="mt-1 font-semibold capitalize">
                                    {enrollment?.type || '—'}
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-muted/20 p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Current Class
                                </p>
                                <p className="mt-1 font-semibold">
                                    {classArm?.classArmName || '—'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* =============================================================
                Profile Photo Dialog
            ============================================================== */}

            <Dialog
                open={showCropModal}
                onOpenChange={(open) => {
                    if (!open) {
                        closePhotoModal()
                    } else {
                        setShowCropModal(true)
                    }
                }}
            >
                <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 overflow-hidden">
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                                <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>

                            Update Profile Photo
                        </DialogTitle>

                        <DialogDescription>
                            Upload a clear photo and adjust the crop before saving.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 pb-6">
                        {imageSrc ? (
                            <div className="space-y-5">
                                {/* Crop area */}

                                <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-black">
                                    <Cropper
                                        image={imageSrc}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        cropShape="round"
                                        showGrid={false}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={(
                                            _,
                                            croppedArea,
                                        ) =>
                                            setCroppedAreaPixels(
                                                croppedArea,
                                            )
                                        }
                                    />
                                </div>

                                {/* Zoom */}

                                <div className="rounded-2xl border bg-muted/20 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold">
                                            Zoom
                                        </label>

                                        <span className="text-xs text-muted-foreground">
                                            {zoom.toFixed(1)}x
                                        </span>
                                    </div>

                                    <Slider
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={[zoom]}
                                        onValueChange={(value) =>
                                            setZoom(
                                                value[0] ?? 1,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={photoLoading}
                                        onClick={() =>
                                            resetCropper()
                                        }
                                    >
                                        Choose Another
                                    </Button>

                                    <Button
                                        type="button"
                                        disabled={photoLoading}
                                        onClick={
                                            handleSavePhoto
                                        }
                                        className="min-w-28"
                                    >
                                        {photoLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="mr-2 h-4 w-4" />
                                                Save Photo
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40">
                                        <Camera className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                    </div>

                                    <h3 className="mt-4 font-semibold">
                                        Choose a profile photo
                                    </h3>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Use a photo from your device or take a new one.
                                    </p>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        JPG, PNG, or other image • Maximum 5MB
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 rounded-xl"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        Upload Photo
                                    </Button>

                                    <Button
                                        type="button"
                                        className="h-12 rounded-xl"
                                        onClick={() =>
                                            cameraInputRef.current?.click()
                                        }
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        Take Photo
                                    </Button>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <DialogFooter className="pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full sm:w-auto"
                                        onClick={closePhotoModal}
                                    >
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* =============================================================
                Birth Date Dialog
            ============================================================== */}

            <Dialog
                open={showBirthDateModal}
                onOpenChange={(open) => {
                    if (!birthDateLoading) {
                        setShowBirthDateModal(open)
                    }
                }}
            >
                <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                                <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>

                            Update Birth Date
                        </DialogTitle>

                        <DialogDescription>
                            Enter the student's correct date of birth.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3 space-y-3">
                        <label
                            htmlFor="birthDate"
                            className="text-sm font-medium"
                        >
                            Date of Birth
                        </label>

                        <Input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) =>
                                setBirthDate(
                                    e.target.value,
                                )
                            }
                            disabled={birthDateLoading}
                            className="h-11 rounded-xl"
                        />

                        {birthDate && (
                            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-3">
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Selected date
                                </p>

                                <p className="mt-0.5 text-sm font-semibold text-blue-900 dark:text-blue-100">
                                    {new Date(
                                        `${birthDate}T00:00:00`,
                                    ).toLocaleDateString(
                                        'en-US',
                                        {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        },
                                    )}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={birthDateLoading}
                            onClick={() =>
                                setShowBirthDateModal(false)
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            disabled={
                                !birthDate ||
                                birthDateLoading
                            }
                            onClick={
                                handleBirthDateSubmit
                            }
                            className="min-w-28"
                        >
                            {birthDateLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <BadgeCheckIcon className="mr-2 h-4 w-4" />
                                    Update
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
