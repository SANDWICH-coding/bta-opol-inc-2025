import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeCheckIcon, ChevronRight, CircleAlert, Loader } from 'lucide-react'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as React from "react"
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

    const [showCropModal, setShowCropModal] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const cameraInputRef = React.useRef<HTMLInputElement>(null)
    const [imageSrc, setImageSrc] = React.useState<string | null>(null)
    const [crop, setCrop] = React.useState({ x: 0, y: 0 })
    const [zoom, setZoom] = React.useState(1)

    const [activeField, setActiveField] = React.useState<string | null>(null)

    const handleRowClick = (label: string) => {
        setActiveField(label)
    }

    const showBirthDateModal = activeField === "Birth Date"
    const showAddressModal = activeField === "Address"


    const [croppedAreaPixels, setCroppedAreaPixels] = React.useState(null)
    const [loading, setLoading] = React.useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => setImageSrc(reader.result as string)
        reader.readAsDataURL(file)
    }

    const getCroppedImg = async (
        imageSrc: string,
        croppedAreaPixels: { x: number; y: number; width: number; height: number }
    ) => {
        const createImage = (url: string) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image()
                image.addEventListener('load', () => resolve(image))
                image.addEventListener('error', reject)
                image.setAttribute('crossOrigin', 'anonymous')
                image.src = url
            })

        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        canvas.width = croppedAreaPixels.width
        canvas.height = croppedAreaPixels.height

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        )

        return new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob)
            }, 'image/jpeg')
        })
    }

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setLoading(true); // <-- Start loading

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const file = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('photo', file);
            formData.append('_method', 'POST');

            router.post(
                `/registrar/enrollment/student/${student.id}/update-profile-photo`,
                formData,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowCropModal(false);
                        setImageSrc(null);
                        toast.success('Profile photo updated successfully.');
                        router.reload();
                    },
                    onFinish: () => {
                        setLoading(false); // <-- Stop loading no matter what
                    },
                    onError: (errors) => {
                        if (typeof errors === 'string') {
                            toast.error(errors);
                        } else {
                            toast.error('Failed: Try to change other photo.');
                            console.error(errors);
                        }
                    },
                }
            );
        } catch (err) {
            toast.error('Unexpected error occurred.');
            console.error(err);
            setLoading(false); // fallback if error before post
        }
    };

    const [birthDate, setBirthDate] = React.useState<string>("")

    function handleBirthDateSubmit() {
        if (!birthDate) {
            toast.warning("No birth date selected")
            return
        }

        router.post(`/registrar/enrollment/student/${student.id}/update-birth-date`, {
            birthDate: birthDate,
        }, {
            onSuccess: () => {
                setActiveField(null)
                toast.success('Birth date updated successfully.');
                router.reload();
            },
            onError: (errors) => {
                toast.error("Failed to update birthdate", errors)
            }
        })
    }


    return (
        <AppLayout
            breadcrumbs={[
                { title: 'School Year', href: '/registrar/' },
                {
                    title: schoolYear?.name || 'School Year',
                    href: `/registrar/school-year-setup/${schoolYear?.id}`,
                },
                {
                    title: classArm?.classArmName || 'Class Arm',
                    href: `/registrar/enrollment/class-arm-setup/${classArm?.id}`,
                },
                {
                    title: `${student.lastName}`,
                    href: '#',
                },
            ]}
        >
            <Head title={`${student.lastName}, ${student.firstName}`} />
            <Toaster richColors position="top-center" />

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Student Information</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-6">
                            {/* Profile Photo Section */}
                            <div
                                onClick={() => setShowCropModal(true)}
                                className="relative w-full sm:w-64 aspect-square cursor-pointer group shrink-0"
                                title="Update Profile Photo"
                            >
                                <img
                                    src={student.profilePhoto ? `/storage/${student.profilePhoto}` : "/images/avatar-place-holder.png"}
                                    alt="Student Avatar"
                                    className="w-full h-full object-cover rounded-md group-hover:opacity-80 transition"
                                />
                            </div>

                            {/* Info Table Section */}
                            <div className="flex-1 overflow-x-auto">
                                <Table>
                                    <TableBody>
                                        {[
                                            { label: "LRN", value: `${student.lrn ?? '-'}` },
                                            {
                                                label: "Name",
                                                value: `${student.firstName} ${student.middleName ? student.middleName.charAt(0) + '.' : ''} ${student.lastName} ${student.suffix ?? ''}`.trim(),
                                            },
                                            { label: "Gender", value: student.gender },
                                            { label: "Birth Date", value: student.birthDate ?? <CircleAlert className="text-red-300" /> },
                                            { label: "Address", value: "-" },
                                        ].map((item, i) => (
                                            <TableRow
                                                key={i}
                                                onClick={() => handleRowClick(item.label)}
                                                className="hover:bg-muted/40 transition sm:table-row flex flex-col sm:flex-row px-4 py-3 cursor-pointer"
                                            >
                                                <TableCell className="text-gray-700 sm:w-1/3 sm:p-2 lg:p-4">
                                                    {item.label}
                                                </TableCell>
                                                <TableCell className="flex items-center justify-between w-full sm:p-2 lg:p-4">
                                                    <span className="uppercase">{item.value}</span>
                                                    <ChevronRight className="w-4 h-4 text-blue-500 ml-auto" strokeWidth={3} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="w-ful mt-6">
                    <CardHeader>
                        <CardTitle>Contact Information
                            <Badge
                                variant="secondary"
                                className="sm:ml-3 ml-2 bg-blue-500 text-white dark:bg-blue-600"
                            >
                                <Loader />
                                Coming soon.
                            </Badge></CardTitle>
                    </CardHeader>
                </Card>

                <Card className="w-ful mt-6">
                    <CardHeader>
                        <CardTitle>Enrollment Details
                            <Badge
                                variant="secondary"
                                className="sm:ml-3 ml-2 bg-blue-500 text-white dark:bg-blue-600"
                            >
                                <Loader />
                                Coming soon.
                            </Badge></CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
                <DialogContent className="max-w-lg p-6">
                    <DialogHeader>
                        <DialogTitle>Update Profile Photo</DialogTitle>
                    </DialogHeader>

                    {imageSrc ? (
                        <>
                            <div className="relative w-full h-64 bg-muted overflow-hidden rounded-md">
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                                />
                            </div>

                            <div className="pt-4">
                                <label className="block text-sm font-medium text-foreground mb-1">Zoom</label>
                                <Slider min={1} max={3} step={0.1} value={[zoom]} onValueChange={(v) => setZoom(v[0])} />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <button
                                    className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Upload from device
                                </button>
                                <button
                                    className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition"
                                    onClick={() => cameraInputRef.current?.click()}
                                >
                                    Take a photo
                                </button>
                            </div>

                            {/* Hidden Inputs */}
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
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-6">
                        <button
                            className="text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                setImageSrc(null)
                                setShowCropModal(false)
                            }}
                        >
                            Cancel
                        </button>
                        <Button
                            disabled={!imageSrc || loading}
                            className="bg-primary text-white text-sm px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                            onClick={handleSave}
                        >
                            {loading && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                            )}
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {showBirthDateModal && (
                <Dialog open={showBirthDateModal} onOpenChange={() => setActiveField(null)}>
                    <DialogContent className="p-6">
                        <DialogHeader>
                            <DialogTitle>Update Birth Date</DialogTitle>
                        </DialogHeader>

                        <Input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setActiveField(null)}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleBirthDateSubmit}>
                                Update
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            )}

            {showAddressModal && (
                <Dialog open onOpenChange={() => setActiveField(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Address</DialogTitle>
                        </DialogHeader>
                        {/* Your form here */}
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    )
}
