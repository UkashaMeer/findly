import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
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

export default function CreatePost({ open, setOpen }: any) {
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Post Item</SheetTitle>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Enter Item Title" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Category</Label>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Item Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="wallet">Wallet</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Location</Label>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Description</Label>
                        <Textarea id="title" placeholder="Enter Item Details" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Status</Label>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Item Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="wallet">Lost</SelectItem>
                                <SelectItem value="phone">Found</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <SheetFooter>
                    <Button type="submit">Save changes</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
