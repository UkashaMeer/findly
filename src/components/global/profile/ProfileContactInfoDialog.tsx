import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@/lib/types";
import { Calendar, LinkedinIcon, Mail, MapPin, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function ProfileContactInfoDialog({ openContactInfo, setOpenContactInfo, user, userId }: { openContactInfo: any, setOpenContactInfo: any, user: User, userId: any }) {
    const contactInfoData = [
        {
            name: "Linkedin",
            url: `http://localhost:3000/user/profile?userId=${userId}`,
            urlText: `user/profile?userId=${userId}`,
            icon: LinkedinIcon,
        },
        {
            name: "Phone",
            url: `"tel:${user?.phoneNumber}`,
            urlText: user?.phoneNumber,
            icon: PhoneCall,
        },
        {
            name: "Address",
            url: `${user?.address}`,
            urlText: user?.address,
            icon: MapPin,
        },
        {
            name: "Email",
            url: `mailto:${user?.email}`,
            urlText: user?.email,
            icon: Mail,
        },
        {
            name: "Birthday",
            url: "",
            urlText: user?.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString("en-GB")
                : "",
        icon: Calendar,
        },
    ]
return (
    <Dialog open={openContactInfo} onOpenChange={setOpenContactInfo}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{user?.name}</DialogTitle>
                <div className="flex flex-col gap-3 mt-2">
                    <h3 className="text-lg font-semibold">Contact Info</h3>
                    {
                        contactInfoData.map((data, i) => (
                            <div className="flex items-start gap-3" key={i}>
                                <data.icon size={20} strokeWidth={1.7} className="rounded-sm mt-[3px]" />
                                <div className="flex items-start flex-col">
                                    <h4 className="font-medium">{data.name}</h4>
                                    {
                                        data.url !== "" ? (
                                            <Link href={data.url} className={`text-sm text-primary`}>{data.urlText}</Link>
                                        ) : (
                                            <span className={`text-sm`}>{data.urlText}</span>
                                        )
                                    }
                                </div>
                            </div>
                        ))
                    }
                </div>
            </DialogHeader>
        </DialogContent>
    </Dialog>
)
}
