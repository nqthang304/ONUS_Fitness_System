import { redirect } from "react-router-dom";

export const authLoader = async () => {
  // Kiểm tra xem có thông tin user trong máy chưa
  const user = localStorage.getItem("onus_user");

  if (!user) {
    // Nếu không có, đá thẳng về trang login
    return redirect("/login");
  }

  return JSON.parse(user);
};

// Loader dành riêng cho trang Login (nếu đã login rồi thì không cho vào trang login nữa)
export const loginLoader = async () => {
  const user = localStorage.getItem("onus_user");
  if (user) {
    return redirect("/");
  }
  return null;
};