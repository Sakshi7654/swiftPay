import { Card } from "@repo/ui/card";

interface MerchantBalanceProps {
    amount: number;
}

export const BalanceCard = ({ amount }: MerchantBalanceProps) => {
    return (
        <Card title="Settled Business Revenue">
            <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500 font-medium">Available for Payout</span>
                <span className="text-xl font-bold text-slate-900">₹{(amount / 100).toFixed(2)}</span>
            </div>
        </Card>
    );
};