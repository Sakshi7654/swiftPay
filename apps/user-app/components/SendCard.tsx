"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";
import { useRouter } from "next/navigation";

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    const handleSend = async () => {
        // if already processing, exit immediately to prevent double-clicks
        if (loading) return;
        setErrorMessage("");
        setSuccessMessage("");

        if (!number || !amount || Number(amount) <= 0) {
            setErrorMessage("Please enter a valid phone number and payment amount.");
            return;
        }

        setLoading(true); 
        const response = await p2pTransfer(number, Number(amount) * 100);

        if (response?.status === "error") {
            setErrorMessage(response.message);
            setLoading(false);
        } else {
            setSuccessMessage("Transaction completed successfully!");
            setAmount(""); //clear fields
            
            //!!: forces nextjs server component to fetch fresh database metrics instantly!! imp
            router.refresh(); 
            setLoading(false);
        }
    };

    return (
        <div className="h-[60vh]">
            <Center>
                <Card title="Send Money">
                    <div className="min-w-72 pt-2">
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

                        <TextInput 
                            placeholder={"Number"} 
                            label="Number" 
                            value={number}
                            onChange={(value) => setNumber(value)} 
                            disabled={loading}
                        />
                        <TextInput 
                            placeholder={"Amount"} 
                            label="Amount" 
                            value={amount}
                            onChange={(value) => setAmount(value)} 
                            disabled={loading}
                        />

                        <div className="pt-6 flex justify-center">
                            <Button onClick={handleSend} disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    "Send Money"
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            </Center>
        </div>
    );
}