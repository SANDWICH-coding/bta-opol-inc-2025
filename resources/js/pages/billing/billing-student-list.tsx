import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { type BreadcrumbItem } from '@/types'
import { DataTable } from '@/components/ui/data-table'
import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface Student {
    id: number
    firstName: string
    lastName: string
    middleName?: string
    suffix?: string
    gender: 'male' | 'female'
    profilePhoto: string
    enrollments: {
        id: number
        class_arm: {
            classArmName: string
            year_level: {
                yearLevelName: string
            }
        }
    }[]
}

interface StudentListPageProps {
    students: Student[]
    schoolYear: {
        id: number
        name: string
    }
}

const columns: ColumnDef<Student>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },

    {
        id: "Student",
        header: "Student",
        cell: ({ row }) => {
            const s = row.original;
            const [imgError, setImgError] = useState(false);

            const imageSrc = imgError || !s.profilePhoto
                ? "/images/avatar-place-holder.png"
                : `/storage/${s.profilePhoto}`;

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={imageSrc}
                            onError={() => setImgError(true)}
                            alt={`${s.firstName} ${s.lastName}`}
                        />
                        <AvatarFallback>
                            {s.firstName?.[0]}
                            {s.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">
                        {s.lastName}, {s.firstName} {s.middleName ?? ""} {s.suffix ?? ""}
                    </div>
                </div>
            )
        },
        accessorFn: (row) =>
            `${row.lastName} ${row.firstName} ${row.middleName ?? ""} ${row.suffix ?? ""}`,
        filterFn: (row, id, value) => {
            return row
                .getValue<string>(id)
                ?.toLowerCase()
                .includes(value.toLowerCase())
        },
    },
    {
        id: "Total Payments",
        header: "Total Payments",
        cell: () => <span className="text-muted-foreground">—</span>,
    },
    {
        id: "Status",
        header: "Status",
        cell: () => <span className="text-muted-foreground">—</span>,
    },
    {
        id: "Latest Payment",
        header: "Latest Payment",
        cell: () => <span className="text-muted-foreground">—</span>,
    },

    {
        id: "Details",
        header: "Details",
        cell: ({ row }) => (
            <Button
                variant="link"
                className="text-sm text-blue-600 hover:underline"
                onClick={() =>
                    router.get(`/billing/student/${row.original.enrollments[0]?.id}`)
                }
            >
                <ChevronRight className="text-pink-400" strokeWidth={3} />
            </Button>
        ),
    },
]

export default function BillingStudentListPage({ students, schoolYear }: StudentListPageProps) {
    const yearLevelName = students[0]?.enrollments[0]?.class_arm?.year_level?.yearLevelName ?? '—'

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Billing', href: '/billing/' },
        { title: schoolYear.name, href: `/billing/school-year/${schoolYear.id}` },
        { title: yearLevelName, href: '#' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enrolled Students" />
            <div className="p-6">
                <DataTable columns={columns} data={students} filterKey="Student" />
            </div>
        </AppLayout>
    )
}
