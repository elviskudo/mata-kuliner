"use client";

import { useProfile } from "@/hooks/useProfile";

export default function HeaderProfileBadge({ role }: { role: string }) {
    const { profile, isLoaded } = useProfile(role);

    if (!isLoaded) return null;

    return (
        <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 border border-blue-500 rounded-lg bg-transparent flex items-center justify-center">
                <span className="text-sm font-bold text-blue-500">
                    {profile.name || "Guest"} - {profile.role}
                </span>
            </div>
            {profile.image ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                    <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                </div>
            ) : null}
        </div>
    );
}
