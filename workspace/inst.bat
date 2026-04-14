@echo off
setlocal
title Restore Media ^& Seed Data - ONUS Fitness System

echo ======================================================
echo   KHOI PHOI CAU TRUC MEDIA ^& SEED DATA
echo ======================================================

:: 1. Xu ly Backend
echo.
echo [1/2] Dang thiet lap du lieu cho Backend...
cd backend

:: Tao lai cac thu muc media bi git xoa
echo --- Dang tao lai cau truc thu muc media...
if not exist media (
    mkdir media
)
:: Tao cac folder con ben trong media (dua theo cau truc project cua ban)
if not exist media\posts (
    mkdir media\posts
    echo     + Da tao media/posts
)

:: Kiem tra va kich hoat moi truong ao
if exist .venv (
    echo --- Dang kich hoat moi truong ao .venv...
    call .venv\Scripts\activate
) else (
    echo [CANH BAO] Khong tim thay .venv, dang tien hanh tao moi va cai dat...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
)

:: Thuc hien cac lenh Database
echo --- Dang kiem tra va migrate database...
python manage.py migrate

:: Chay Seed Data
:: Luu y: Dam bao ban da co file seed_data.json hoac script seed_data.py
if exist seed_data.json (
    echo --- Dang nap du lieu mau tu seed_data.json...
    python manage.py loaddata seed_data.json
) else (
    echo --- Dang chay lenh seed_data tu management command...
    :: Theo cay thu mục cua ban: backend/accounts/management/commands/seed_data.py
    python manage.py seed_data
)

cd ..

:: 2. Xu ly Frontend
echo.
echo [2/2] Dang thiet lap Frontend...
cd frontend
if not exist node_modules (
    echo --- Dang tai thu vien node_modules (Vite)...
    call npm install
) else (
    echo --- node_modules da ton tai, bo qua cai dat.
)
cd ..

:: 3. Hoan tat
echo.
echo ======================================================
echo   HOAN TAT!
echo   - Da tao cac thu muc: backend/media, backend/media/posts
echo   - Da chay Seed Data thanh cong.
echo   - Luu y: Cac file .env chua duoc khoi tao (vui long tu dien).
echo ======================================================
pause