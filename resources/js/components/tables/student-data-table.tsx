import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { ChevronRight } from 'lucide-react'

interface Student {
  id: number
  lrn: string
  firstName: string
  lastName: string
  middleName?: string
  suffix?: string
  gender: string
  profilePhoto?: string | null
}

interface Props {
  students: Student[]
}

export function StudentDataTable({ students }: Props) {
  const [globalFilter, setGlobalFilter] = useState('')

  const filteredData = useMemo(() => {
    const query = globalFilter.toLowerCase()
    return students.filter((student) =>
      (student.lrn ?? '').toLowerCase().includes(query) ||
      (student.firstName ?? '').toLowerCase().includes(query) ||
      (student.lastName ?? '').toLowerCase().includes(query) ||
      (student.middleName ?? '').toLowerCase().includes(query) ||
      (student.suffix ?? '').toLowerCase().includes(query)
    )
  }, [students, globalFilter])

  const columns: ColumnDef<Student>[] = [
    {
      id: 'avatarName',
      cell: ({ row }) => {
        const s = row.original
        const initials = `${s.lastName[0] ?? ''}${s.firstName[0] ?? ''}`.toUpperCase()

        const genderBorder =
          s.gender === 'male'
            ? 'border-blue-500'
            : s.gender === 'female'
              ? 'border-pink-500'
              : 'border-gray-400'

        return (
          <div className="flex items-center gap-3">
            {s.profilePhoto ? (
              <div className={`p-1 rounded-full border-2 ${genderBorder}`}>
                <img
                  src={`/storage/${s.profilePhoto}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              </div>
            ) : (
              <div className={`p-1 rounded-full border-2 ${genderBorder}`}>
                <div className="w-10 h-10 rounded-full text-primary bg-muted flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
              </div>
            )}

            <div className="text-xs leading-tight">
              <div className="font-semibold">
                {s.lastName}, {`${s.firstName} ${s.middleName ?? ''} ${s.suffix ?? ''}`.trim()}
              </div>
              <div className="text-muted-foreground text-xs">
                {s.lrn}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: 'arrow',
      header: '',
      cell: () => (
        <div className="flex items-center justify-end">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by LRN or Name..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          {/* Removed TableHeader */}
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() =>
                    router.visit(`/registrar/enrollment/student/${row.original.id}`)
                  }
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-6"
                >
                  No matching records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}