"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export const UserMenu = () => {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    if (!user) return null;

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
            <UserButton afterSignOutUrl="/sign-in" />
            <div className="flex flex-col text-sm truncate">
                <span className="font-semibold truncate">{user.fullName}</span>
                <span className="text-xs text-muted-foreground truncate">
                    {user.emailAddresses[0].emailAddress}
                </span>
            </div>
        </div>
    );
};
