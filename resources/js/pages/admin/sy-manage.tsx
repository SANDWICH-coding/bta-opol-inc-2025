import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-dropdown-menu';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ClassArm {
    id: number;
    classArmName: string;
}

interface Billing {
    id: number;
    billing_cat_id: number;
    description: string;
    amount: number;
    category: {
        id: number;
        name: string;
    };
}

interface BillingCategory {
    id: number;
    name: string;
}

interface BillingDiscount {
    id: number;
    billing_cat_id: number;
    category: BillingCategory;
    description?: string;
    value: 'fixed' | 'percentage';
    amount: number;
}


interface YearLevel {
    id: number;
    yearLevelName: string;
    class_arms: ClassArm[];
    billings: Billing[];
}

interface SchoolYear {
    id: number;
    name: string;
    year_levels: YearLevel[];
    billing_discounts: BillingDiscount[];
}

interface SyManagePageProps {
    schoolYear: SchoolYear;
    billingCategories: BillingCategory[];
}

export default function SyManagePage({ schoolYear, billingCategories }: SyManagePageProps) {

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Year Level
    const [showModal, setShowModal] = useState(false);
    const [isSubmittingYearLevel, setIsSubmittingYearLevel] = useState(false);

    const [formData, setFormData] = useState({
        school_year_id: schoolYear.id,
        yearLevelName: '',
    });

    const handleAddYearLevel = () => {
        setFormData({ school_year_id: schoolYear.id, yearLevelName: '' });
        setShowModal(true);
    };

    const handleSubmitYearLevel = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingYearLevel(true);


        router.post('/admin/year-level', formData, {
            onSuccess: () => {
                setIsSubmittingYearLevel(false);
                setShowModal(false);
                toast.success('Year level created successfully');
                router.reload();
            },
            onError: (errors) => {
                setIsSubmittingYearLevel(false);
                toast.error(errors.yearLevelName || 'Failed to create year level');
            },
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    // Class Arm
    const [showModalClassArm, setShowModalClassArm] = useState(false);
    const [isSubmittingClassArm, setIsSubmittingClassArm] = useState(false);

    const [formDataClassArm, setFormDataClassArm] = useState({
        year_level_id: 0,
        classArmName: '',
    });

    const handleAddClass = (yearLevelId: number) => {
        setFormDataClassArm({ year_level_id: yearLevelId, classArmName: '' });
        setShowModalClassArm(true);
    };

    const handleSubmitClassArm = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingClassArm(true);

        router.post('/admin/class-arm', formDataClassArm, {
            onSuccess: () => {
                setIsSubmittingClassArm(false);
                setShowModalClassArm(false);
                setErrors({});
                toast.success('Class arm created successfully');
                router.reload();
            },
            onError: (err) => {
                setIsSubmittingClassArm(false);
                if (err && typeof err === 'object') {
                    setErrors(err);
                } else {
                    toast.error('Failed to create class arm');
                }
            },
        });
    };

    const handleInputChangeClassArm = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormDataClassArm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Billing
    const [showModalBilling, setShowModalBilling] = useState(false);

    const [formDataBilling, setFormDataBilling] = useState({
        year_level_id: 0,
        category: '',
        description: '',
        amount: 0,
    });

    const handleAddBilling = (yearLevelId: number) => {
        setFormDataBilling({ year_level_id: yearLevelId, category: '', description: '', amount: 0 });
        setShowModalBilling(true);
    };

    const handleSubmitBilling = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/admin/billing', formDataBilling, {
            preserveScroll: true,
            onSuccess: () => {
                setShowModalBilling(false);
                toast.success('Billing created successfully');
            },
            onError: (errors) => {
                toast.error(errors.category || 'Failed to create billing');
            },
        });
    };

    const handleInputChangeBilling = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormDataBilling(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Discount
    const [showModalDiscount, setShowModalDiscount] = useState(false);

    const [formDataDiscount, setFormDataDiscount] = useState({
        school_year_id: schoolYear.id,
        billing_cat_id: 0,
        description: '',
        value: '',
        amount: 0,
    });

    const handleAddDiscount = () => {
        setFormDataDiscount({ school_year_id: schoolYear.id, billing_cat_id: 0, description: '', value: '', amount: 0 });
        setShowModalDiscount(true);
    };

    const handleSubmitDiscount = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/admin/billing-discount', formDataDiscount, {
            preserveScroll: true,
            onSuccess: () => {
                setShowModalDiscount(false);
                toast.success('Discount created successfully');
            },
            onError: (errors) => {
                toast.error(errors.description || 'Failed to create discount');
            },
        });
    };

    const handleInputChangeDiscount = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormDataDiscount(prev => ({
            ...prev,
            [name]: name === 'billing_cat_id' ? parseInt(value) : value,
        }));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'School Year', href: '/admin/school-year' },
            { title: 'Manage School Year', href: '#' }
        ]}>
            <Head title={`${schoolYear.name}`} />
            <Toaster richColors position="top-center" />

            <div className="p-4 space-y-6">
                <h1 className="text-2xl font-bold">{schoolYear.name}</h1>

                <Button onClick={handleAddYearLevel}>
                    Create Year Level
                </Button>

                {schoolYear.year_levels.length === 0 && (
                    <p className="text-gray-500">No year levels found for this school year.</p>
                )}

                {schoolYear.year_levels.map((level) => (
                    <Card key={level.id}>
                        <CardHeader>
                            <CardTitle>{level.yearLevelName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <h2 className="text-sm font-semibold mb-2">Class Arms</h2>
                                {level.class_arms.length === 0 ? (
                                    <p className="text-sm text-gray-500">No class arms added.</p>
                                ) : (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {level.class_arms.map((arm) => (
                                            <li key={arm.id} className="text-sm text-gray-700">
                                                {arm.classArmName}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => handleAddClass(level.id)}
                                >
                                    Add Class
                                </Button>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-sm font-semibold mb-2">Billing Items</h2>
                                {level.billings.length === 0 ? (
                                    <p className="text-sm text-gray-500">No billings added.</p>
                                ) : (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {level.billings.map((billing) => (
                                            <li key={billing.id} className="text-sm text-gray-700">
                                                {billing.category?.name}: ₱{billing.amount}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => handleAddBilling(level.id)}
                                >
                                    Add Billing
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8">
                <h2 className="text-sm font-semibold mb-2">Billing Discounts</h2>

                {schoolYear.billing_discounts.length === 0 ? (
                    <p className="text-sm text-gray-500">No billing discounts added for this school year.</p>
                ) : (
                    <ul className="list-disc pl-5 space-y-1">
                        {schoolYear.billing_discounts.map((disc) => (
                            <li key={disc.id} className="text-sm text-gray-700">
                                {disc.category?.name}: ₱{disc.amount}
                            </li>
                        ))}
                    </ul>
                )}
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleAddDiscount()}
                >
                    Add Discount
                </Button>
            </div>

            <div>
                {/* Year Level Modal */}
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Year Level</DialogTitle>
                            <DialogDescription>
                                Create a new year level.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitYearLevel} className="space-y-4">
                            <div className="space-y-2">
                                <Input id="yearLevelName"
                                    name="yearLevelName"
                                    value={formData.yearLevelName}
                                    onChange={handleInputChange}
                                    placeholder='e.g. Grade 1'
                                    required />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmittingYearLevel}>
                                    {isSubmittingYearLevel ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                                        </>
                                    ) : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Class Arm Modal */}
                <Dialog open={showModalClassArm} onOpenChange={setShowModalClassArm}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Class Arm</DialogTitle>
                            <DialogDescription>
                                Add a new class arm.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitClassArm} className="space-y-4">
                            <div className="space-y-2">
                                <Input id="classArmName"
                                    name="classArmName"
                                    value={formDataClassArm.classArmName}
                                    onChange={handleInputChangeClassArm}
                                    placeholder='e.g. Section A'
                                    className={errors.classArmName ? 'border-red-500' : ''} />
                                {errors.classArmName && (
                                    <p className="text-sm text-red-500">{errors.classArmName}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowModalClassArm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmittingClassArm}>
                                    {isSubmittingClassArm ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                        </>
                                    ) : 'Add'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Billing Modal */}
                <Dialog open={showModalBilling} onOpenChange={setShowModalBilling}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Billing</DialogTitle>
                            <DialogDescription>
                                Create a new billing.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitBilling} className="space-y-4">
                            <div className="space-y-2">
                                <Label id="billingCategory" className="block text-sm font-medium text-gray-700">
                                    Category
                                </Label>
                                <Input id="billingCategory"
                                    name="category"
                                    value={formDataBilling.category}
                                    onChange={handleInputChangeBilling}
                                    placeholder='e.g. Tuition Fee'
                                    required />
                            </div>
                            <div className="space-y-2">
                                <Label id="billingDescription" className="block text-sm font-medium text-gray-700">
                                    Description
                                </Label>
                                <Input id="billingDescription"
                                    name="description"
                                    value={formDataBilling.description}
                                    onChange={handleInputChangeBilling}
                                    placeholder='e.g. Monthly Fee'
                                    required />
                            </div>
                            <div className="space-y-2">
                                <Label id="billingAmount" className="block text-sm font-medium text-gray-700">
                                    Amount
                                </Label>
                                <Input id="billingAmount"
                                    name="amount"
                                    value={formDataBilling.amount}
                                    onChange={handleInputChangeBilling}
                                    placeholder='e.g. Monthly Fee'
                                    required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowModalBilling(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Create
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Discount Modal */}
                <Dialog open={showModalDiscount} onOpenChange={setShowModalDiscount}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Discount</DialogTitle>
                            <DialogDescription>
                                Create a new discount.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitDiscount} className="space-y-4">
                            <div className="space-y-2">
                                <Label id="billingCategory" className="block text-sm font-medium text-gray-700">
                                    Category
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormDataDiscount((prev) => ({
                                            ...prev,
                                            billing_cat_id: Number(value),
                                        }))
                                    }
                                    value={formDataDiscount.billing_cat_id > 0 ? formDataDiscount.billing_cat_id.toString() : undefined}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select category to apply" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {billingCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label id="billingDescription" className="block text-sm font-medium text-gray-700">
                                    Description
                                </Label>
                                <Input id="billingDescription"
                                    name="description"
                                    value={formDataDiscount.description}
                                    onChange={handleInputChangeDiscount}
                                    required />
                            </div>
                            <div className="space-y-2">
                                <Label id="billingValue" className="block text-sm font-medium text-gray-700">
                                    Value
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormDataDiscount(prev => ({
                                            ...prev,
                                            value: value as 'fixed' | 'percentage',
                                        }))
                                    }
                                    value={formDataDiscount.value || undefined}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select discount type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="fixed">Fixed</SelectItem>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label id="billingAmount" className="block text-sm font-medium text-gray-700">
                                    Amount
                                </Label>
                                <Input id="billingAmount"
                                    name="amount"
                                    value={formDataDiscount.amount}
                                    onChange={handleInputChangeDiscount}
                                    required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowModalDiscount(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Create
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
