"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { User } from "@/lib/types"
import { toast } from "sonner"
import { Id } from "../../../../convex/_generated/dataModel"
import { useSearchParams } from "next/navigation"

export default function WhatsAppLayout() {
  const searchParams = useSearchParams()
  const initialConversationId = searchParams.get("conversationId") as Id<"conversations"> | null

  const [activeUser, setActiveUser] = useState<User | null>()
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(initialConversationId)
  const [message, setMessage] = useState("")

  const conversations = useQuery(api.conversation.getUserAllConversations)
  const currentUser = useQuery(api.user.getCurrentUser)
  const sendMessage = useMutation(api.message.sendMessage)
  const messages = useQuery(api.message.getMessages, conversationId ? {
    conversationId
  } : "skip")

  useEffect(() => {
    if (initialConversationId && conversations) {
      const conv = conversations.find(c => c._id === initialConversationId)
      if (conv) {
        const otherUser = conv.participants.find(u => u?._id !== currentUser?._id)
        setActiveUser(otherUser || null)
        setConversationId(conv._id)
      }
    }
  }, [initialConversationId, conversations, currentUser])



  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!conversationId || !currentUser?._id) return

    try {
      await sendMessage({
        conversationId,
        sender: currentUser?._id,
        text: message,
      })

      setMessage("")
    }
    catch (err) {
      alert(err)
    }
  }

  return (
    <Card className="w-full h-full grid grid-cols-[250px_1fr] gap-0 p-0">
      <div className="border-r flex flex-col">
        <div className="p-4 font-semibold border-b">Chats</div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {conversations?.map((conversation) =>
              conversation.participants
                .filter((user) => user?._id !== currentUser?._id)
                .map(user => (
                  <div
                    key={user?._id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent ${activeUser?._id === user?._id ? "bg-accent" : ""
                      }`}
                    onClick={() => {
                      setActiveUser(user)
                      setConversationId(conversation._id)
                    }}
                  >
                    <Avatar>
                      <AvatarImage src={user?.image} />
                      <AvatarFallback>{user?.name}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                  </div>
                )))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Chat Window */}
      <div className="flex flex-col justify-between">
        <div className="flex items-center border-b gap-2 px-4 py-3">
          <Avatar>
            <AvatarImage src={activeUser?.image} />
            <AvatarFallback>{activeUser?.name}</AvatarFallback>
          </Avatar>
          <div className="font-semibold">
            {activeUser?.name || "Select a chat"}
          </div>
        </div>

        {
          activeUser && (
            <ScrollArea className="flex-1 p-4 text-sm">
              <div className="flex flex-col gap-2">
                {messages?.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender === currentUser?._id ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-xs break-words ${msg.sender === currentUser?._id
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-gray-200 text-black rounded-bl-none"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )
        }


        {activeUser && (
          <form onSubmit={handleSendMessage} className="p-3 flex gap-2 border-t">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" className="cursor-pointer">Send</Button>
          </form>
        )}
      </div>
    </Card>
  )
}
