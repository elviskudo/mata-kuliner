"use client";

import { useState, useEffect } from "react";

export interface UserProfile {
    name: string;
    role: string;
    image: string | null;
}

export function useProfile(defaultRole: string = "User") {
    const [profile, setProfile] = useState<UserProfile>({
        name: "",
        role: defaultRole,
        image: null,
    });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load from local storage
        const storedName = localStorage.getItem(`profile_name_${defaultRole}`);
        const storedImage = localStorage.getItem(`profile_image_${defaultRole}`);

        if (storedName || storedImage) {
            setProfile(prev => ({
                ...prev,
                name: storedName || "",
                image: storedImage || null,
            }));
        }
        setIsLoaded(true);
    }, [defaultRole]);

    const updateProfile = (name: string, image: string | null) => {
        setProfile((prev) => ({ ...prev, name, image }));
        if (name) localStorage.setItem(`profile_name_${defaultRole}`, name);
        if (image) localStorage.setItem(`profile_image_${defaultRole}`, image);
    };

    return { profile, updateProfile, isLoaded };
}
