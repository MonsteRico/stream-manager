import React, { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { Input } from "./ui/input";

// Define the type for each item in the dropdown
interface DropdownItem<T> {
    label: string;
    value: T;
}

// Define props with generic type T
interface SearchableDropdownProps<T> {
    items: DropdownItem<T>[];
    onSelect: (item: DropdownItem<T>) => void;
    placeholder?: string;
}

const SearchableDropdown = <T,>({ items, onSelect, placeholder = "Select item..." }: SearchableDropdownProps<T>) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState(items);
    const [isOpen, setIsOpen] = useState(false);

    // Fuse.js setup for fuzzy search
    const fuse = new Fuse(items, {
        keys: ["label"],
        threshold: 0.3,
    });

    // Update filtered items based on search term
    useEffect(() => {
        if (searchTerm) {
            const results = fuse.search(searchTerm).map((result) => result.item);
            setFilteredItems(results);
        } else {
            setFilteredItems(items);
        }
    }, [searchTerm, fuse, items]);

    const handleSelect = (item: DropdownItem<T>) => {
        setSearchTerm(item.label);
        onSelect(item);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            <Input
                type="text"
                value={searchTerm}
                onClick={() => setIsOpen(!isOpen)}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2"
            />

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-muted border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <div
                                key={item.label} // Assuming labels are unique for simplicity
                                onClick={() => handleSelect(item)}
                                className="px-4 py-2 cursor-pointer hover:bg-black/30 text-foreground"
                            >
                                {item.label}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-foreground">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
