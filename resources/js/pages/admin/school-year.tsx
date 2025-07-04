import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { Trash, EllipsisVertical, FolderUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SchoolYear {
    id: number;
    name: string;
    yearLevels_count: number;
}

interface SchoolYearPageProps {
    schoolYears: SchoolYear[];
}

const breadcrumbs: BreadcrumbItem[] = [

    {
        title: 'School Year',
        href: '#',
    },
];

export default function SchoolYearPage({ schoolYears }: SchoolYearPageProps) {

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = () => {
        setFormData({ name: '' });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this school year?')) {
            router.delete(`/admin/school-year/${id}`, {
                onSuccess: () => {
                    toast.success('School year deleted successfully');
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Failed to delete category');
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/admin/school-year', formData, {
            onSuccess: () => {
                setIsSubmitting(false);
                setShowModal(false);
                toast.success('School year created successfully');
            },
            onError: (errors) => {
                setIsSubmitting(false);
                toast.error(errors.name || 'Failed to create school year');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Year" />
            <Toaster richColors closeButton position="top-right" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">School Years</h1>
                    <Button onClick={handleAdd}>
                        Create new
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {schoolYears.map((sy) => (
                        <Card key={sy.id} className="flex flex-col justify-between border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{sy.name}</h3>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Menubar>
                                    <MenubarMenu>
                                        <MenubarTrigger className="cursor-pointer">
                                            <EllipsisVertical className="text-gray-500" />
                                        </MenubarTrigger>
                                        <MenubarContent align="end">
                                            <MenubarItem
                                                className="text-blue-500"
                                                onClick={() => router.get(`/admin/school-year/${sy.id}`)}
                                            >
                                                <FolderUp className="mr-2 h-4 w-4" /> Manage Setup
                                            </MenubarItem>
                                            <MenubarSeparator />
                                            <MenubarItem
                                                onClick={() => handleDelete(sy.id)}
                                                className="text-red-500"
                                            >
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </MenubarItem>
                                        </MenubarContent>
                                    </MenubarMenu>
                                </Menubar>
                            </div>
                        </Card>
                    ))}
                </div>

                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>School Year</DialogTitle>
                            <DialogDescription>
                                Create a new school year.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder='e.g. 2023-2024'
                                    required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                                        </>
                                    ) : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout >);
}


