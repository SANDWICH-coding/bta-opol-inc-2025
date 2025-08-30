import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CountUp from 'react-countup';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Expenses', href: '/expenses' },
];

type Expense = {
    id: number;
    school_year_id: number;
    expense_category: string;
    description: string;
    vendor_merchant: string;
    expense_date: string;
    receipt_number: string;
    amount: string;
    remarks: string;
    responsible: string;
    receipt_photo?: string | null;
};

type Pagination<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
};

export default function Expenses() {
    const { expenses, filters, overallTotal, categoryTotals } = usePage().props as {
        expenses: Pagination<Expense>;
        filters: { search?: string };
        overallTotal: number;
        categoryTotals: Record<string, number>;
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get("search") as string;
        router.get("/billing/expenses", { search }, { preserveState: true });
    };

    const [open, setOpen] = useState(false);
    const [expenseCategory, setExpenseCategory] = useState('');
    const [expenseMerchant, setExpenseMerchant] = useState('');
    const [expenseDate, setExpenseDate] = useState('');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [remarks, setRemarks] = useState('');
    const [responsible, setResponsible] = useState('');
    const [receiptPhoto, setReceiptPhoto] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if any of the required fields are missing or invalid
        if (!expenseCategory || !expenseMerchant || !expenseDate || !receiptNumber || !amount || !responsible) {
            toast.error('Please fill out all required fields.');
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('expense_category', expenseCategory);
        formData.append('vendor_merchant', expenseMerchant);
        formData.append('expense_date', expenseDate);
        formData.append('receipt_number', receiptNumber);
        formData.append('amount', amount);
        formData.append('remarks', remarks);
        formData.append('responsible', responsible);

        if (receiptPhoto) {
            formData.append('receipt_photo', receiptPhoto);
        }

        setIsLoading(true);

        router.post('/billing/expenses', formData, {
            onSuccess: () => {
                setOpen(false);
                toast.success('Expense record added successfully');
                setIsLoading(false);
            },
            onError: (errors) => {
                setIsLoading(false);
                toast.error(`Failed to add expense. ${errors?.message || 'Please check the form'}`);
            },
        });
    };

    // Prepare data for the Bar Chart
    const chartData = {
        labels: Object.keys(categoryTotals),  // Expense categories
        datasets: [
            {
                label: 'Totals',
                data: Object.values(categoryTotals),  // Totals for each category
                backgroundColor: 'rgba(209, 62, 155, 0.5)',
                borderColor: 'rgba(140, 26, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,           // Ensures the chart is responsive
        maintainAspectRatio: false, // Allows the chart to scale freely based on container size
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
            },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expenses" />
            <Toaster position="top-center" richColors />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <Card className="bg-muted/40">
                    <CardHeader>
                        <CardTitle>
                            Expenses Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Total Expenses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h1 className="scroll-m-20 text-left text-3xl tracking-tight break-words font-semibold">
                                    ₱
                                    <CountUp
                                        end={overallTotal}
                                        duration={1}
                                        separator=","
                                        decimals={2}
                                    />
                                </h1>
                                <div className="w-full h-64 sm:h-[200px]">
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Total by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                    {Object.entries(categoryTotals).map(([category, total]) => (
                                        <Card key={category} className="bg-muted/40 border border-dashed shadow-none">
                                            <CardContent className="text-center">
                                                <p className="text-xs text-muted-foreground break-words">{category}</p>
                                                <p className="text-sm font-semibold text-primary break-words">₱
                                                    <CountUp
                                                        end={total}
                                                        duration={1}
                                                        separator=","
                                                        decimals={2}
                                                    />
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* === Search + New Record === */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <form onSubmit={handleSearch} className="flex w-full md:w-auto space-x-2">
                        <Input
                            name="search"
                            defaultValue={filters.search || ""}
                            placeholder="Search expenses..."
                            className="w-full md:w-72"
                        />
                        <Button type="submit" variant="default">Search</Button>
                    </form>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">+ New Record</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-full w-full sm:max-w-lg p-8 max-h-[100vh] overflow-y-auto">
                            <DialogHeader className="mb-4">
                                <DialogTitle>Add New Expense</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* First Row (Expense Category + Vendor Merchant) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="expense_category">What type of expense?</Label>
                                        <Select value={expenseCategory} onValueChange={setExpenseCategory} required>
                                            <SelectTrigger className="w-full sm:w-[207px]">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Salaries and Wages">Salaries and Wages</SelectItem>
                                                <SelectItem value="Utilities">Utilities</SelectItem>
                                                <SelectItem value="Teaching Materials">Teaching Materials</SelectItem>
                                                <SelectItem value="Facility Maintenance">Facility Maintenance</SelectItem>
                                                <SelectItem value="Transportation">Transportation</SelectItem>
                                                <SelectItem value="Technology and IT">Technology and IT</SelectItem>
                                                <SelectItem value="Student Activities and Events">Student Activities and Events</SelectItem>
                                                <SelectItem value="Professional Development">Professional Development</SelectItem>
                                                <SelectItem value="Insurance">Insurance</SelectItem>
                                                <SelectItem value="Taxes and Government Fees">Taxes and Government Fees</SelectItem>
                                                <SelectItem value="Food Services">Food Services</SelectItem>
                                                <SelectItem value="Miscellaneous Expenses">Miscellaneous Expenses</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="vendor_merchant">Vendor/Merchant</Label>
                                        <Input
                                            id="vendor_merchant"
                                            type="text"
                                            value={expenseMerchant}
                                            onChange={(e) => setExpenseMerchant(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Second Row (Expense Date + Receipt Number) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="expense_date">Expense Date</Label>
                                        <Input
                                            id="expense_date"
                                            type="date"
                                            value={expenseDate}
                                            onChange={(e) => setExpenseDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="receipt_number">Receipt Number</Label>
                                        <Input
                                            id="receipt_number"
                                            type="text"
                                            value={receiptNumber}
                                            onChange={(e) => setReceiptNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Amount, Remarks, Responsible Person */}
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Input
                                        id="remarks"
                                        type="text"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="responsible">Responsible Person</Label>
                                    <Input
                                        id="responsible"
                                        type="text"
                                        value={responsible}
                                        onChange={(e) => setResponsible(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="receipt_photo">Receipt Photo</Label>
                                    <Input
                                        id="receipt_photo"
                                        type="file"
                                        onChange={(e) => setReceiptPhoto(e.target.files?.[0] ?? null)}
                                        required
                                    />
                                </div>

                                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md">
                                    <p className="font-semibold text-sm">Reminder:</p>
                                    <p className="text-sm">
                                        Once you submit, no further changes can be made to this entry. This is to ensure the integrity of the data. If you encounter any issues, feel free to reach out to the system administrator. We're here to help! 😊
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* === Table Section === */}
                <div className="overflow-x-auto rounded-lg border dark:border-gray-700 shadow-sm">
                    {expenses.data.length > 0 ? (
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>OR</TableHead>
                                    <TableHead>Responsible</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.data.map((exp) => (
                                    <TableRow key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <TableCell>{exp.expense_category}</TableCell>
                                        <TableCell>{exp.remarks}</TableCell>
                                        <TableCell className="text-green-600 font-bold text-right">
                                            ₱{parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>{exp.vendor_merchant}</TableCell>
                                        <TableCell>{exp.expense_date}</TableCell>
                                        <TableCell>{exp.receipt_number}</TableCell>
                                        <TableCell>{exp.responsible}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedImage(
                                                        exp.receipt_photo
                                                            ? `/storage/${exp.receipt_photo}`
                                                            : "/images/no-image.png"
                                                    )
                                                }
                                            >
                                                View Receipt
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                            No expenses found.
                        </p>
                    )}
                </div>

                {/* === Receipt Viewer === */}
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-4xl p-0">
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Full Receipt"
                                className="w-full h-auto rounded-lg"
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* === Pagination === */}
                <div className="flex justify-center space-x-2">
                    {expenses.links.map((link, idx) => (
                        <Button
                            key={idx}
                            variant={link.active ? "default" : "outline"}
                            size="sm"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
