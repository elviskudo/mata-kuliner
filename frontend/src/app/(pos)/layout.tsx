import { PosSidebar } from "@/components/pos/PosSidebar";

export default function PosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <PosSidebar />
            <main className="flex-1 overflow-hidden h-screen">
                {children}
            </main>
        </div>
    );
}
