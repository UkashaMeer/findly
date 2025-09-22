import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { MapPin, Clock, Tag, ExternalLink, Repeat2, ThumbsUp, MessageCircleMore } from 'lucide-react'
import { useState } from 'react'
import { formatTime } from "@/lib/formatTime"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import PostCardSelect from "./PostCardSelect"
import CreateConversation from "../chats/CreateConversation"
import { Item } from "@/lib/types"
import { Button } from "@/components/ui/button"
import PostComments from "./comments/PostComments"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/app/redux/store"
import { toggleShowComments } from "@/app/redux/commentsSlice"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toggleLike } from "@/app/redux/likeSlice"

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

    console.log(items)
    const addLikeToPost = useMutation(api.item.likePost)

    const dispatch = useDispatch()
    const comment = useSelector((state: RootState) => state.comment.openComments)

    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
    const [showShareMenu, setShowShareMenu] = useState<Record<string, boolean>>({})

    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }))
    }

    return (
        <div className='w-full mx-auto space-y-4'>
            {items?.map((item: Item, index: number) => {
                const combinedText = `${item.description!} ${item.location}`
                const shouldTruncate = combinedText.length > 100
                const isExpanded = expandedItems[item._id] || false

                const handleLike = async (itemId: any) => {
                    try {
                        await addLikeToPost({
                            itemId
                        })
                        dispatch(toggleLike(itemId))
                    } catch (err) {
                        alert(err)
                    }
                }


                return (
                    <Card key={item._id || index} className="shadow-sm gap-0 hover:shadow-md transition-shadow duration-200 pb-0">
                        <CardHeader className="mb-4">
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
                                    <StatusBadge status={item.status!} />
                                    {item.isOwner && (
                                        <PostCardSelect title={item.title} category={item.category} imageUrl={item.imageUrl} location={item.location} description={item.description!} status={item.status} id={item._id} />
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
                                <div className="relative rounded-md overflow-hidden border bg-muted group mb-4">
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
                            {item.likes?.length > 0 && (
                                <span className="text-sm flex items-center gap-1 mb-2">
                                    <ThumbsUp size={15} />
                                    {item.likeCount}
                                </span>
                            )}
                        </CardContent>

                        <CardFooter className="border-t bg-muted/20 !p-3">
                            <div className="flex items-center justify-between w-full gap-2">
                                <Button
                                    className="inline-flex text-sm !py-0 !px-2 flex-1 cursor-pointer"
                                    variant={item.likedByUser ? "default" : "outline"}
                                    onClick={() => handleLike(item._id)}
                                >
                                    <ThumbsUp size={14} />
                                    Like
                                </Button>
                                <Button
                                    className="inline-flex text-sm !py-0 !px-2 flex-1 cursor-pointer"
                                    variant={comment[item._id] ? "default" : "outline"}
                                    onClick={() => { dispatch(toggleShowComments(item._id)) }}
                                >
                                    <MessageCircleMore size={14} />
                                    Comments
                                </Button>
                                <Button className="inline-flex text-sm !py-0 !px-2 flex-1 cursor-pointer" variant="outline">
                                    <Repeat2 size={14} />
                                    Repost
                                </Button>
                                {
                                    !item.isOwner && (
                                        <CreateConversation chatWithUserId={item.user.id} />
                                    )
                                }
                            </div>
                        </CardFooter>
                        {
                            comment[item._id] && <PostComments postId={item._id} userImage={item?.user?.image} userName={item?.user?.name} />
                        }
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