import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarShortcut, MenubarTrigger } from '@/components/ui/menubar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FilePlus, Loader2, Printer, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchBarWithSuggestions from '@/components/ui/searchbar';
import { StudentCard } from './student-details/student-card-name';
import { PaymentTable } from './student-details/payment-table';
import { BillingBreakdownTable } from './student-details/billing-breakdown-table';
import { InstallmentPlanTable } from './student-details/installment-plan-table';

type sameSchoolYearEnrollments = {
    id: number;
    lrn: string;
    firstName: string;
    middleName?: string;
    lastName: string;
};

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    gender: 'male' | 'female';
    birthDate?: string;
    profilePhoto?: string;
    lrn?: string;
}

interface BillingItem {
    id: number;
    description: string;
    amount: string;
    category?: {
        name: string;
    };
    pivot: {
        quantity: number;
        month_installment?: number | null; // Number of months for installment
        start_month?: number | null; // e.g., 1 = January
        end_month?: number | null;   // e.g., 12 = December
    };
}

interface Discount {
    id: number;
    description: string;
    value: 'fixed' | 'percentage';
    amount: string;
    category: {
        name: string;
    };
}

interface Payment {
    id: number;
    or_number: string;
    payment_date: string;
    payment_method: string;
    remarks: string;
    amount: string;
    billing: {
        description: string;
        category?: {
            name: string;
        };
    };

}

interface EnrollmentDetails {
    id: number;
    student: Student;
    class_arm: {
        classArmName: string;
        year_level: {
            yearLevelName: string;
            school_year: {
                name: string;
            };
        };
    };
    billing_items: BillingItem[];
    billing_discounts: Discount[];
    payments: Payment[];
}

interface Props extends PageProps {
    enrollment: EnrollmentDetails;
    availableDiscounts: Discount[];
    availableBillings: BillingItem[];
    sameSchoolYearEnrollments: sameSchoolYearEnrollments[];
}

export default function StudentDetails({ enrollment, availableDiscounts = [], availableBillings = [], sameSchoolYearEnrollments = [] }: Props) {
    const student = enrollment.student;
    const classArm = enrollment.class_arm;
    const yearLevel = classArm?.year_level;

    const [showDiscountModal, setShowDiscountModal] = useState(false)
    const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>(
        enrollment.billing_discounts.map((disc) => disc.id)
    )

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        router.post('/billing/apply-discount', {
            enrollment_id: enrollment.id,
            discount_ids: selectedDiscounts,
        }, {
            onSuccess: () => {
                setIsSubmitting(false)
                setShowDiscountModal(false)
                toast.success('Discounts updated successfully')
            },
            onError: () => {
                setIsSubmitting(false)
                toast.error('Failed to update discounts')
            },
        })
    }

    const handleCheckboxChange = (discountId: number) => {
        setSelectedDiscounts(prev =>
            prev.includes(discountId)
                ? prev.filter(id => id !== discountId)
                : [...prev, discountId]
        )
    }

    const [showBillItemModal, setShowBillItemModal] = useState(false)
    const [billingId, setBillingId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [monthInstallment, setMonthInstallment] = useState<number | null>(null);
    const [startMonth, setStartMonth] = useState<number | null>(null);
    const [endMonth, setEndMonth] = useState<number | null>(null);

    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];

    const handleAddBillItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!billingId) return;

        setIsSubmitting(true);

        router.post('/billing/add-billing-item', {
            enrollment_id: enrollment.id,
            billing_id: billingId,
            quantity,
            month_installment: monthInstallment,
            start_month: startMonth,
            end_month: endMonth,
        }, {
            onSuccess: () => {
                toast.success('Billing item added successfully');
                resetForm(); // ✅ Reset fields
                setShowBillItemModal(false);
                setIsSubmitting(false);
            },
            onError: () => {
                toast.error('Failed to add billing item');
                setIsSubmitting(false);
            },
        });
    };

    const resetForm = () => {
        setBillingId(null);
        setQuantity(1);
        setMonthInstallment(null);
        setStartMonth(null);
        setEndMonth(null);
    };


    function toProperCase(name: string) {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const paymentMethodColors: Record<string, string> = {
        cash: "#6366f1",
        gcash: "#8b5cf6",
        bank_transfer: "#ec4899",
        check: "#14b8a6",
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<sameSchoolYearEnrollments | null>(null);

    const studentSuggestions = sameSchoolYearEnrollments.map(
        (s) => `${s.firstName} ${s.lastName}`
    );

    const handleSelect = (value: string) => {
        setSearchQuery(value);

        const match = sameSchoolYearEnrollments.find(
            (s) => `${s.firstName} ${s.lastName}`.toLowerCase() === value.toLowerCase()
        );

        if (match) {
            setSelectedStudent(match);
            router.get(`/billing/students/${match.id}`);
        } else {
            setSelectedStudent(null);
        }
    };

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [orNumber, setOrNumber] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [selectedPayments, setSelectedPayments] = useState<
        { billing_id: number | null; amount: string; payment_method: string; remarks: string }[]
    >([]);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const totalAmount = selectedPayments.reduce((sum, p) => {
        const num = parseFloat(p.amount);
        return sum + (isNaN(num) ? 0 : num);
    }, 0);


    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Students',
            href: '/billing/students',
        },
        {
            title: `${toProperCase(student.firstName)} ${student.middleName ? `${student.middleName.charAt(0)}.` : ''} ${toProperCase(student.lastName)}`,
            href: '#',
        },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${toProperCase(student.firstName)} ${student.middleName ? `${student.middleName.charAt(0)}.` : ''} ${toProperCase(student.lastName)}`}
            />
            <Toaster richColors position="top-center" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex justify-start mb-4">
                    <SearchBarWithSuggestions
                        suggestions={studentSuggestions}
                        onSelect={handleSelect}
                        placeholder="Search student"
                    />
                </div>

                <StudentCard
                    student={student}
                    yearLevel={yearLevel}
                    toProperCase={toProperCase}
                />
                <Tabs defaultValue="payment">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="payment">Payments</TabsTrigger>
                        <TabsTrigger value="billing">Billings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="billing">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Billing Details
                                </CardTitle>
                                <CardDescription>
                                    A breakdown of this student’s billings with applied discounts.
                                </CardDescription>
                                <CardAction>
                                    <Menubar>
                                        <MenubarMenu>
                                            <MenubarTrigger className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">
                                                Update
                                            </MenubarTrigger>

                                            <MenubarContent>
                                                <MenubarItem onClick={() => setShowBillItemModal(true)}>
                                                    Add bill item <MenubarShortcut><FilePlus /></MenubarShortcut>
                                                </MenubarItem>
                                                <MenubarItem onClick={() => setShowDiscountModal(true)}>
                                                    Modify discounts <MenubarShortcut><Settings2 /></MenubarShortcut>
                                                </MenubarItem>
                                                <MenubarItem asChild>
                                                    <a
                                                        href={route('billing.pdf', enrollment.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Generate Statement <MenubarShortcut><Printer /></MenubarShortcut>
                                                    </a>
                                                </MenubarItem>

                                            </MenubarContent>
                                        </MenubarMenu>
                                    </Menubar>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <BillingBreakdownTable
                                    billingItems={enrollment.billing_items}
                                    discounts={enrollment.billing_discounts}
                                    payments={enrollment.payments}
                                />
                            </CardContent>
                        </Card>

                        <InstallmentPlanTable
                            enrollment={enrollment}
                            months={months}
                            title="Installment Plan"
                            description="Monthly billing installment status with discounts and payments."
                        />
                    </TabsContent>

                    <TabsContent value="payment">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Payment Records
                                </CardTitle>
                                <CardDescription>
                                    Track payment history and transaction details.
                                </CardDescription>
                                <CardAction>
                                    <Button variant="default" onClick={() => setShowPaymentModal(true)}>Add payment</Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <PaymentTable
                                    payments={enrollment.payments}
                                    paymentMethodColors={paymentMethodColors}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={showDiscountModal} onOpenChange={setShowDiscountModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Modify Discounts</DialogTitle>
                        <DialogDescription>
                            Select applicable discounts for this student.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {availableDiscounts.map((disc) => (
                                <Label
                                    key={disc.id}
                                    className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                                >
                                    <Checkbox
                                        id={`disc-${disc.id}`}
                                        checked={selectedDiscounts.includes(disc.id)}
                                        onCheckedChange={() => handleCheckboxChange(disc.id)}
                                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                                    />
                                    <div className="grid gap-1.5 font-normal w-full">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-medium leading-none">
                                                {disc.category.name}
                                            </p>
                                            <Badge variant="outline" className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums text-xs">
                                                - {disc.value === 'percentage' ? `${disc.amount}%` : `₱${disc.amount}`}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm">{disc.description}</p>
                                    </div>
                                </Label>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowDiscountModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showBillItemModal} onOpenChange={(open) => {
                setShowBillItemModal(open);
                if (!open) resetForm(); // ✅ Reset fields when modal is closed
            }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Bill Item</DialogTitle>
                        <DialogDescription>
                            Select a billing item and quantity.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddBillItem} className="space-y-4">
                        <div className="grid gap-3">
                            <Label htmlFor="bill-item">Item</Label>
                            <Select
                                value={billingId ? String(billingId) : ""}
                                onValueChange={(value) => setBillingId(Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableBillings.map((bill) => (
                                        <SelectItem key={bill.id} value={String(bill.id)}>
                                            {bill.category?.name} - ₱{parseFloat(bill.amount).toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="month_installment">Installment Months (Optional)</Label>
                            <Input
                                id="month_installment"
                                type="number"
                                min="1"
                                value={monthInstallment ?? ""}
                                onChange={(e) =>
                                    setMonthInstallment(e.target.value ? Number(e.target.value) : null)
                                }
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label>Start Month (Optional)</Label>
                            <Select
                                value={startMonth ? String(startMonth) : ""}
                                onValueChange={(value) => setStartMonth(Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select start month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m) => (
                                        <SelectItem key={m.value} value={String(m.value)}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <Label>End Month (Optional)</Label>
                            <Select
                                value={endMonth ? String(endMonth) : ""}
                                onValueChange={(value) => setEndMonth(Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select end month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m) => (
                                        <SelectItem key={m.value} value={String(m.value)}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowBillItemModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>

                </DialogContent>
            </Dialog>

            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Add Payment</DialogTitle>
                        <DialogDescription>
                            Select billing items and assign payments to each under a single OR.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsSubmittingPayment(true); // ✅ FIXED this line

                            router.post(
                                '/billing/add-payment',
                                {
                                    enrollment_id: enrollment.id,
                                    or_number: orNumber,
                                    payment_date: paymentDate,
                                    items: selectedPayments.filter((p) => p.billing_id !== null),
                                },
                                {
                                    onSuccess: () => {
                                        toast.success('Payments successfully recorded.');
                                        setShowPaymentModal(false);
                                        setSelectedPayments([]);
                                        setIsSubmittingPayment(false); // ✅
                                    },
                                    onError: () => {
                                        toast.error('Failed to record payment.');
                                        setIsSubmittingPayment(false); // ✅
                                    },
                                }
                            );
                        }}
                        className="space-y-4"
                    >

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="or">OR Number</Label>
                                <Input
                                    id="or"
                                    type="text"
                                    value={orNumber}
                                    onChange={(e) => setOrNumber(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="paymentDate">Payment Date</Label>
                                <Input
                                    id="paymentDate"
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>


                        <div className="border rounded-md p-4 space-y-4 bg-muted/50">
                            {selectedPayments.map((payment, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 gap-4 items-end bg-background p-4 rounded-xl shadow-sm border hover:shadow-md transition-all"
                                >
                                    {/* Billing Item Select */}
                                    <div className="col-span-5 grid gap-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Item</Label>
                                        <Select
                                            value={payment.billing_id?.toString() ?? ''}
                                            onValueChange={(val) => {
                                                const billingId = parseInt(val);
                                                setSelectedPayments((prev) =>
                                                    prev.map((p, i) =>
                                                        i === index ? { ...p, billing_id: billingId } : p
                                                    )
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select item" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {enrollment.billing_items.map((item) => (
                                                    <SelectItem key={item.id} value={item.id.toString()}>
                                                        {item.category?.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Amount Input */}
                                    <div className="col-span-3 grid gap-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                                        <Input
                                            type="number"
                                            value={payment.amount}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedPayments((prev) =>
                                                    prev.map((p, i) =>
                                                        i === index ? { ...p, amount: val } : p
                                                    )
                                                );
                                            }}
                                        />
                                    </div>

                                    {/* Method Select */}
                                    <div className="col-span-3 grid gap-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Method</Label>
                                        <Select
                                            value={payment.payment_method}
                                            onValueChange={(val) => {
                                                setSelectedPayments((prev) =>
                                                    prev.map((p, i) =>
                                                        i === index ? { ...p, payment_method: val } : p
                                                    )
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="gcash">GCash</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Remarks Select */}
                                    <div className="col-span-3 grid gap-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Remarks</Label>
                                        <Select
                                            value={payment.remarks}
                                            onValueChange={(val) => {
                                                setSelectedPayments((prev) =>
                                                    prev.map((p, i) =>
                                                        i === index ? { ...p, remarks: val } : p
                                                    )
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Remarks" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="partial_payment">Partial Payment</SelectItem>
                                                <SelectItem value="down_payment">Down Payment</SelectItem>
                                                <SelectItem value="full_payment">Full Payment</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Remove Button */}
                                    <div className="col-span-1 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            onClick={() =>
                                                setSelectedPayments((prev) =>
                                                    prev.filter((_, i) => i !== index)
                                                )
                                            }
                                        >
                                            -
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Bill Item Button */}
                            {/* Add New Bill Item Button + Total Amount */}
                            <div className="pt-2 flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() =>
                                        setSelectedPayments((prev) => [
                                            ...prev,
                                            {
                                                billing_id: null,
                                                amount: '',
                                                payment_method: 'cash',
                                                remarks: 'partial_payment',
                                            },
                                        ])
                                    }
                                >
                                    + Add Bill Item
                                </Button>

                                <div className="text-right font-medium text-muted-foreground">
                                    Total Amount: <span className="text-foreground font-semibold">₱{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isSubmittingPayment ||
                                    selectedPayments.length === 0 ||
                                    selectedPayments.some((p) => !p.billing_id || !p.amount)
                                }
                            >
                                {isSubmittingPayment ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Submit Payment'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
