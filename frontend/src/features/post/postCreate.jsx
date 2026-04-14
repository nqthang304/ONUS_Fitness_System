import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/auth.providers";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // npx shadcn@latest add textarea
import { ImagePlus, SendHorizontal, X } from "lucide-react";
import postApi from "@/api/postApi";

const resolveDisplayName = (user) => {
  if (!user) return "Người dùng";

  const displayName =
    user.tenHienThi ||
    user.ho_ten ||
    user.HoTen ||
    user.full_name ||
    user.account_info?.HoTen ||
    user.account_info?.ho_ten ||
    user.username ||
    "Người dùng";

  return String(displayName).trim() || "Người dùng";
};

const PostCreate = ({ onPostCreated }) => {
  const { user, role } = useAuth();
  const currentRole = String(role || "").toLowerCase();
  const [content, setContent] = useState("");
  const [isExpanding, setIsExpanding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  // Chỉ Admin và HLV mới được thấy component này
  if (currentRole !== "admin" && currentRole !== "hlv") return null;

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  const resetForm = () => {
    setContent("");
    setIsExpanding(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setIsExpanding(true);
  };

  const handlePost = () => {
    if (!content.trim() && !selectedImage) return;

    const formData = new FormData();
    formData.append("content", content);

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    postApi.createPost(formData)
      .then((response) => {
        onPostCreated?.(response?.data);
        resetForm();
      })
      .catch((error) => {
        console.error("Không thể tạo bài đăng:", error);
      });
  };

  return (
    <Card className="w-full rounded-2xl border-slate-100 shadow-sm mb-1 bg-white overflow-hidden transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="w-11 h-11">
            <AvatarImage src="" />
            <AvatarFallback className="bg-onus-blue text-white font-bold">
              {resolveDisplayName(user).charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col gap-3">
            <Textarea
              placeholder={`${resolveDisplayName(user)} ơi, bạn đang nghĩ gì thế?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanding(true)}
              className="min-h-[45px] border-none focus-visible:ring-0 bg-slate-50 rounded-xl resize-none py-3 text-[15px]"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {imagePreviewUrl && (
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <button
                  type="button"
                  className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                  aria-label="Ảnh xem trước"
                >
                  <img
                    src={imagePreviewUrl}
                    alt="Ảnh xem trước"
                    className="h-20 w-20 object-cover sm:h-24 sm:w-24"
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700">Ảnh đã chọn</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
                  aria-label="Xóa ảnh"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {isExpanding && (
              <div className="flex items-center justify-end flex-wrap animate-in fade-in slide-in-from-top-2">                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-500 gap-2"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Ảnh
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        resetForm();
                    }}
                    className="text-slate-400"
                  >
                    Hủy
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={!content.trim() && !selectedImage}
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