import StockStats from '@/components/kitchen/StockStats';
import StockTable from '@/components/kitchen/StockTable';

export default function ProductPage() {
    return (
        <div className="space-y-6">
            <StockStats />
            <StockTable />
        </div>
    );
}
