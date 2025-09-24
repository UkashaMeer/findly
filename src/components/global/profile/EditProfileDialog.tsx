import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import { User } from '@/lib/types'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { toast } from 'sonner'


export default function EditProfileDialog({ openEditProfileDialog, setOpenEditProfileDialog, currentUser }: { openEditProfileDialog: any, setOpenEditProfileDialog: any, currentUser: User }) {

    const editUser = useMutation(api.user.editUser)
    const generateUploadUrl = useMutation(api.user.generateUploadUrl)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [fileImage, setFileImage] = useState<File | null>(null)
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(new Date())
    const [tagline, setTagline] = useState("")
    const [address, setAddress] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [about, setAbout] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [storageId, setStorageId] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (currentUser) {
            setName(currentUser?.name || "")
            setEmail(currentUser?.email || "")
            setImageUrl(currentUser?.image || undefined)
            setDateOfBirth(currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth) : undefined)
            setTagline(currentUser?.tagline || "")
            setAddress(currentUser?.address || "")
            setPhoneNumber(currentUser?.phoneNumber || "")
            setAbout(currentUser?.about || "")
        }
    }, [currentUser])

    const handleProfileImageUpload = async (file: File | null) => {
        if (!file) return

        setFileImage(file)
        setIsUploading(true)

        try {
            const uploadUrl = await generateUploadUrl()

            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    "Content-Type": file.type
                },
                body: file
            })
            
            if (!result.ok){
                throw new Error("Failed to Upload File.")
            }

            const {storageId} = await result.json()
            setStorageId(storageId)

            const localUrl = URL.createObjectURL(file)
            setImageUrl(localUrl)

            toast.success("Image Uploaded Successfully")

        }catch(err){
            console.log(err)
        } finally{
            setIsUploading(false)
        }
    }

    const handleEditForm = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await editUser({
                name,
                email,
                image: storageId || currentUser?.image,
                tagline,
                address,
                dateOfBirth: dateOfBirth ? dateOfBirth.getTime() : undefined,
                phoneNumber,
                about
            })
            toast.success("User Updated Successfully")
            setOpenEditProfileDialog(false)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <Dialog open={openEditProfileDialog} onOpenChange={setOpenEditProfileDialog}>
            <DialogContent className='!min-w-2/4 overflow-x-hidden'>
                <form onSubmit={handleEditForm}>
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <div className="flex flex-col gap-8 mt-2">
                            <div className='flex flex-col gap-2'>
                                <Label>Name</Label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label>Email</Label>
                                <Input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label>Upload Profile Image</Label>
                                {
                                    imageUrl &&
                                    <div className='w-20 h-20 border-primary/50 border-3 rounded-full overflow-hidden object-cover'>
                                        <img src={imageUrl} className='' alt='hello' />
                                    </div>
                                }
                                <Input
                                    type="file"
                                    accept="image/*"
                                    placeholder='Upload Image'
                                    onChange={(e) => handleProfileImageUpload(e.target.files?.[0] || null)}
                                    disabled={isUploading}
                                />
                                {isUploading && (
                                    <p className="text-sm text-gray-500">Uploading image...</p>
                                )}
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label>Date Of Birth</Label>
                                <DatePicker
                                    dateOfBirth={dateOfBirth}
                                    setDateOfBirth={setDateOfBirth}
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label>Tagline</Label>
                                <Input
                                    type="text"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label>Address</Label>
                                <Input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label>Phone Number</Label>
                                <Input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label>About</Label>
                                <Textarea
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                />
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className='mt-4'>
                        <Button type='submit' className='text-white self-end w-20'>Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
