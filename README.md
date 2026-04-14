# 🏋️ ONUS Fitness System

Dự án Fullstack quản lý hệ thống phòng tập Gym.

* **Backend:** Python / Django Rest Framework
* **Frontend:** React / Vite / Tailwind CSS

---

## 📦 Yêu cầu môi trường

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt sẵn:
* **Python** (Khuyên dùng bản 3.10 trở lên)
* **Node.js** (Khuyên dùng bản LTS)

---

## 🚀 Hướng dẫn cài đặt (Dành cho người mới clone)

**Bước 1:** Clone mã nguồn về máy:
```bash
git clone <url-cua-repo>
cd ONUS_Fitness_System
```

**Bước 2:** Khởi tạo hệ thống (Chỉ cần chạy ở lần đầu tiên):
Mở Terminal (PowerShell/CMD), đi tới thư mục `workspace` và chạy lệnh cài đặt:
```bash
cd workspace
./inst
```
*(Nếu bạn dùng CMD truyền thống, hãy gõ `inst.bat`)*

**Script `./inst` sẽ tự động:**
1. Tạo môi trường ảo `.venv` tại thư mục gốc.
2. Cài đặt các thư viện Python.
3. Khôi phục cấu trúc thư mục ảnh (`backend/media/posts`).
4. Khởi tạo Database (Migrate) và tự động nạp dữ liệu mẫu (Seed Data).
5. Cài đặt các thư viện giao diện cho Frontend (`npm install`).

---

## 💻 Khởi động dự án

Sau khi cài đặt xong, mỗi lần muốn code hoặc test, bạn chỉ cần mở Terminal, vào thư mục `workspace` và chạy lệnh:

```bash
cd workspace
./run
```
Script này sẽ tự động kích hoạt môi trường ảo, bật Backend server (cổng `8000`) và Frontend server (cổng `5173`) cùng lúc.

---

## ⚠️ Lưu ý quan trọng

* **Cấu hình môi trường (.env):** Hệ thống cần các biến môi trường để hoạt động. Hãy đảm bảo bạn đã tạo file `.env` ở cả hai thư mục `backend/` và `frontend/` (hãy nhân bản từ file mẫu hoặc liên hệ team để lấy cấu hình chuẩn).
* **Tài khoản Test (Đã được tạo sẵn từ lệnh Seed Data):**
  * **Admin:** SĐT: `0999999999` | Pass: `Abc@12345`
  * **HLV:** SĐT: `0888888888` | Pass: `Abc@12345`
  * **Hội viên:** SĐT: `0777777777` | Pass: `Abc@12345`