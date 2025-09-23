"use client"

import { BellDotIcon, MessageCircle, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import CreatePost from "./Post/createPost";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { setSearch } from "@/app/redux/searchSlice";
import UserButton from "./UserButton";

export default function Header() {
    const [open, setOpen] = useState(false)
    const dispatch = useDispatch()
    const search = useSelector((state: RootState) => state.search.value)


    return (
        <>
            <div className="flex items-center justify-between bg-white gap-2 py-2 px-6 border border-b border-l-0 fixed min-w-[calc(100%_-_250px)] z-10">
                <div className="flex items-center gap-2 w-full">
                    <Input value={search} onChange={(e) => dispatch(setSearch(e.target.value))} type="text" placeholder="Search the Item.." className="max-w-md w-full flex-1" />
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
