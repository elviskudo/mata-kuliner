import ProfilePage from "@/components/shared/ProfilePage";

export default function POSProfile() {
    return (
        <div className="py-6 max-w-5xl mx-auto px-8">
            <div className="mb-6">
                <a href="/pos" className="text-blue-600 font-bold hover:underline mb-4 inline-block">&larr; Back to POS</a>
            </div>
            <ProfilePage role="Cashier" title="POS Profile" />
        </div>
    );
}
