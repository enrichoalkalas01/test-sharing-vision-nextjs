"use client";

import { Toaster } from "@/components/ui/sonner";

import { TriangleAlert, CircleX, Info, CheckCheck } from "lucide-react";

export default function ToasterProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <Toaster
                icons={{
                    success: <CheckCheck className="w-5 h-5 text-green-400" />,
                    info: <Info className="w-5 h-5 text-gray-800" />,
                    warning: (
                        <TriangleAlert className="w-5 h-5 text-orange-400" />
                    ),
                    error: <CircleX className="w-5 h-5 text-red-400" />,
                }}
            />
        </>
    );
}
