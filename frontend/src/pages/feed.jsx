import { useState } from "react";
import { useAuth } from "@/providers/auth.providers";
import PostCreate from "@/features/post/postCreate";
import PostList from "@/features/post/PostList";

const Feed = () => {
  const { user, role } = useAuth();
  console.log("Current User Data:", user);
  // Dữ liệu Mock ban đầu
  const [posts, setPosts] = useState([
    {
      id: 1,
      author_name: "Admin ONUS",
      role: "ADMIN",
      created_at: "19:38 03/02/2026",
      content: "Thứ 7 này phòng tập sẽ đóng cửa để bảo trì. Mọi người lưu ý nhé!",
      likes: 5,
      comment_count: 2,
      comments_data: [
        { id: 1, user: "HLV Trần B", text: "Đã nhận thông tin ạ!" }
      ]
    },
    {
      id: 2,
      author_name: "HLV Trần B",
      role: "HLV",
      hlv_id: 2, // Giả sử ID HLV là 2
      created_at: "18:38 04/02/2026",
      content: "Hôm nay phòng tập rất sôi động! Chúc mọi người một ngày làm việc hiệu quả.",
      likes: 12,
      comment_count: 0
    }
  ]);

  // LOGIC NGHIỆP VỤ: Lọc bài đăng hiển thị
  const displayPosts = posts.filter(post => {
    if (role === "ADMIN") return true; // Admin thấy hết
    if (post.role === "ADMIN") return true; // Ai cũng thấy bài Admin

    if (role === "HLV") {
      return String(post.hlv_id) === String(user.id) || String(post.author_id) === String(user.id); // HLV thấy bài của mình
    }

    if (role === "HOIVIEN") {
      return String(post.hlv_id) === String(user.hlv_id);
    }
    return false;
  });

  const addNewPost = (newPost) => {
    setPosts([newPost, ...posts]); // Đưa bài mới lên đầu
  };

  const handleUpdatePost = (postId, newContent) => {
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, content: newContent } : p)
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