import { useState, useEffect, useRef } from "react"; 
import PostCard from "./PostCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const PostList = ({ posts, onUpdatePost, onDeletePost }) => {
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentInput, setCommentInput] = useState("");
    const [localComments, setLocalComments] = useState([]);
    
    const bottomRef = useRef(null);

    useEffect(() => {
        if (selectedPost) {
            setLocalComments(selectedPost.comments_data || []);
        } else {
            setLocalComments([]);
        }
    }, [selectedPost]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [localComments]); 

    const handleSendComment = () => {
        if (!commentInput.trim()) return;

        const newComment = {
            id: Date.now(), 
            user: "Me", 
            text: commentInput,
        };


        setLocalComments([...localComments, newComment]);

        setCommentInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendComment();
        }
    };

    return (
        <div className="w-full space-y-4">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    onCommentClick={(p) => setSelectedPost(p)}
                    onUpdatePost={onUpdatePost}
                    onDeletePost={onDeletePost}

                />
            ))}

            {/* POPUP CHI TIẾT BÌNH LUẬN */}
            <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
                <DialogContent className="max-w-2xl h-[50vh] p-0 overflow-hidden rounded-2xl flex flex-col">
                    
                    <DialogHeader className="p-4 border-b shrink-0">
                        <DialogTitle className="text-center font-bold text-slate-900">Bài viết của {selectedPost?.author_name}</DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-4"> 
                            <div className="pb-4 flex flex-col">
                                <span className="text-[11px] text-slate-400 mb-1 order-first">
                                    {selectedPost?.created_at}
                                </span>
                                <p className="text-slate-800 text-[15px] leading-relaxed">
                                    {selectedPost?.content}
                                </p>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-4 mb-6">
                                <h4 className="font-bold text-slate-900">Bình luận</h4>
                                {localComments.length > 0 ? (
                                    localComments.map(cmt => (
                                        <div key={cmt.id} className="flex gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback>{cmt.user.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="bg-slate-100 p-3 rounded-2xl flex-1">
                                                <p className="text-xs font-bold">{cmt.user}</p>
                                                <p className="text-sm text-slate-800">{cmt.text}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-center py-4">Chưa có bình luận nào.</p>
                                )}
                                <div ref={bottomRef} /> 
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-white shrink-0 mt-auto">
                        <div className="flex gap-3 items-center">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback>Me</AvatarFallback>
                            </Avatar>
                            <input
                                type="text"
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Viết bình luận..."
                                className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-onus-blue"
                            />
                            <button 
                                onClick={handleSendComment}
                                className={`font-bold text-sm px-2 transition-colors ${
                                    commentInput.trim() ? "text-onus-blue cursor-pointer" : "text-slate-300 cursor-not-allowed"
                                }`}
                                disabled={!commentInput.trim()}
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PostList;