import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ChevronDown, ChevronUp, School } from 'lucide-react'

interface SchoolYear {
    id: number
    name: string
    yearLevels_count: number
}

interface SchoolYearPageProps {
    schoolYears: SchoolYear[]
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Enrollment',
        href: '#',
    },
]

export default function EnrollmentSYPage({ schoolYears }: SchoolYearPageProps) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enrollment" />

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left group"
                    >
                        <span className="text-xl font-semibold text-gray-800 dark:text-white">Setup</span>
                        <span className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-transform">
                            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </span>
                    </button>

                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        {schoolYears.map((sy) => (
                            <div key={sy.id} className="px-6 mt-2 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <School className="text-blue-500 w-8 h-8 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-base font-bold text-gray-900 dark:text-white">{sy.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400"></p>
                                    </div>
                                    <div className="sm:ml-auto">
                                        <Button variant="outline" size="sm" onClick={() => router.get(`/registrar/school-year-setup/${sy.id}`)}>
                                            Get Started
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
