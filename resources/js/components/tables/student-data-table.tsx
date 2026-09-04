import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/components/ui/table';
import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ChevronRight,
    Search,
    Users,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Student {
    id: number;
    lrn: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    suffix?: string;
    gender: string;
    profilePhoto?: string | null;
}

interface Props {
    students: Student[];
}

export function StudentDataTable({ students }: Props) {
    const [globalFilter, setGlobalFilter] = useState('');

    /*
     * ---------------------------------------------------------
     * Search
     * ---------------------------------------------------------
     */
    const filteredData = useMemo(() => {
        const query = globalFilter.trim().toLowerCase();

        if (!query) {
            return students;
        }

        return students.filter((student) => {
            const fullName = [
                student.firstName,
                student.middleName,
                student.lastName,
                student.suffix,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return (
                (student.lrn ?? '').toLowerCase().includes(query) ||
                fullName.includes(query) ||
                (student.firstName ?? '').toLowerCase().includes(query) ||
                (student.lastName ?? '').toLowerCase().includes(query) ||
                (student.middleName ?? '').toLowerCase().includes(query) ||
                (student.suffix ?? '').toLowerCase().includes(query)
            );
        });
    }, [students, globalFilter]);

    /*
     * ---------------------------------------------------------
     * Navigation
     * ---------------------------------------------------------
     */
    const handleStudentClick = (studentId: number) => {
        router.visit(`/registrar/enrollment/student/${studentId}`, {
            preserveScroll: true,
        });
    };

    /*
     * ---------------------------------------------------------
     * Columns
     * ---------------------------------------------------------
     */
    const columns = useMemo<ColumnDef<Student>[]>(
        () => [
            {
                id: 'student',
                cell: ({ row }) => {
                    const student = row.original;

                    const initials = `${student.lastName?.[0] ?? ''}${
                        student.firstName?.[0] ?? ''
                    }`.toUpperCase();

                    const genderStyles =
                        student.gender === 'male'
                            ? {
                                  border: 'border-blue-400 dark:border-blue-500',
                                  avatar:
                                      'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300',
                                  dot: 'bg-blue-500',
                              }
                            : student.gender === 'female'
                              ? {
                                    border:
                                        'border-pink-400 dark:border-pink-500',
                                    avatar:
                                        'bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-300',
                                    dot: 'bg-pink-500',
                                }
                              : {
                                    border:
                                        'border-slate-300 dark:border-slate-600',
                                    avatar:
                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                                    dot: 'bg-slate-400',
                                };

                    const fullName = [
                        student.firstName,
                        student.middleName,
                        student.lastName,
                        student.suffix,
                    ]
                        .filter(Boolean)
                        .join(' ');

                    return (
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div
                                    className={`rounded-full border-2 p-0.5 ${genderStyles.border}`}
                                >
                                    {student.profilePhoto ? (
                                        <img
                                            src={`/storage/${student.profilePhoto}`}
                                            alt={fullName}
                                            className="h-10 w-10 rounded-full object-cover sm:h-11 sm:w-11"
                                        />
                                    ) : (
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold sm:h-11 sm:w-11 ${genderStyles.avatar}`}
                                        >
                                            {initials || '?'}
                                        </div>
                                    )}
                                </div>

                                {/* Gender indicator */}
                                <span
                                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 ${genderStyles.dot}`}
                                />
                            </div>

                            {/* Student information */}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-[15px]">
                                    {student.lastName},{' '}
                                    {[
                                        student.firstName,
                                        student.middleName,
                                        student.suffix,
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                </p>

                                <div className="mt-0.5 flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        LRN
                                    </span>

                                    <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {student.lrn || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'arrow',
                header: '',
                cell: () => (
                    <div className="flex items-center justify-end">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                    </div>
                ),
            },
        ],
        []
    );

    /*
     * ---------------------------------------------------------
     * Table
     * ---------------------------------------------------------
     */
    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const hasSearch = globalFilter.trim().length > 0;

    return (
        <div className="space-y-4">
            {/* Search Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                                Students
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                {hasSearch
                                    ? `${filteredData.length} of ${students.length} student${
                                          students.length !== 1 ? 's' : ''
                                      }`
                                    : `${students.length} student${
                                          students.length !== 1 ? 's' : ''
                                      } enrolled`}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            placeholder="Search by name or LRN..."
                            value={globalFilter}
                            onChange={(e) =>
                                setGlobalFilter(e.target.value)
                            }
                            className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 pr-9 dark:border-slate-700 dark:bg-slate-800/60"
                        />

                        {hasSearch && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setGlobalFilter('')}
                                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {table.getRowModel().rows.length > 0 ? (
                    <Table>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() =>
                                        handleStudentClick(
                                            row.original.id
                                        )
                                    }
                                    className="group cursor-pointer border-b border-slate-100 transition-all last:border-0 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-blue-950/20"
                                >
                                    {row
                                        .getVisibleCells()
                                        .map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className="px-4 py-3.5 sm:px-5 sm:py-4"
                                            >
                                                {flexRender(
                                                    cell.column
                                                        .columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                            {hasSearch ? (
                                <Search className="h-6 w-6 text-slate-400" />
                            ) : (
                                <Users className="h-6 w-6 text-slate-400" />
                            )}
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {hasSearch
                                ? 'No students found'
                                : 'No students enrolled yet'}
                        </h3>

                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                            {hasSearch
                                ? `We couldn't find a student matching "${globalFilter}". Try searching using another name or LRN.`
                                : 'Students enrolled in this class will appear here.'}
                        </p>

                        {hasSearch && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setGlobalFilter('')}
                                className="mt-4 rounded-xl"
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Search result footer */}
            {hasSearch && filteredData.length > 0 && (
                <p className="px-1 text-xs text-muted-foreground">
                    Showing{' '}
                    <span className="font-semibold text-foreground">
                        {filteredData.length}
                    </span>{' '}
                    matching student
                    {filteredData.length !== 1 ? 's' : ''}.
                </p>
            )}
        </div>
    );
}
