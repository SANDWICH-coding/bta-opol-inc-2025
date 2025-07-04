import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Presentation } from 'lucide-react'

interface ClassArm {
    id: number
    classArmName: string
}

interface Billing {
    id: number
    billing_cat_id: number
    description: string
    amount: number
    category: {
        id: number
        name: string
    }
}

interface BillingCategory {
    id: number
    name: string
}

interface BillingDiscount {
    id: number
    billing_cat_id: number
    category: BillingCategory
    description?: string
    value: 'fixed' | 'percentage'
    amount: number
}

interface YearLevel {
    id: number
    yearLevelName: string
    class_arms: ClassArm[]
    billings: Billing[]
}

interface SchoolYear {
    id: number
    name: string
    year_levels: YearLevel[]
    billing_discounts: BillingDiscount[]
}

interface SyManagePageProps {
    schoolYear: SchoolYear
    billingCategories: BillingCategory[]
}

export default function EnrollmentChoosePage({ schoolYear }: SyManagePageProps) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Enrollment', href: '/registrar/' },
                { title: `${schoolYear.name}`, href: '#' },
            ]}
        >
            <Head title={`${schoolYear.name}`} />

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {schoolYear.year_levels.length === 0 ? (
                    <p className="text-gray-500">No year levels found for this school year.</p>
                ) : (
                    <Accordion type="single" className="p-5 border rounded-md shadow-sm">
                        <span className="text-xl font-semibold text-gray-800 dark:text-white">{schoolYear.name}</span>

                        {schoolYear.year_levels.map((level) => (
                            <AccordionItem key={level.id} value={`year-${level.id}`} className="mt-4 ml-4 mr-4">
                                <AccordionTrigger>
                                    {level.yearLevelName}
                                </AccordionTrigger>

                                <AccordionContent className="pb-4 pt-2">
                                    {level.class_arms.length === 0 ? (
                                        <p className="text-sm text-gray-500">No section added.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {level.class_arms.map((arm) => (
                                                <div
                                                    key={arm.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
                                                            <Presentation className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-800 dark:text-white">
                                                            {arm.classArmName}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        className="w-full sm:w-auto"
                                                        onClick={() =>
                                                            router.get(`/registrar/enrollment/class-arm-setup/${arm.id}`)
                                                        }
                                                    >
                                                        Manage
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </AppLayout>
    )
}
