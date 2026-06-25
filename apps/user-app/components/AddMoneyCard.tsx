"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { createOnRampTransaction } from "../app/lib/actions/createOnRampTxn";

const SUPPORTED_BANKS = [{
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com"
}, {
    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com/"
}];

export const AddMoney = () => {
    const [amount, setAmount] = useState(0);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");

    return (
        <Card title="Add Money">
            <div className="w-full">
                <TextInput 
                    label={"Amount"} 
                    placeholder={"Amount"} 
                    onChange={(value) => setAmount(Number(value))} 
                />
                
                <div className="py-4 text-left font-semibold text-sm text-slate-600">
                    Bank
                </div>
                
                <Select 
                    onSelect={(value) => {
                        setProvider(SUPPORTED_BANKS.find(x => x.name === value)?.name || "");
                    }} 
                    options={SUPPORTED_BANKS.map(x => ({
                        key: x.name,
                        value: x.name
                    }))} 
                />
                
                <div className="flex justify-center pt-4">
                    <Button onClick={async () => {
                        if (amount <= 0) {
                            alert("Please enter a valid amount");
                            return;
                        }

                        // 1. trigger secure database row creation (status-processing)
                        const result = await createOnRampTransaction(amount * 100, provider);
                        
                        // 2. Validate that the backend transaction successfully returned our data
                        if (result.success && result.token && result.userId) {
                            // result.userId and result.token are pulled right from your server action return value
                            const mockBankRedirectUrl = `/bank-mock?token=${result.token}&user_identifier=${result.userId}&amount=${amount * 100}`;
                            
                            // 3. Forward client to simulated bank authentication screen
                            window.location.href = mockBankRedirectUrl;
                        } else {
                            alert(result.message || "Failed to initialize payment gateway.");
                        }
                    }}>
                        Add Money
                    </Button>
                </div>
            </div>
        </Card>
    );
};