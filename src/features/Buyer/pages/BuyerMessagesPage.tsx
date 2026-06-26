import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { PaperPlaneTilt, Phone, UserCircle, VideoCamera } from "@phosphor-icons/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import api from "@/provider/axios"
import { useApiMutation } from "@/services/useApiMutation"
import { useApiQuery } from "@/services/useApiQuery"

interface BuyerMessageRouteState {
  receiverId?: number | string
  sellerName?: string
  serviceTitle?: string
}

interface SendMessagePayload {
  receiver_id: string
  message: string
}

interface ChatUser {
  id?: number | string
  name?: string
  avatar_url?: string | null
}

interface ChatConversation {
  id?: number | string
  receiver_id?: number | string
  user_id?: number | string
  seller_id?: number | string
  participant?: ChatUser
  user?: ChatUser
  seller?: ChatUser
  receiver?: ChatUser
  service?: { title?: string }
  service_title?: string
  last_message?: string | { message?: string; created_at?: string }
  message?: string
  unread_count?: number
  created_at?: string
  updated_at?: string
}

interface ChatMessage {
  id?: number | string
  sender_id?: number | string
  receiver_id?: number | string
  sender?: ChatUser
  receiver?: ChatUser
  message?: string
  body?: string
  text?: string
  created_at?: string
}

interface ConversationsQueryData {
  data?: ChatConversation[]
  conversations?: ChatConversation[]
}

interface HistoryQueryData {
  data?: ChatMessage[]
  messages?: ChatMessage[]
  history?: ChatMessage[]
}

interface NormalizedConversation {
  receiverId: string
  name: string
  serviceTitle: string
  preview: string
  time: string
  unread: boolean
  avatarUrl?: string | null
}

const getConversationList = (value: ChatConversation[] | ConversationsQueryData | undefined) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  return value.conversations ?? value.data ?? []
}

const getMessageList = (value: ChatMessage[] | HistoryQueryData | undefined) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  return value.messages ?? value.history ?? value.data ?? []
}

const formatChatTime = (value?: string) => {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

const getParticipant = (conversation: ChatConversation) =>
  conversation.participant ?? conversation.seller ?? conversation.receiver ?? conversation.user

const normalizeConversation = (conversation: ChatConversation): NormalizedConversation | null => {
  const participant = getParticipant(conversation)
  const receiverId = conversation.receiver_id ?? conversation.seller_id ?? conversation.user_id ?? participant?.id

  if (!receiverId) return null

  const lastMessage =
    typeof conversation.last_message === "string"
      ? conversation.last_message
      : conversation.last_message?.message

  const lastMessageTime =
    typeof conversation.last_message === "object"
      ? conversation.last_message.created_at
      : undefined

  return {
    receiverId: String(receiverId),
    name: participant?.name ?? `Seller #${receiverId}`,
    serviceTitle: conversation.service?.title ?? conversation.service_title ?? "Direct message",
    preview: lastMessage ?? conversation.message ?? "No messages yet.",
    time: formatChatTime(lastMessageTime ?? conversation.updated_at ?? conversation.created_at),
    unread: Boolean(conversation.unread_count && conversation.unread_count > 0),
    avatarUrl: participant?.avatar_url,
  }
}

const BuyerMessagesPage = () => {
  const location = useLocation()
  const queryClient = useQueryClient()
  const routeState = location.state as BuyerMessageRouteState | null
  const [messageText, setMessageText] = useState("")
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | undefined>(
    routeState?.receiverId ? String(routeState.receiverId) : undefined
  )

  const conversationsQueryKey = ["/chat/conversations"]
  const historyQueryKey = ["/chat/history", selectedReceiverId]

  const { data: conversationsData, isLoading: isLoadingConversations } = useApiQuery<never, ChatConversation[] | ConversationsQueryData>({
    endpoint: "/chat/conversations",
    raw: true,
    queryKey: conversationsQueryKey,
  }, {
    refetchInterval: 5000,
  })

  const conversations = useMemo(() => {
    const normalized = getConversationList(conversationsData)
      .map(normalizeConversation)
      .filter((conversation): conversation is NormalizedConversation => Boolean(conversation))

    if (!routeState?.receiverId) return normalized

    const routeReceiverId = String(routeState.receiverId)
    const routeConversation: NormalizedConversation = {
      receiverId: routeReceiverId,
      name: routeState.sellerName ?? `Seller #${routeReceiverId}`,
      serviceTitle: routeState.serviceTitle ?? "Direct message",
      preview: "Start a conversation with this seller.",
      time: "Now",
      unread: false,
    }

    return normalized.some((conversation) => conversation.receiverId === routeReceiverId)
      ? normalized
      : [routeConversation, ...normalized]
  }, [conversationsData, routeState])

  useEffect(() => {
    if (selectedReceiverId || conversations.length === 0) return
    setSelectedReceiverId(conversations[0].receiverId)
  }, [conversations, selectedReceiverId])

  const activeConversation = conversations.find((conversation) => conversation.receiverId === selectedReceiverId)

  const { data: historyData, isLoading: isLoadingHistory } = useQuery<ChatMessage[] | HistoryQueryData, Error>({
    queryKey: historyQueryKey,
    queryFn: async () => {
      const response = await api.post<ChatMessage[] | HistoryQueryData>("/chat/history", {
        user_id: selectedReceiverId,
      })

      return response.data
    },
    enabled: Boolean(selectedReceiverId),
    refetchInterval: selectedReceiverId ? 3000 : false,
  })

  const messages = useMemo(() => getMessageList(historyData), [historyData])

  const sendMessageMutation = useApiMutation<SendMessagePayload, NoResponse>({
    onSuccess: (response) => {
      if (response.success === false || response.success === "false") {
        toast.error(response.message || "Failed to send message")
        return
      }

      setMessageText("")
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey })
      queryClient.invalidateQueries({ queryKey: historyQueryKey })
    },
    onError: () => {
      toast.error("Failed to send message")
    },
  })

  const handleSendMessage = () => {
    const trimmedMessage = messageText.trim()

    if (!selectedReceiverId) {
      toast.error("Please select a seller to message")
      return
    }

    if (!trimmedMessage) {
      toast.error("Please write a message")
      return
    }

    sendMessageMutation.mutate({
      endpoint: "/chat/send",
      method: "POST",
      body: {
        receiver_id: selectedReceiverId,
        message: trimmedMessage,
      },
    })
  }

  return (
    <div className="grid min-h-[calc(100vh-120px)] gap-4 lg:grid-cols-[340px_1fr]">
      <aside className="rounded-2xl border border-border bg-card p-3">
        <div className="px-2 py-3">
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground">Talk with sellers before and after booking.</p>
        </div>
        <div className="space-y-2">
          {isLoadingConversations && conversations.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.receiverId}
                type="button"
                onClick={() => setSelectedReceiverId(conversation.receiverId)}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted ${
                  selectedReceiverId === conversation.receiverId ? "bg-muted" : ""
                }`}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {conversation.avatarUrl ? (
                    <img src={conversation.avatarUrl} alt={conversation.name} className="size-11 rounded-full object-cover" />
                  ) : (
                    conversation.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{conversation.name}</p>
                    <span className="text-[11px] text-muted-foreground">{conversation.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{conversation.serviceTitle}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{conversation.preview}</p>
                </div>
                {conversation.unread && <span className="mt-2 size-2 rounded-full bg-emerald-500" />}
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-h-[560px] flex-col rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          {activeConversation ? (
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {activeConversation.avatarUrl ? (
                  <img src={activeConversation.avatarUrl} alt={activeConversation.name} className="size-11 rounded-full object-cover" />
                ) : (
                  activeConversation.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">{activeConversation.name}</h2>
                <p className="text-xs text-muted-foreground">{activeConversation.serviceTitle}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                <UserCircle size={22} className="text-muted-foreground" weight="duotone" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Select a conversation</h2>
                <p className="text-xs text-muted-foreground">Choose a seller to start chatting.</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="icon-lg" className="rounded-xl" aria-label="Start voice call" disabled={!activeConversation}>
              <Phone size={18} weight="duotone" />
            </Button>
            <Button type="button" variant="ghost" size="icon-lg" className="rounded-xl" aria-label="Start video call" disabled={!activeConversation}>
              <VideoCamera size={18} weight="duotone" />
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!activeConversation ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No conversation selected.</div>
          ) : isLoadingHistory && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No messages yet.</div>
          ) : (
            messages.map((message, index) => {
              const messageText = message.message ?? message.body ?? message.text ?? ""
              const isOutgoing = String(message.receiver_id) === selectedReceiverId
              const key = message.id ?? `${message.created_at ?? "message"}-${index}`

              return (
                <div
                  key={key}
                  className={`max-w-[78%] rounded-2xl p-4 ${
                    isOutgoing
                      ? "ml-auto rounded-tr-sm bg-emerald-600 text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm leading-6">{messageText}</p>
                  <p className={`mt-1 text-[11px] ${isOutgoing ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {formatChatTime(message.created_at)}
                  </p>
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2">
            <input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSendMessage()
                }
              }}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Write a message to the seller"
              disabled={!activeConversation || sendMessageMutation.isPending}
            />
            <Button
              type="button"
              size="icon-lg"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              aria-label="Send message"
              onClick={handleSendMessage}
              disabled={!activeConversation || sendMessageMutation.isPending}
            >
              <PaperPlaneTilt size={18} weight="bold" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BuyerMessagesPage
