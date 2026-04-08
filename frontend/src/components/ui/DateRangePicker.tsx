"use client";

import { useState, useEffect, useRef } from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DateRangePickerProps {
    dateRange: { from: Date; to: Date };
    ondateRangeChange: (range: { from: Date; to: Date }) => void;
}

const PRESETS = [
    { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: "Yesterday", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
    { label: "Last 7 Days", getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
    { label: "Last 30 Days", getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
    { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: "Last Month", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
];

export function DateRangePicker({ dateRange, ondateRangeChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempRange, setTempRange] = useState<DateRange | undefined>({ from: dateRange.from, to: dateRange.to });
    const [activePreset, setActivePreset] = useState<string | null>("Custom Range");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to check if a preset is active
    const isPresetActive = (presetLabel: string, presetRange: { from: Date, to: Date }) => {
        if (!tempRange?.from || !tempRange?.to) return false;
        return isSameDay(presetRange.from, tempRange.from) && isSameDay(presetRange.to, tempRange.to);
    };

    const handlePresetClick = (preset: typeof PRESETS[0]) => {
        const newRange = preset.getValue();
        setTempRange(newRange);
        setActivePreset(preset.label);
    };

    const handleApply = () => {
        if (tempRange?.from && tempRange?.to) {
            ondateRangeChange({ from: tempRange.from, to: tempRange.to });
        }
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempRange({ from: dateRange.from, to: dateRange.to });
        setIsOpen(false);
    };

    // Format display text
    const displayText = `${format(dateRange.from, "MMMM d, yyyy")} - ${format(dateRange.to, "MMMM d, yyyy")}`;

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between min-w-[260px] space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            >
                <div className="flex items-center gap-2">
                    <CalendarIcon size={18} className="text-gray-500" />
                    <span className="truncate">{displayText}</span>
                </div>
            </button>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute right-0 mt-2 z-50 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-100 flex overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    {/* Sidebar Presets */}
                    <div className="w-48 bg-gray-50 border-r border-gray-100 p-2 flex flex-col gap-1">
                        {PRESETS.map((preset) => {
                            const isActive = activePreset === preset.label || isPresetActive(preset.label, preset.getValue());
                            return (
                                <button
                                    key={preset.label}
                                    onClick={() => handlePresetClick(preset)}
                                    className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between
                                        ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}
                                    `}
                                >
                                    {preset.label}
                                    {isActive && <Check size={14} />}
                                </button>
                            );
                        })}
                        <button
                            className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2 border-t border-gray-200
                                ${activePreset === 'Custom Range' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}
                            `}
                            onClick={() => setActivePreset('Custom Range')}
                        >
                            Custom Range
                        </button>
                    </div>

                    {/* Calendar Area */}
                    <div className="p-4 bg-white">

                        <DayPicker
                            mode="range"
                            selected={tempRange}
                            onSelect={(range) => {
                                setTempRange(range);
                                setActivePreset('Custom Range');
                            }}
                            numberOfMonths={2}
                            showOutsideDays
                            className="p-0"
                            classNames={{
                                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                month: "space-y-4",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
                                day_range_start: "day-range-start", // Custom class if needed
                                day_range_end: "day-range-end",
                                day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                                day_today: "bg-gray-100 text-gray-900",
                                day_outside: "text-gray-300 opacity-50",
                                day_disabled: "text-gray-300 opacity-50",
                                day_hidden: "invisible",
                            }}
                        />

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                            <div className="flex-1 text-xs text-gray-500 flex items-center">
                                {tempRange?.from && tempRange?.to && (
                                    <>
                                        Selected: <span className="font-semibold text-gray-900 ml-1">{format(tempRange.from, "yyyy-MM-dd")}</span>
                                        <span className="mx-1">to</span>
                                        <span className="font-semibold text-gray-900">{format(tempRange.to, "yyyy-MM-dd")}</span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={!tempRange?.from || !tempRange?.to}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
