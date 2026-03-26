import { useState } from "react";
import { useAuth } from "@/providers/auth.providers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea"; 
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
} from "@/components/ui/alert-dialog";

const PostCard = ({ post, onCommentClick, onUpdatePost, onDeletePost }) => {
  const { user, role } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleDeleteConfirm = () => {
    console.log("Xóa bài viết:", post.id);
    setIsDeleteOpen(false);
    if (onDeletePost) {
      onDeletePost(post.id);
    }
  };
  const handleSaveEdit = () => {
    if (!editContent.trim()) return;

    console.log("Lưu nội dung mới:", editContent);
    if (onUpdatePost) {
      onUpdatePost(post.id, editContent);
    }
    setIsEditOpen(false);
  };
  const isOwner = user?.id === post.hlv_id || user?.id === post.id;
  const canEdit = isOwner;
  const canDelete = role === "ADMIN" || isOwner;
  const showMenu = canEdit || canDelete;

  return (
    <>
      <Card className="w-full rounded-2xl border-slate-100 shadow-sm mb-4 bg-white font-figtree">
        <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
          <div className="flex gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback className="bg-red-600 text-white font-bold text-lg">
                  {post.author_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {/* Icon tích xanh cho Admin */}
              {post.role === "ADMIN" && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 fill-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{post.author_name}</span>
                {post.role === "ADMIN" && (
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

        <CardContent className="p-4 pt-2">
          <p className="text-[15px] text-slate-800 leading-relaxed mb-6">
            {post.content}
          </p>

          <div className="flex justify-between items-center text-slate-400 text-sm mb-4">
            <span>{post.likes + (isLiked ? 1 : 0)} lượt thích</span>
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
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[525px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì?"
              className="min-h-[150px] rounded-xl focus-visible:ring-onus-blue text-[15px]"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-onus-blue hover:bg-blue-700 text-white rounded-xl px-8"
              disabled={!editContent.trim() || editContent === post.content}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Popup xác nhận xóa bài viết (AlertDialog) */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl max-w-[400px] font-figtree p-5 gap-4">
          <AlertDialogHeader className="items-center text-center">
            <AlertDialogTitle className="text-center text-lg font-medium leading-snug">Xác nhận xóa bài viết?</AlertDialogTitle>
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
    </>
  );
};

export default PostCard;