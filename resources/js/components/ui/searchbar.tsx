import React, { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { Search } from "lucide-react";

interface SearchBarWithSuggestionsProps {
    suggestions: string[];
    onSelect: (value: string) => void;
    placeholder?: string;
}

const SearchBarWithSuggestions: React.FC<SearchBarWithSuggestionsProps> = ({
    suggestions,
    onSelect,
    placeholder = "Search...",
}) => {
    const [query, setQuery] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim() === "") {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        } else {
            const filtered = suggestions.filter((s) =>
                s.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        }
    }, [query, suggestions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (value: string) => {
        setQuery(value);
        setShowSuggestions(false);
        onSelect(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || filteredSuggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                setActiveIndex((prev) => (prev + 1) % filteredSuggestions.length);
                break;
            case "ArrowUp":
                setActiveIndex((prev) =>
                    prev === 0 ? filteredSuggestions.length - 1 : prev - 1
                );
                break;
            case "Enter":
                handleSelect(filteredSuggestions[activeIndex]);
                break;
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Search className="h-4 w-4" />
                </span>
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setActiveIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    className="pl-9 bg-muted/40" // Add padding to the left to accommodate the icon
                />
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto border rounded shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {filteredSuggestions.map((s, index) => (
                        <li
                            key={s}
                            onClick={() => handleSelect(s)}
                            className={`px-4 py-2 cursor-pointer 
                                ${index === activeIndex
                                    ? "bg-blue-100 dark:bg-blue-800 text-black dark:text-white"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                                }`}
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBarWithSuggestions;
