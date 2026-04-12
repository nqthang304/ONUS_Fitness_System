import { redirect } from "react-router-dom";

export const authLoader = async () => {
  // Kiểm tra token trong localStorage
  const token = localStorage.getItem("access_token");

  if (!token) {
    // Nếu không có, đá thẳng về trang login
    return redirect("/login");
  }

};

// Loader dành riêng cho trang Login (nếu đã login rồi thì không cho vào trang login nữa)
export const loginLoader = async () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    return redirect("/");
  }
  return null;
};