import { useEffect, useState } from "react"
import { API_BASE_URL } from "../connections/config"
import { FaChevronDown } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { FaCheck } from "react-icons/fa";

export default function EmpSelect({ defaultValue, onChange, viewOnly }) {

    const [value, setValue] = useState(defaultValue)
    const [loading, setLoading] = useState(false)
    const [employees, setEmployees] = useState([])
    const [isFocused, setIsFocused] = useState(false)
    const [search, setSearch] = useState("")

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])

    useEffect(() => {
        if (viewOnly || loading) return
        onChange(value)
    }, [value])

    const fetchEmployees = async () => {
        if (loading) return;
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/input-data/employee-select`, { credentials: "include" })
            if (response.status !== 200) throw new Error(response.status, response.statusText);
            const data = await response.json()
            setEmployees(data.data)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    useEffect(() => {
        if ((!employees || employees.length === 0) && !viewOnly) {
            fetchEmployees();
        }
    }, [])

    const selectedLabel = value
        ? employees.find((v) => v.Employee_XRefCode === value)?.Employee_FullName
        : ""

    const displayValue = !isFocused ? (selectedLabel || "") : search

    const containerBase =
        "w-full text-base relative " +
        (loading ? "opacity-40 " : "") +
        (viewOnly ? "pointer-events-none " : "cursor-pointer ") +
        "text-slate-900 dark:text-white";


    const inputBase =
        "w-full pr-9 pl-3 py-2 border rounded-md outline-none text-base " +
        (viewOnly
            ? "bg-transparent border-transparent "
            : "bg-white border-slate-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white ") +
        (isFocused
            ? "ring-2 ring-blue-500 border-blue-500 "
            : "focus:ring-2 focus:ring-blue-500 ");


    const iconBtnBase =
        "absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center z-20 " +
        (viewOnly
            ? "text-slate-400 dark:text-gray-400 "
            : "text-slate-500 hover:text-slate-700 dark:text-gray-300 dark:hover:text-white ");


    const dropdownWrapBase =
        "absolute left-0 w-full mt-2 rounded-md border z-30 max-h-72 overflow-hidden select-none " +
        (viewOnly
            ? "bg-transparent border-transparent "
            : "bg-white border-slate-200 shadow dark:bg-gray-700 dark:border-gray-600 ");


    const listBase = "max-h-72 overflow-y-auto flex flex-col";


    return (
        <div
            className={containerBase}
            onClick={() => { if (!viewOnly) setIsFocused(true) }}
        >
            {isFocused && !viewOnly && (
                <div
                    className="fixed inset-0 z-10 bg-transparent"
                    onClick={(e) => { e.stopPropagation(); setIsFocused(false); setSearch(""); }}
                />
            )}

            <input
                value={displayValue}
                onChange={(e) => setSearch(e.target.value)}
                readOnly={!isFocused || viewOnly}
                placeholder={
                    viewOnly
                        ? "No name selected."
                        : loading
                            ? "Loading people..."
                            : isFocused
                                ? "Search..."
                                : "Select your name..."
                }
                className={inputBase}
            />

            <div
                className={iconBtnBase}
                onClick={(e) => {
                    if (viewOnly) return;
                    e.stopPropagation();
                    if (isFocused) {
                        setIsFocused(false);
                        setSearch("");
                    } else {
                        setIsFocused(true);
                    }
                }}
            >
                {!isFocused ? <FaChevronDown size={18} /> : <IoMdClose size={20} />}
            </div>

            {isFocused && !viewOnly && (
                <div
                    className={dropdownWrapBase}
                    style={{ top: "calc(100% + 0px)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={listBase}>
                        {employees
                            .filter((e) =>
                                e.Employee_FullName.toLowerCase().includes(search.toLowerCase())
                            )
                            .sort((a, b) => a.Employee_FullName.localeCompare(b.Employee_FullName))
                            .map((e, i) => {
                                const isSelected = value === e.Employee_XRefCode
                                return (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setValue(e.Employee_XRefCode)
                                            setIsFocused(false)
                                            setSearch("")
                                        }}
                                        // inside the map for each option row:
                                        className={
                                            "relative px-3 py-2 " +
                                            (isSelected
                                                ? "bg-blue-600 text-white"
                                                : "text-slate-800 hover:bg-slate-100 dark:text-gray-100 dark:hover:bg-gray-600")
                                        }

                                    >
                                        {e.Employee_FullName}

                                        {isSelected && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                                <FaCheck size={18} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                    </div>
                </div>
            )}
        </div>
    )
}
