import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../../../convex/_generated/api";

interface ReplyCommentProps {
    userImage: string;
    parentId: any;
    postId: any;
    onSuccess?: () => void;
}

export default function ReplyComment({ userImage, parentId, postId, onSuccess }: ReplyCommentProps) {

    const replyComment = useMutation(api.comments.replyComment)
    const [isFocused, setIsFocused] = useState(false);
    const [comment, setComment] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleSubmit = async () => {
        if (comment.trim()) {
            try {
                await replyComment({
                    postId,
                    content: comment,
                    likes: [],
                    parentId,
                });
                setComment("");
                setIsFocused(false);
                onSuccess?.();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = (e: any) => {
        if (!containerRef.current?.contains(e.relatedTarget)) {
            if (!comment.trim()) {
                setIsFocused(false);
            }
        }
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
            setComment("")
        }
    };

    const handleContainerClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFocused) {
            setIsFocused(true);
        }
    };

    useEffect(() => {
        if (isFocused && textareaRef.current) {
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    }, [isFocused]);

    return (
        <>
            <div className="flex items-start gap-4 mt-4">
                <div className="relative">
                    <Avatar>
                        <AvatarImage src={userImage} />
                        <AvatarFallback>UK</AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex-1">
                    <div
                        ref={containerRef}
                        className={`relative border transition-all duration-300 ease-out overflow-hidden ${isFocused
                            ? 'rounded-md ring-3 ring-primary/50 border-1 border-primary'
                            : 'rounded-md'
                            }`}
                        onClick={handleContainerClick}
                    >

                        <div
                            className={`transition-all duration-300 ease-out ${isFocused ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
                                }`}
                        >
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="w-full p-2 text-sm bg-transparent rounded-full focus:outline-none placeholder:text-opacity-70"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onFocus={handleFocus}
                                tabIndex={isFocused ? -1 : 0}
                            />
                        </div>

                        <div
                            className={`transition-all duration-300 ease-out ${isFocused ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'
                                }`}
                        >
                            <div className="p-3 flex flex-col">
                                <textarea
                                    ref={textareaRef}
                                    placeholder="Add a comment..."
                                    className="w-full min-h-[80px] resize-none focus:outline-none bg-transparent placeholder:text-opacity-70"
                                    style={{
                                        color: 'hsl(var(--foreground))'
                                    }}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    rows={3}
                                />

                                <Button
                                    onClick={handleSubmit}
                                    disabled={!comment.trim()}
                                    className={`self-end cursor-pointer ${comment.trim()
                                        ? 'shadow-sm hover:shadow-md'
                                        : 'cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    Comment
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
            </div>
        </>
    )
}
