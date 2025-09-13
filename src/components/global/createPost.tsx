import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { useState } from "react"
import LocationPicker from "./Map"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"

export default function CreatePost({ open, setOpen }: any) {

    const createItem = useMutation(api.item.create)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState<"Phone" | "Wallet" | "Card" | "Other" | null>(null)
    const [location, setLocation] = useState<any>(null)
    const [status, setStatus] = useState<"Lost" | "Found" | null>(null)

    const handleLocationSelect = (location: any) => {
        setLocation(location)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await createItem({
                title,
                description,
                category: category as "Phone" | "Wallet" | "Card" | "Other",
                location: location?.address ?? "",
                status: status as "Lost" | "Found",
            })

            setTitle("")
            setDescription("")
            setCategory(null)
            setLocation(null)
            setStatus(null)

            alert("created Successfully")
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Post Item</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto pt-2 pb-6">
                    <div className="grid gap-3">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Enter Item Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Category</Label>
                        <Select
                            value={category ?? ""}
                            onValueChange={(value) => setCategory(value as "Phone" | "Wallet" | "Card" | "Other")}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Item Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Phone">Phone</SelectItem>
                                <SelectItem value="Wallet">Wallet</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Location</Label>
                        <LocationPicker onLocationSelect={handleLocationSelect} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Description</Label>
                        <Textarea id="title" placeholder="Enter Item Details" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Status</Label>
                        <Select
                            value={status ?? ""}
                            onValueChange={(value) => setStatus(value as "Lost" | "Found")}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Item Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Lost">Lost</SelectItem>
                                <SelectItem value="Found">Found</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit">Save changes</Button>
                </form>
            </SheetContent>
        </Sheet>
    )
}
