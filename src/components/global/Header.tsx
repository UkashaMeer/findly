"use client"

import { BellDotIcon, MessageCircle, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import CreatePost from "./createPost";

export default function Header() {
    const [open, setOpen] = useState(false)
    return (
        <>
        <div className="flex items-center justify-between gap-2 py-2 px-6 b-1 border border-b border-l-0">
            <div className="flex items-center gap-2 w-full">
                <Input type="text" placeholder="Search the Item.." className="max-w-md w-full flex-1" />
                <Button className="cursor-pointer" onClick={() => setOpen(true)}>
                    <Plus />
                    Post Item
                </Button>
            </div>
            <div className="flex items-center gap-6">
                <BellDotIcon size={20} />
                <MessageCircle size={20} />
                <UserButton />
            </div>
        </div>
        <CreatePost open={open} setOpen={setOpen} />
        </>
    )
}
