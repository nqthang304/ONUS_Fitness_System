import { useState } from "react";
import { useAuth } from "@/providers/auth.providers";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // npx shadcn@latest add textarea
import { Image, SendHorizontal, X } from "lucide-react";

const PostCreate = ({ onPostCreated }) => {
  const { user, role } = useAuth();
  const [content, setContent] = useState("");
  const [isExpanding, setIsExpanding] = useState(false);

  // Chỉ Admin và HLV mới được thấy component này
  if (role !== "ADMIN" && role !== "HLV") return null;

  const handlePost = () => {
    if (!content.trim()) return;
    
    // Giả lập tạo bài đăng mới
    const newPost = {
      id: Date.now(),
      author_name: user.tenHienThi,
      author_avatar: "",
      role: role,
      content: content,
      created_at: "Vừa xong",
      likes: 0,
      comment_count: 0
    };

    onPostCreated(newPost);
    setContent("");
    setIsExpanding(false);
  };

  return (
    <Card className="w-full rounded-2xl border-slate-100 shadow-sm mb-1 bg-white overflow-hidden transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="w-11 h-11">
            <AvatarImage src="" />
            <AvatarFallback className="bg-onus-blue text-white font-bold">
              {user?.tenHienThi?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col gap-3">
            <Textarea
              placeholder={`${user?.tenHienThi} ơi, bạn đang nghĩ gì thế?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanding(true)}
              className="min-h-[45px] border-none focus-visible:ring-0 bg-slate-50 rounded-xl resize-none py-3 text-[15px]"
            />

            {isExpanding && (
              <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-slate-500 gap-2 hover:bg-blue-50 hover:text-onus-blue">
                    <Image className="w-5 h-5" />
                    <span className="text-xs font-semibold">Ảnh/Video</span>
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        setIsExpanding(false);
                        setContent("");
                    }}
                    className="text-slate-400"
                  >
                    Hủy
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={!content.trim()}
                    onClick={handlePost}
                    className="bg-onus-blue hover:bg-blue-700 text-white gap-2 rounded-lg px-4"
                  >
                    <span className="font-semibold">Đăng</span>
                    <SendHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCreate;