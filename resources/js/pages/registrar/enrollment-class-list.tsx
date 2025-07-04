import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StudentDataTable } from '@/components/tables/student-data-table'
import { School, CornerDownRight, Mars, Venus, GraduationCap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { useMediaQuery } from '@/hooks/use-media-query';

interface Student {
    id: number;
    lrn: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    suffix?: string;
    gender: 'male' | 'female';
}

interface ClassArm {
    id: number;
    classArmName: string;
}

interface SchoolYear {
    id: number;
    name: string;
}

interface YearLevel {
    id: number;
    yearLevelName: string;
}

interface BillingDiscount {
    id: number;
    amount: number;
    value: 'fixed' | 'percentage';
    category: {
        id: number;
        name: string;
    };
}

interface ClassListPageProps {
    classArm: ClassArm;
    students: Student[];
    schoolYear: SchoolYear;
    yearLevel: YearLevel;
    billingDiscounts: BillingDiscount[];
}


export default function ClassListPage({ classArm, students, schoolYear, yearLevel, billingDiscounts }: ClassListPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Enrollment', href: '/registrar/' },
        { title: schoolYear.name, href: `/registrar/school-year-setup/${schoolYear.id}` },
        { title: classArm.classArmName, href: '#' },
    ];

    const totalStudents = students.length;
    const maleCount = students.filter(student => student.gender === 'male').length;
    const femaleCount = students.filter(student => student.gender === 'female').length;

    const isDesktop = useMediaQuery("(min-width: 768px)");

    const [showModalEnrollForm, setShowModalEnrollForm] = useState(false);

    const [formDataEnroll, setFormDataEnroll] = useState({
        class_arm_id: 0,
        type: '',
        lrn: '',
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
        gender: '',
    });

    const handleEnrollment = (classArmId: number) => {
        setFormDataEnroll({
            class_arm_id: classArmId,
            type: '',
            lrn: '',
            lastName: '',
            firstName: '',
            middleName: '',
            suffix: '',
            gender: '',
        });
        setShowModalEnrollForm(true);
    };

    const handleSubmitEnrollment = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/registrar/enrollment/enroll-student', formDataEnroll, {
            onSuccess: () => {
                setShowModalEnrollForm(false);
                toast.success('Student enrolled successfully');
                router.reload();
            },
            onError: (errors) => {
                toast.error(errors.category || 'Failed to enroll student');
            },
        });
    };

    const handleInputChangeEnrollment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormDataEnroll(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${classArm.classArmName}`} />
            <Toaster richColors position="top-center" />

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-2">{classArm.classArmName}</h1>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <School className="h-4 w-4" />
                                <span>{schoolYear.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CornerDownRight className="h-4 w-4" />
                                <span>{yearLevel.yearLevelName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                <span>{totalStudents}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mars className="h-4 w-4" />
                                <span>{maleCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Venus className="h-4 w-4" />
                                <span>{femaleCount}</span>
                            </div>

                        </div>

                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => handleEnrollment(classArm.id)}
                        >
                            Enroll Student
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <StudentDataTable students={students} />
            </div>

            {isDesktop ? (
                <Dialog open={showModalEnrollForm} onOpenChange={setShowModalEnrollForm}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Enrollment Form</DialogTitle>
                            <DialogDescription>Fill in the form to register new enrollment.</DialogDescription>
                        </DialogHeader>

                        <div className="mt-4">
                            <form onSubmit={handleSubmitEnrollment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Type */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentType">Type</Label>
                                    <Select
                                        value={formDataEnroll.type}
                                        onValueChange={(value) => setFormDataEnroll((prev) => ({ ...prev, type: value }))}
                                        required
                                    >
                                        <SelectTrigger id="enrollmentType">
                                            <SelectValue placeholder="Select enrollment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="transferee">Transferee</SelectItem>
                                            <SelectItem value="old/continuing">Old/Continuing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* LRN */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentLRN">LRN</Label>
                                    <Input
                                        id="enrollmentLRN"
                                        name="lrn"
                                        value={formDataEnroll.lrn}
                                        onChange={handleInputChangeEnrollment}
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentLastName">Last Name</Label>
                                    <Input
                                        id="enrollmentLastName"
                                        name="lastName"
                                        value={formDataEnroll.lastName}
                                        onChange={handleInputChangeEnrollment}
                                        required
                                    />
                                </div>

                                {/* First Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentFirstName">First Name</Label>
                                    <Input
                                        id="enrollmentFirstName"
                                        name="firstName"
                                        value={formDataEnroll.firstName}
                                        onChange={handleInputChangeEnrollment}
                                        required
                                    />
                                </div>

                                {/* Middle Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentMiddleName">Middle Name</Label>
                                    <Input
                                        id="enrollmentMiddleName"
                                        name="middleName"
                                        value={formDataEnroll.middleName}
                                        onChange={handleInputChangeEnrollment}
                                    />
                                </div>

                                {/* Suffix */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentSuffixName">Suffix</Label>
                                    <Select
                                        value={formDataEnroll.suffix || "none"}
                                        onValueChange={(value) =>
                                            setFormDataEnroll((prev) => ({
                                                ...prev,
                                                suffix: value === "none" ? "" : value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger id="enrollmentSuffixName">
                                            <SelectValue placeholder="Select suffix" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="Jr.">Jr.</SelectItem>
                                            <SelectItem value="II">II</SelectItem>
                                            <SelectItem value="III">III</SelectItem>
                                            <SelectItem value="IV">IV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Gender (Full Row) */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="enrollmentGender">Gender</Label>
                                    <Select
                                        value={formDataEnroll.gender}
                                        onValueChange={(value) => setFormDataEnroll((prev) => ({ ...prev, gender: value }))}
                                    >
                                        <SelectTrigger id="enrollmentGender">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                

                                {/* Footer Buttons */}
                                <div className="md:col-span-2 flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setShowModalEnrollForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Enroll</Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            ) : (
                <Drawer open={showModalEnrollForm} onOpenChange={setShowModalEnrollForm}>
                    <DrawerContent className="flex flex-col max-h-[100vh]">
                        <DrawerHeader>
                            <DrawerTitle>Enrollment Form</DrawerTitle>
                            <DrawerDescription>Fill in the form to register new enrollment.</DrawerDescription>
                        </DrawerHeader>

                        <div className="flex-1 overflow-y-auto px-4 pb-6">
                            <form onSubmit={handleSubmitEnrollment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Type */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentType">Type</Label>
                                    <Select
                                        value={formDataEnroll.type}
                                        onValueChange={(value) => setFormDataEnroll((prev) => ({ ...prev, type: value }))}
                                        required
                                    >
                                        <SelectTrigger id="enrollmentType">
                                            <SelectValue placeholder="Select enrollment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="transferee">Transferee</SelectItem>
                                            <SelectItem value="old/continuing">Old/Continuing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* LRN */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentLRN">LRN</Label>
                                    <Input
                                        id="enrollmentLRN"
                                        name="lrn"
                                        value={formDataEnroll.lrn}
                                        onChange={handleInputChangeEnrollment}
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentLastName">Last Name</Label>
                                    <Input
                                        id="enrollmentLastName"
                                        name="lastName"
                                        value={formDataEnroll.lastName}
                                        onChange={handleInputChangeEnrollment}
                                        required
                                    />
                                </div>

                                {/* First Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentFirstName">First Name</Label>
                                    <Input
                                        id="enrollmentFirstName"
                                        name="firstName"
                                        value={formDataEnroll.firstName}
                                        onChange={handleInputChangeEnrollment}
                                        required
                                    />
                                </div>

                                {/* Middle Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentMiddleName">Middle Name</Label>
                                    <Input
                                        id="enrollmentMiddleName"
                                        name="middleName"
                                        value={formDataEnroll.middleName}
                                        onChange={handleInputChangeEnrollment}
                                    />
                                </div>

                                {/* Suffix */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentSuffixName">Suffix</Label>
                                    <Select
                                        value={formDataEnroll.suffix || "none"}
                                        onValueChange={(value) =>
                                            setFormDataEnroll((prev) => ({
                                                ...prev,
                                                suffix: value === "none" ? "" : value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger id="enrollmentSuffixName">
                                            <SelectValue placeholder="Select suffix" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="Jr.">Jr.</SelectItem>
                                            <SelectItem value="II">II</SelectItem>
                                            <SelectItem value="III">III</SelectItem>
                                            <SelectItem value="IV">IV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Gender (Full Row) */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="enrollmentGender">Gender</Label>
                                    <Select
                                        value={formDataEnroll.gender}
                                        onValueChange={(value) => setFormDataEnroll((prev) => ({ ...prev, gender: value }))}
                                    >
                                        <SelectTrigger id="enrollmentGender">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Footer Buttons */}
                                <div className="md:col-span-2 flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setShowModalEnrollForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Enroll</Button>
                                </div>
                            </form>
                        </div>
                    </DrawerContent>
                </Drawer>
            )}

        </AppLayout>
    );
}
