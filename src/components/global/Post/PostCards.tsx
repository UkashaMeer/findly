import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { MapPin, Clock, Tag, Phone, Share2, ExternalLink, Heart, Repeat2, Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { formatTime } from "@/lib/formatTime"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import PostCardSelect from "./PostCardSelect"
import CreateConversation from "../chats/CreateConversation"

const StatusBadge = ({ status }: { status: string }) => {
    const isLost = status === "Lost"
    return (
        <div className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${isLost
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
            }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isLost ? 'bg-primary' : 'bg-green-500'}`} />
            {status}
        </div>
    )
}

export function PostCards({ items }: { items: any }) {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
    const [likedItems, setLikedItems] = useState<Record<string, boolean>>({})
    const [showShareMenu, setShowShareMenu] = useState<Record<string, boolean>>({})
    const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})

    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }))
    }

    const toggleLike = (itemId: string) => {
        setLikedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }))
    }
    const toggleShareMenu = (itemId: string) => {
        setShowShareMenu(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }))
    }

    const copyToClipboard = async (itemId: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedItems(prev => ({ ...prev, [itemId]: true }))
            setTimeout(() => {
                setCopiedItems(prev => ({ ...prev, [itemId]: false }))
            }, 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const sharePost = async (item: any, platform: string) => {
        const url = `${window.location.origin}/post/${item._id}`
        const text = `Check out this ${item.status.toLowerCase()} item: ${item.title}`

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                break
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                break
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
                break
            case 'copy':
                copyToClipboard(item._id, url)
                break
        }
        setShowShareMenu(prev => ({ ...prev, [item._id]: false }))
    }

    return (
        <div className='w-full mx-auto space-y-4'>
            {items?.map((item, index) => {
                const combinedText = `${item.description} ${item.location}`
                const shouldTruncate = combinedText.length > 100
                const isExpanded = expandedItems[item._id] || false
                const isLiked = likedItems[item._id] || false
                const showShare = showShareMenu[item._id] || false
                const isCopied = copiedItems[item._id] || false

                return (
                    <Card key={item._id || index} className="shadow-sm hover:shadow-md transition-shadow duration-200 pb-0">
                        <CardHeader>
                            <div className='flex items-start justify-between'>
                                <div className='flex items-center gap-3'>
                                    <Avatar>
                                        <AvatarImage src={item.user?.image} alt={item.user?.name} />
                                        <AvatarFallback>{item.user?.name.split(' ')
                                            .map(word => word[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-sm font-semibold text-foreground">
                                            {item.user?.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock size={12} />
                                            {formatTime(item._creationTime)}
                                        </CardDescription>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-muted-foreground">
                                        <Tag size={12} />
                                        <span className="text-xs font-medium">{item.category}</span>
                                    </div>
                                    <StatusBadge status={item.status} />
                                    {item.isOwner && (
                                        <PostCardSelect title={item.title} category={item.category} imageUrl={item.imageUrl} location={item.location} description={item.description} status={item.status} id={item._id} />
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="py-0">
                            <div>
                                <h3 className='text-lg font-semibold text-foreground mb-2 leading-snug'>
                                    {item.title}
                                </h3>

                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                    {shouldTruncate && !isExpanded
                                        ? `${item.description.substring(0, 100)}...`
                                        : item.description
                                    }
                                    {shouldTruncate && (
                                        <button
                                            onClick={() => toggleExpanded(item._id)}
                                            className="text-primary hover:text-primary/80 ml-1 text-xs font-medium cursor-pointer"
                                        >
                                            {isExpanded ? 'less' : 'more'}
                                        </button>
                                    )}
                                </p>

                                <div className="flex items-start gap-2 bg-muted/40 rounded-md p-2.5 mb-3">
                                    <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {shouldTruncate && !isExpanded && item.location.length > 50
                                            ? `${item.location.substring(0, 50)}...`
                                            : item.location
                                        }
                                    </p>
                                </div>
                            </div>

                            {item.imageUrl && (
                                <div className="relative rounded-md overflow-hidden border bg-muted group">
                                    <div className="w-full">
                                        <img
                                            src={item.imageUrl}
                                            className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            alt={item.title}
                                            style={{ maxHeight: '400px' }}
                                            onClick={() => window.open(item.imageUrl as string, '_blank')}
                                        />
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="bg-black/50 text-white p-1 rounded hover:bg-black/70 transition-colors">
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="border-t bg-muted/20 px-6 !py-3">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-1.5">
                                    {
                                        !item.isOwner && (
                                            <CreateConversation chatWithUserId={item.user.id} />
                                        )
                                    }

                                    <div className="relative">
                                        <button
                                            onClick={() => toggleShareMenu(item._id)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-sm hover:bg-muted transition-colors text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            <Share2 size={14} />
                                            Share
                                        </button>

                                        {showShare && (
                                            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                                                <button
                                                    onClick={() => sharePost(item, 'twitter')}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted rounded flex items-center gap-2"
                                                >
                                                    Share on Twitter
                                                </button>
                                                <button
                                                    onClick={() => sharePost(item, 'facebook')}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted rounded flex items-center gap-2"
                                                >
                                                    Share on Facebook
                                                </button>
                                                <button
                                                    onClick={() => sharePost(item, 'whatsapp')}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted rounded flex items-center gap-2"
                                                >
                                                    Share on WhatsApp
                                                </button>
                                                <button
                                                    onClick={() => sharePost(item, 'copy')}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted rounded flex items-center gap-2"
                                                >
                                                    {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                                    {isCopied ? 'Copied!' : 'Copy Link'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 rounded transition-colors text-xs font-medium cursor-pointer">
                                        <Repeat2 size={14} />
                                        Repost
                                    </button>
                                </div>

                                <button
                                    onClick={() => toggleLike(item._id)}
                                    className={`flex items-center gap-1 transition-colors text-xs cursor-pointer ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                                >
                                    <Heart size={12} className={isLiked ? 'fill-current' : ''} />
                                    <span>{isLiked ? 6 : 5}</span>
                                </button>
                            </div>
                        </CardFooter>
                    </Card>
                )
            })}

            {/* Click outside to close share menus */}
            {Object.values(showShareMenu).some(Boolean) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowShareMenu({})}
                />
            )}
        </div>
    )
}