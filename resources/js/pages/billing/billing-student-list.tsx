import { Head, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card, CardAction, CardContent, CardDescription,
    CardHeader, CardTitle
} from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { ArrowRight } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import SearchBarWithSuggestions from '@/components/ui/searchbar';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Student = {
    id: number;
    lrn: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    yearLevel: string;
    section: string;
    totalPaid: number;
};

type SchoolYear = {
    id: number;
    name: string;
};

type PageProps = {
    students: Student[];
    schoolYears: SchoolYear[];
    selectedSchoolYear: string;
    selectedYearLevel?: string;
    yearLevels: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Students', href: '/billing/students' },
];

export default function StudentList() {
    const {
        students,
        schoolYears,
        selectedSchoolYear,
    } = usePage<PageProps>().props;

    // Group students by year level
    const studentsByYearLevel: Record<string, Student[]> = students.reduce((acc, student) => {
        if (!acc[student.yearLevel]) acc[student.yearLevel] = [];
        acc[student.yearLevel].push(student);
        return acc;
    }, {} as Record<string, Student[]>);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const studentSuggestions = students.map(
        (s) => `${s.firstName} ${s.lastName}`
    );

    const handleSelect = (value: string) => {
        setSearchQuery(value);

        const match = students.find(
            (s) => `${s.firstName} ${s.lastName}`.toLowerCase() === value.toLowerCase()
        );

        if (match) {
            setSelectedStudent(match);
            router.get(`/billing/students/${match.id}`);
        } else {
            setSelectedStudent(null);
        }
    };

    const handleFilterChange = (filters: { school_year?: string; year_level?: string }) => {
        router.get(route('billing.students'), filters, { preserveScroll: true });
    };

    function toProperCase(name: string) {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedSchoolYear}</CardTitle>
                        <CardDescription>List of enrollment in this school year.</CardDescription>
                        <CardAction className="flex flex-wrap gap-2">
                            <Select
                                onValueChange={(val) => handleFilterChange({ school_year: val })}
                                defaultValue={selectedSchoolYear}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="School Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schoolYears.map((sy) => (
                                        <SelectItem key={sy.id} value={sy.name}>
                                            {sy.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardAction>
                    </CardHeader>

                    <CardContent>
                        <div className="flex justify-start mb-4">
                            <SearchBarWithSuggestions
                                suggestions={studentSuggestions}
                                onSelect={handleSelect}
                                placeholder="Search student"
                            />
                        </div>

                        <Accordion type="multiple" className="w-full">
                            {Object.entries(studentsByYearLevel).map(([yearLevel, group]) => (
                                <AccordionItem key={yearLevel} value={yearLevel}>
                                    <AccordionTrigger className="text-base font-semibold">
                                        {yearLevel} ({group.length} students)
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-100 dark:bg-gray-800">
                                                    <TableHead>LRN</TableHead>
                                                    <TableHead>First name</TableHead>
                                                    <TableHead>Middle name</TableHead>
                                                    <TableHead>Last name</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {group.map((student) => (
                                                    <TableRow key={student.id}>
                                                        <TableCell>{student.lrn}</TableCell>
                                                        <TableCell>{toProperCase(student.firstName)}</TableCell>
                                                        <TableCell>{toProperCase(student.middleName || '-')}</TableCell>
                                                        <TableCell>{toProperCase(student.lastName)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="link"
                                                                onClick={() => router.get(`/billing/students/${student.id}`)}
                                                            >
                                                                Details <ArrowRight className="ml-1" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        {students.length === 0 && (
                            <p className="text-center text-muted-foreground mt-6">
                                No students found for the selected school year.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
