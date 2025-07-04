import { useState } from "react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { router } from "@inertiajs/react"

interface ComboboxOption {
    label: string
    value: string
    route?: string
    avatar?: string
    badge?: string
    group?: string
}

interface ComboboxWithSearchProps {
    options: ComboboxOption[]
    placeholder?: string
    className?: string
}

export function CollapsibleComboboxWithSearch({
    options,
    placeholder = "Search...",
    className = "",
}: ComboboxWithSearchProps) {
    const [selected, setSelected] = useState<string | null>(null)
    const [open, setOpen] = useState(true)

    const grouped = options.reduce<Record<string, ComboboxOption[]>>((acc, option) => {
        const group = option.group || "Options"
        if (!acc[group]) acc[group] = []
        acc[group].push(option)
        return acc
    }, {})

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="w-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold">Select a student</span>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0">
                        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
                <Command className={`w-full h-full rounded-lg border shadow-md ${className}`}>
                    <CommandInput placeholder={placeholder} />
                    <CommandList className="w-full max-h-[543px] overflow-y-auto">
                        <CommandEmpty>No results found.</CommandEmpty>

                        {Object.entries(grouped).map(([group, items], index) => (
                            <div key={group}>
                                {index > 0 && <CommandSeparator />}
                                <CommandGroup heading={group}>
                                    {items.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => {
                                                setSelected(option.value)
                                                if (option.route) {
                                                    router.get(option.route)
                                                }
                                            }}
                                            className="flex items-center justify-between gap-3 px-3 py-2"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {option.avatar && (
                                                    <Avatar className="w-6 h-6 shrink-0">
                                                        <AvatarImage src={option.avatar} alt={option.label} />
                                                        <AvatarFallback>{option.label[0]}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <span className="truncate">{option.label}</span>
                                            </div>

                                            {option.badge && (
                                                <Badge variant="outline" className="text-xs shrink-0">
                                                    {option.badge}
                                                </Badge>
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </div>
                        ))}
                    </CommandList>
                </Command>
            </CollapsibleContent>
        </Collapsible>
    )
}
