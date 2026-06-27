import React from "react";

interface TextInputProps {
    placeholder: string;
    label: string;
    onChange: (value: string) => void;
    value?: string;
    disabled?: boolean; 
}

export const TextInput = ({
    placeholder,
    label,
    onChange,
    value,
    disabled = false
}: TextInputProps) => {
    return (
        <div className="pt-2">
            <label className="block mb-2 text-sm font-medium text-gray-900">{label}</label>
            <input
                type="text"
                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                    disabled ? "opacity-50 cursor-not-allowed bg-gray-200" : ""
                }`}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled} 
            />
        </div>
    );
};