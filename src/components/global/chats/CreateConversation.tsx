import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { MessageCircle } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function CreateConversation({ chatWithUserId }: any) {
    const router = useRouter()
    const createConversation = useMutation(api.conversation.getOrCreateConversations)

    const handleCreateConversation = async () => {
        try {
            const conversation = await createConversation({
                user2: chatWithUserId
            })

            const conversationId = typeof conversation === "string" ? conversation : conversation._id
            router.replace(`/user/messages?conversationId=${conversationId}`);
        } catch (err) {
            alert(err)
        }
    }

    return (
        <Button className="cursor-pointer flex-1" onClick={handleCreateConversation}>
            <MessageCircle size={14} />
            Chat
        </Button>
    )
}
