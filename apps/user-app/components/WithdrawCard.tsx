"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOffTxnx } from "../app/lib/actions/createOffTxnx";

const SUPPORTED_BANKS = [
    { name: "HDFC Bank", value: "HDFC" },
    { name: "Axis Bank", value: "AXIS" },
    { name: "ICICI Bank", value: "ICICI" }
] as const;

export function WithdrawCard() {
    const [amount, setAmount] = useState("");
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0].value);
    
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    const handleWithdraw = async () => {
        if (loading) return;
        setErrorMessage("");
        setSuccessMessage("");

        if (!amount || Number(amount) <= 0) {
            setErrorMessage("Please enter a valid amount to withdraw.");
            return;
        }

        setLoading(true);
        
        const response = await createOffTxnx(Number(amount), provider);

        if (response?.status === "error") {
            setErrorMessage(response.message);
            setLoading(false);
        } else {
            setSuccessMessage("Withdrawal initiated successfully!");
            setAmount(""); 
            router.refresh(); // update wallet balance instantly on screen
            setLoading(false);
        }
    };

    return (
        <Card title="Withdraw Money to Bank">
            <div className="min-w-72 pt-2">
                {/* Status Banners */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium">
                        ⚠️ {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-xs font-medium">
                        ✓ {successMessage}
                    </div>
                )}

                {/* Bank Select Dropdown */}
                <div className="py-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Select Bank Route</label>
                    <select 
                        disabled={loading}
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as typeof provider)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                        {SUPPORTED_BANKS.map((bank) => (
                            <option key={bank.value} value={bank.value}>{bank.name}</option>
                        ))}
                    </select>
                </div>

                {/* Amount Input */}
                <TextInput 
                    placeholder={"Amount (INR)"} 
                    label="Amount" 
                    value={amount}
                    onChange={(value) => setAmount(value)} 
                    disabled={loading}
                />

                {/* Action Button */}
                <div className="pt-6 flex justify-center">
                    <Button onClick={handleWithdraw} disabled={loading}>
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing Outflow...</span>
                            </div>
                        ) : (
                            "Withdraw Funds"
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
}