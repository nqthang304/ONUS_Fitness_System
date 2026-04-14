import { useState, useRef, useEffect } from "react";
import { Search, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth.providers";
import messageApi from "@/api/messageApi";

const buildInitials = (name) => {
  const value = String(name || "").trim();
  if (!value) return "U";

  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
};

const pickAvatarColor = (idLikeValue) => {
  const palette = [
    "bg-slate-700",
    "bg-blue-600",
    "bg-indigo-600",
    "bg-emerald-600",
    "bg-cyan-600",
    "bg-rose-600",
  ];

  const raw = String(idLikeValue || "");
  const sum = raw.split("").reduce((total, ch) => total + ch.charCodeAt(0), 0);
  return palette[sum % palette.length];
};

const MessagePage = () => {
  const { user } = useAuth();
  const currentUserId = String(user?.id || user?.account_info?.id || "");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await messageApi.getConversations();
        const rows = Array.isArray(response?.data) ? response.data : [];

        const mapped = rows.map((item) => {
          const id = String(item.partner_id || "");
          const name = String(item.partner_name || "Người dùng");
          return {
            id,
            name,
            avatar: buildInitials(name),
            avatarColor: pickAvatarColor(id || name),
            time: item.last_message_time_display || "--:--",
            lastMessage: item.last_message || "Chưa có tin nhắn",
            unread: Number(item.unread_count || 0),
          };
        });

        setConversations(mapped);
      } catch (error) {
        console.error("Không thể tải danh sách cuộc trò chuyện:", error);
        setConversations([]);
      }
    };

    loadConversations();
  }, []);

  const filteredConversations = conversations.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (activeChatId && !conversations.some((chat) => chat.id === activeChatId)) {
      setActiveChatId(null);
    }
  }, [activeChatId, conversations]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChatId) {
        setCurrentMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const response = await messageApi.getMessages(activeChatId);
        const rows = Array.isArray(response?.data) ? response.data : [];
        const mapped = rows.map((msg) => ({
          id: String(msg.id),
          senderId: String(msg.sender_id),
          text: msg.text,
          time: msg.time,
        }));
        setCurrentMessages(mapped);

        setConversations((prev) =>
          prev.map((item) =>
            item.id === String(activeChatId)
              ? { ...item, unread: 0 }
              : item
          )
        );
      } catch (error) {
        console.error("Không thể tải tin nhắn:", error);
        setCurrentMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeChatId]);

  const activeChatData = conversations.find(c => c.id === activeChatId);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const send = async () => {
      try {
        const response = await messageApi.sendMessage(activeChatId, inputText.trim());
        const created = response?.data;

        if (created) {
          setCurrentMessages((prev) => [
            ...prev,
            {
              id: String(created.id),
              senderId: String(created.sender_id),
              text: created.text,
              time: created.time,
            },
          ]);

          setConversations((prev) =>
            prev
              .map((item) =>
                item.id === String(activeChatId)
                  ? { ...item, lastMessage: created.text, time: created.time }
                  : item
              )
              .sort((a, b) => (a.id === String(activeChatId) ? -1 : b.id === String(activeChatId) ? 1 : 0))
          );
        }

        setInputText("");
      } catch (error) {
        console.error("Không thể gửi tin nhắn:", error);
      }
    };

    send();
  };

  return (
    <div className="w-full p-4 font-figtree h-full min-h-0">
      <div className="h-full min-h-0 flex flex-col md:flex-row gap-4">
        {/* ================= CỘT TRÁI: DANH SÁCH TIN NHẮN ================= */}
        <Card className="w-full md:w-[350px] h-full shrink-0 flex flex-col rounded-[24px] border-slate-100 shadow-sm bg-white overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <Input 
                placeholder="Tìm kiếm..." 
                className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Danh sách người chat */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {filteredConversations.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                  activeChatId === chat.id ? "bg-slate-50" : "hover:bg-slate-50/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${chat.avatarColor}`}>
                  {chat.avatar}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-900 text-sm truncate pr-2">{chat.name}</h4>
                    <span className="text-xs text-slate-400 shrink-0">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-slate-500 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredConversations.length === 0 && (
              <div className="p-4 text-sm text-slate-400 text-center">Không có cuộc trò chuyện phù hợp.</div>
            )}
          </div>
        </Card>


        {/* ================= CỘT PHẢI: KHUNG CHAT ================= */}
        <Card className="flex-1 h-full min-h-0 flex flex-col rounded-[24px] border-slate-100 shadow-sm bg-white overflow-hidden">
        
          {/* Header khung chat */}
          {activeChatData ? (
            <>
              <div className="p-4 px-6 border-b border-slate-50 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${activeChatData.avatarColor}`}>
                  {activeChatData.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{activeChatData.name}</h3>
                </div>
              </div>

              {/* Vùng hiển thị tin nhắn */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {isLoadingMessages ? (
                  <div className="text-sm text-slate-400 text-center py-8">Đang tải tin nhắn...</div>
                ) : (
                  currentMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div 
                          className={`max-w-[70%] px-5 py-3 text-sm whitespace-pre-line break-words ${
                            isMe 
                              ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" 
                              : "bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1.5 px-1">{msg.time}</span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Vùng nhập tin nhắn */}
              <div className="p-4 bg-white border-t border-slate-50">
                <form 
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-50 transition-all"
                >
                  <Input 
                    placeholder="Nhập tin nhắn..." 
                    className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-4 h-11"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!inputText.trim()}
                    className="w-11 h-11 rounded-xl bg-blue-400 hover:bg-blue-600 shrink-0 transition-colors"
                  >
                    <Send className="w-5 h-5 text-white ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1" />
          )}

        </Card>
      </div>
    </div>
  );
};

export default MessagePage;