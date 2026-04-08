"use client";

import { useState, useRef, useEffect } from "react";
import { User, Camera, UploadCloud, Save } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage({ role, title = "Profile Settings" }: { role: string, title?: string }) {
    const { profile, updateProfile, isLoaded } = useProfile(role);
    const [name, setName] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isLoaded) {
            setName(profile.name || "");
            setImage(profile.image);
        }
    }, [isLoaded, profile]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setSaving(true);
        updateProfile(name, image);
        setTimeout(() => setSaving(false), 500); // simulate saving
    };

    if (!isLoaded) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <User className="text-blue-500" size={28} />
                    {title}
                </h1>
                <p className="text-gray-500 mt-2">Manage your personal information and profile picture.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
                {/* Photo Upload */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Profile Picture</h3>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                {image ? (
                                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <User size={40} />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors border-2 border-white"
                            >
                                <Camera size={14} />
                            </button>
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-5 py-2.5 bg-gray-50 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 flex items-center gap-2"
                            >
                                <UploadCloud size={16} /> Update Photo
                            </button>
                            <p className="text-sm text-gray-400 mt-2">Recommended: Square image, max 2MB.</p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-50" />

                {/* Info Fields */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                        <input
                            type="text"
                            value={role}
                            disabled
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Action */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            "Saving..."
                        ) : (
                            <>
                                <Save size={18} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
