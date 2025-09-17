"use client"

import Header from "@/components/global/Header";
import { AppSidebar } from "@/components/global/Sidebar";
import { Sidebar, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React, { useState } from "react";

export default function UserLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <main className="w-full">
                <Header/>
                {children}
            </main>
        </SidebarProvider>
    );
}