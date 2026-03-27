import { useState, useRef, useEffect } from "react";
import { Search, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth.providers";

// --- MOCK DATA ---
const MOCK_CHAT_USERS = [
  {
    id: "1",
    name: "Quản trị hệ thống",
    role: "ADMIN",
    avatar: "AD",
    avatarColor: "bg-slate-700",
  },
  {
    id: "2",
    name: "HLV Trần B",
    role: "HLV",
    avatar: "TB",
    avatarColor: "bg-emerald-500",
  },
  {
    id: "3",
    name: "Hội viên C",
    role: "HOIVIEN",
    hlv_id: "2",
    avatar: "HC",
    avatarColor: "bg-blue-500",
  },
  {
    id: "4",
    name: "Nguyễn Văn A",
    role: "HOIVIEN",
    hlv_id: "2",
    avatar: "VA",
    avatarColor: "bg-indigo-500",
  },
];

const threadKey = (idA, idB) => [String(idA), String(idB)].sort().join("_");

const MOCK_MESSAGES = {
  [threadKey("2", "3")]: [
    { id: "m1", senderId: "2", text: "Chào em, hôm nay tập bài gì nhỉ?", time: "10:00" },
    { id: "m2", senderId: "3", text: "Dạ hôm nay tập chân ạ.", time: "10:05" },
    { id: "m3", senderId: "2", text: "Nhớ tập đúng giờ nhé em!", time: "10:30" },
  ],
  [threadKey("2", "4")]: [
    { id: "m4", senderId: "2", text: "Ngày mai tăng tạ nhé.", time: "09:00" },
    { id: "m5", senderId: "4", text: "Dạ vâng ạ.", time: "09:05" },
  ],
  [threadKey("1", "2")]: [
    { id: "m6", senderId: "1", text: "Nhắc HLV cập nhật kết quả tuần này.", time: "08:40" },
    { id: "m7", senderId: "2", text: "Em sẽ cập nhật trong hôm nay ạ.", time: "08:45" },
  ],
};

const MOCK_UNREAD_BY_THREAD = {
  [threadKey("2", "3")]: { "2": 0, "3": 1 },
  [threadKey("2", "4")]: { "2": 0, "4": 1 },
  [threadKey("1", "2")]: { "1": 0, "2": 1 },
};

const formatThreadTime = (time) => time || "--:--";

const MessagePage = () => {
  const { user, role } = useAuth();
  const currentUserId = String(user?.id || "");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");
  
  const messagesEndRef = useRef(null);

  const availablePartners = MOCK_CHAT_USERS.filter((chatUser) => {
    if (!currentUserId || chatUser.id === currentUserId) return false;

    if (role === "HLV") {
      return chatUser.role === "HOIVIEN" && String(chatUser.hlv_id) === currentUserId;
    }

    if (role === "HOIVIEN") {
      return chatUser.role === "HLV" && chatUser.id === String(user?.hlv_id || "");
    }

    return true;
  });

  const conversations = availablePartners
    .map((partner) => {
      const key = threadKey(currentUserId, partner.id);
      const threadMessages = messages[key] || [];
      const lastMessage = threadMessages[threadMessages.length - 1];

      return {
        id: partner.id,
        name: partner.name,
        avatar: partner.avatar,
        avatarColor: partner.avatarColor,
        time: formatThreadTime(lastMessage?.time),
        lastMessage: lastMessage?.text || "Chưa có tin nhắn",
        unread: MOCK_UNREAD_BY_THREAD[key]?.[currentUserId] || 0,
      };
    })
    .filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    if (activeChatId && !conversations.some((chat) => chat.id === activeChatId)) {
      setActiveChatId(null);
    }
  }, [activeChatId, conversations]);

  // Lấy thông tin người đang chat cùng
  const activeChatData = conversations.find(c => c.id === activeChatId);
  const activeThreadId = activeChatId ? threadKey(currentUserId, activeChatId) : null;
  const currentMessages = activeThreadId ? messages[activeThreadId] || [] : [];

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
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (!activeThreadId) return;

    setMessages(prev => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMessage]
    }));
    setInputText("");
  };

  return (
    <div className="w-full p-4 font-figtree h-[calc(100vh-80px)] min-h-0">
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
            {conversations.map((chat) => (
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

            {conversations.length === 0 && (
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
                {currentMessages.map((msg) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div 
                        className={`max-w-[70%] px-5 py-3 text-sm ${
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
                })}
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