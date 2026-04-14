import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth.providers";
import PostCreate from "@/features/post/postCreate";
import PostList from "@/features/post/PostList";
import postApi from "@/api/postApi";

const Feed = () => {
  const { user, role, currentUserId } = useAuth();
  const currentRole = String(role || "").toLowerCase();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await postApi.getPosts();
        setPosts(response?.data || []);
      } catch (error) {
        console.error("Không thể tải danh sách bài đăng:", error);
        setPosts([]);
      }
    };

    loadPosts();
  }, []);

  // LOGIC NGHIỆP VỤ: Lọc bài đăng hiển thị
  const displayPosts = posts.filter(post => {
    const postRole = String(post.role || "").toLowerCase();

    if (currentRole === "admin") return true; // Admin thấy hết
    if (postRole === "admin") return true; // Ai cũng thấy bài Admin

    if (currentRole === "hlv") {
      return String(post.hlv_id) === String(currentUserId) || String(post.author_id) === String(currentUserId); // HLV thấy bài của mình
    }

    if (currentRole === "hoivien") {
      return String(post.hlv_id) === String(user?.hlv_id || "");
    }
    return false;
  });

  const addNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]); // Đưa bài mới lên đầu
  };

  const handleUpdatePost = (postId, newContent) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        if (typeof newContent === "string") {
          return { ...post, content: newContent };
        }

        return {
          ...post,
          ...newContent,
          content: newContent?.content ?? post.content,
          image_url: newContent?.image_url !== undefined ? newContent.image_url : post.image_url,
        };
      })
    );
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="flex flex-col gap-3 w-full p-4">
      <header className="flex flex-col gap-1 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Trang chủ</h2>
        <p className="text-slate-600">Chia sẻ thông tin và cập nhật</p>
      </header>
      {/* 1. Phần đăng bài */}
      <PostCreate onPostCreated={addNewPost} />

      {/* 2. Danh sách bài đăng */}
      <PostList
        posts={displayPosts}
        onUpdatePost={handleUpdatePost}
        onDeletePost={handleDeletePost}
      />
    </div>
  );
};

export default Feed;