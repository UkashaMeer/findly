import { useQuery } from 'convex/react'
import React from 'react'
import { api } from '../../../../convex/_generated/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { timeAgo } from '@/lib/timeAgo'
import { ThumbsUp } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/app/redux/store'
import { toggleShowReplyComments } from '@/app/redux/replyCommentSlice'
import ReplyComment from './ReplyComment'

export default function PostCommentReplies({ parentId, postId }: { parentId: any, postId: any }) {

    const dispatch = useDispatch()
    const replyComment = useSelector((state: RootState) => state.replyComment.openReplyComments)
    const replies = useQuery(api.comments.getReplies, {
        parentId
    })

    console.log(replies)

    return (
        <div className='mt-4 ml-6'>
            {replies?.map((reply, i) => (
                <div key={i} className="mt-8 space-y-6">
                    <div className="flex items-start gap-3">
                        <Avatar>
                            <AvatarImage src={reply?.user?.image} />
                            <AvatarFallback>UK</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="rounded-md p-3 border-foreground/15 border-1">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="font-semibold text-sm"
                                        style={{ color: 'hsl(var(--foreground))' }}
                                    >
                                        {reply?.user?.name}
                                    </div>
                                    <span className="text-xs">{timeAgo(reply._creationTime)}</span>
                                </div>
                                <div
                                    className="text-sm leading-relaxed"
                                    style={{ color: 'hsl(var(--foreground))' }}
                                >
                                    {reply.content}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs font-medium capitalize" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                <button
                                    className="flex items-center gap-2 cursor-pointer capitalize"
                                // onClick={() => handleCommentLike(reply._id)}
                                >
                                    <span className={`${reply.likedByUser ? "text-primary" : "text-foreground"}`}>like</span>
                                    {
                                        reply?.likes?.length! > 0 && (
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp size={13} className="" fill={reply.likedByUser ? "orange" : "white"} />
                                                {reply.likeCount}
                                            </div>
                                        )
                                    }
                                </button>
                                <span className="w-[1px] min-h-4 bg-foreground/75 flex relative"></span>
                                <button
                                    className="cursor-pointer"
                                    onClick={() => dispatch(toggleShowReplyComments(reply._id))}
                                >
                                    Reply
                                </button>
                            </div>
                            {
                                    replyComment[reply._id] && (
                                        <>
                                            <ReplyComment userImage={reply?.user?.image} parentId={reply._id} postId={postId} />
                                        </>
                                    )
                                }
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
