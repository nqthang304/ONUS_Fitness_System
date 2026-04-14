import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth.providers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal, CheckCircle2, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea"; 
import postApi from "@/api/postApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

const PostCard = ({ post, onCommentClick, onUpdatePost, onDeletePost }) => {
  const { user, role } = useAuth();
  const currentRole = String(role || "").toLowerCase();
  const postRole = String(post.role || "").toLowerCase();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageViewerSrc, setImageViewerSrc] = useState(post.image_url || "");
  const [editContent, setEditContent] = useState(post.content);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(post.image_url || "");
  const [removeImage, setRemoveImage] = useState(false);
  const [isLiked, setIsLiked] = useState(Boolean(post.is_liked));
  const [likeCount, setLikeCount] = useState(Number(post.likes || 0));

  useEffect(() => {
    setImageViewerSrc(post.image_url || "");
    setEditContent(post.content);
    setEditImagePreview(post.image_url || "");
    setIsLiked(Boolean(post.is_liked));
    setLikeCount(Number(post.likes || 0));
  }, [post.content, post.image_url, post.likes, post.is_liked]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await postApi.removeInteraction(post.id);
        setLikeCount((current) => Math.max(0, current - 1));
      } else {
        await postApi.addInteraction(post.id);
        setLikeCount((current) => current + 1);
      }

      setIsLiked((current) => !current);
    } catch (error) {
      console.error("Không thể cập nhật tương tác bài viết:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await postApi.deletePost(post.id);
      setIsDeleteOpen(false);

      if (onDeletePost) {
        onDeletePost(post.id);
      }
    } catch (error) {
      console.error("Không thể xóa bài viết:", error);
    }
  };
  const handleSaveEdit = () => {
    if (!editContent.trim() && !editImagePreview) return;

    const formData = new FormData();
    formData.append("content", editContent);

    if (editImageFile) {
      formData.append("image", editImageFile);
    }

    if (removeImage) {
      formData.append("remove_image", "true");
    }

    postApi.updatePost(post.id, formData)
      .then((response) => {
        onUpdatePost?.(post.id, response?.data);
        if (editImagePreview?.startsWith("blob:")) {
          URL.revokeObjectURL(editImagePreview);
        }
        setEditImageFile(null);
        setRemoveImage(false);
        setEditImagePreview(response?.data?.image_url || post.image_url || "");
        setImageViewerSrc(response?.data?.image_url || post.image_url || "");
        setIsEditOpen(false);
      })
      .catch((error) => {
        console.error("Không thể sửa bài viết:", error);
      });
  };
  const isOwner = String(user?.id || "") === String(post.author_id || post.hlv_id || "");
  const canEdit = isOwner;
  const canDelete = currentRole === "admin" || isOwner;
  const showMenu = canEdit || canDelete;

  const handleEditImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setEditImageFile(file);
    setEditImagePreview(previewUrl);
    setRemoveImage(false);
  };

  const handleRemoveEditImage = () => {
    if (editImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditImageFile(null);
    setEditImagePreview("");
    setRemoveImage(true);
  };

  const openImageViewer = (src) => {
    if (!src) return;
    setImageViewerSrc(src);
    setIsImageOpen(true);
  };

  const handleCloseEditDialog = (open) => {
    if (!open) {
      if (editImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(editImagePreview);
      }

      setIsEditOpen(false);
      setEditContent(post.content);
      setEditImageFile(null);
      setEditImagePreview(post.image_url || "");
      setRemoveImage(false);
      setImageViewerSrc(post.image_url || "");
    } else {
      setIsEditOpen(true);
    }
  };

  return (
    <>
      <Card className="w-full rounded-2xl border-slate-100 shadow-sm mb-4 bg-white font-figtree">
        <CardHeader className="flex flex-row items-start justify-between px-4 pt-4 pb-0">
          <div className="flex gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback className="bg-red-600 text-white font-bold text-lg">
                  {post.author_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {/* Icon tích xanh cho Admin */}
              {postRole === "admin" && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 fill-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{post.author_name}</span>
                {postRole === "admin" && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-medium px-2 py-0">
                    Admin
                  </Badge>
                )}
              </div>
              <span className="text-xs text-slate-400">{post.created_at}</span>
            </div>
          </div>
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 -mt-1 -mr-1 h-9 w-9">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-lg border-slate-100 bg-white">

                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => setIsEditOpen(true)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg text-slate-700 focus:bg-slate-100"
                  >
                    <Pencil className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-sm">Chỉnh sửa bài viết</span>
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-sm">Xóa bài viết</span>
                  </DropdownMenuItem>
                )}

              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-1">
          <p className="text-[15px] text-slate-800 leading-relaxed mb-6 whitespace-pre-line break-words">
            {post.content}
          </p>

          {post.image_url && (
            <button
              type="button"
              onClick={() => openImageViewer(post.image_url)}
              className="mb-4 flex w-full justify-start overflow-hidden rounded-2xl text-left"
              aria-label="Xem ảnh bài đăng"
            >
              <img
                src={post.image_url}
                alt="Ảnh bài đăng"
                className="h-24 w-24 shrink-0 rounded-xl object-cover transition-transform duration-300 hover:scale-[1.02] md:h-28 md:w-28"
              />
            </button>
          )}

          <div className="flex justify-between items-center text-slate-400 text-sm mb-4">
            <span>{likeCount} lượt thích</span>
            <span>{post.comment_count || 0} bình luận</span>
          </div>

          <div className="flex items-center gap-1 border-t border-slate-50">
            <Button
              variant="ghost"
              className={cn("flex-1 gap-2 rounded-xl text-slate-600", isLiked && "text-red-500 hover:text-red-200")}
              onClick={handleLike}
            >
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
              <span className="font-semibold text-lg">Thích</span>
            </Button>

            <Button
              variant="ghost"
              className="flex-1 gap-2 rounded-xl text-slate-600"
              onClick={() => {
                onCommentClick(post);
                console.log("Bấm bình luận bài:", post.id);
              }}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-semibold text-lg">Bình luận</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Popup sửa bài viết (AlertDialog) */}
      <Dialog open={isEditOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-hidden rounded-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[calc(90vh-8rem)] overflow-y-auto pr-1">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì?"
              className="min-h-[150px] rounded-xl focus-visible:ring-onus-blue text-[15px] whitespace-pre-wrap"
            />

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <span className="text-sm font-medium text-slate-700">Hình ảnh bài viết</span>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id={`edit-image-${post.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditImageChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => document.getElementById(`edit-image-${post.id}`)?.click()}
                  >
                    Sửa ảnh
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-red-600 hover:text-red-700"
                    onClick={handleRemoveEditImage}
                    disabled={!editImagePreview}
                  >
                    Xóa ảnh
                  </Button>
                </div>
              </div>

              {editImagePreview ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2">
                  <button
                    type="button"
                    onClick={() => openImageViewer(editImagePreview)}
                    className="shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                    aria-label="Phóng to ảnh đang chỉnh sửa"
                  >
                    <img
                      src={editImagePreview}
                      alt="Ảnh đang chỉnh sửa"
                      className="h-20 w-20 object-cover sm:h-24 sm:w-24"
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700">Ảnh đang chọn</p>
                    <p className="text-xs text-slate-400">Bấm vào ảnh để xem phóng to</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Bài viết hiện chưa có ảnh.</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => handleCloseEditDialog(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-onus-blue hover:bg-blue-700 text-white rounded-xl px-8"
              disabled={(!editContent.trim() && !editImagePreview) || (editContent === post.content && editImagePreview === (post.image_url || "") && !removeImage)}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Popup xác nhận xóa bài viết (AlertDialog) */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl max-w-[400px] font-figtree p-5 gap-4">
          <AlertDialogHeader className="items-center text-center sm:group-data-[size=default]/alert-dialog-content:place-items-center sm:group-data-[size=default]/alert-dialog-content:text-center">
            <AlertDialogTitle className="text-center text-lg font-medium leading-snug">Xác nhận xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-slate-500">
              Hành động này sẽ xóa vĩnh viễn bài đăng và dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row w-full items-center gap-3 mt-4 sm:space-x-0">
            <AlertDialogCancel className="flex-1 h-10 mt-0 rounded-xl bg-slate-100 hover:bg-slate-200 border-none text-slate-700 font-medium text-center">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="flex-1 h-10 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-center"
            >
              Xóa bài viết
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {imageViewerSrc && (
        <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
          {isImageOpen && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsImageOpen(false)}
              className="fixed right-4 top-4 z-[60] h-10 w-10 rounded-full bg-white/90 p-0 text-slate-900 shadow-lg hover:bg-white"
              aria-label="Đóng ảnh"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <DialogContent className="flex h-screen w-screen max-h-none max-w-none items-center justify-center border-0 bg-transparent p-0 shadow-none">
            <img
              src={imageViewerSrc}
              alt="Ảnh bài đăng phóng to"
              className="block max-h-[92vh] max-w-[92vw] w-auto object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PostCard;