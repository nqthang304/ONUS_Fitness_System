"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from accounts.views import AccountDetailView, AccountListView, AccountStatusView, ChangePasswordView, CustomLoginView, SelfProfileUpdateView, TrainerMemberListView, UserProfileView
from social.views import BaiDangBinhLuanView, BaiDangDeleteView, BaiDangFeedView, BaiDangTuongTacView, TinNhanConversationView, TinNhanMessageView
from fitness.views import (
    LichTapByRoleView,
    CreateLichTapView,
    DeleteLichTapView,
    BaiTapByUserIdView,
    CreateBaiTapView,
    CreateChiTietBaiTapView,
    DeleteBaiTapView,
    DeleteChiTietBaiTapView,
    BuaAnByUserIdView,
    CreateBuaAnView,
    CreateChiTietBuaAnView,
    DeleteBuaAnView,
    DeleteChiTietBuaAnView,
    CreateChiSoCoTheView,
    DeleteChiSoCoTheView,
    ChiSoCoTheByUserIdView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', CustomLoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/trainer/my-members/', TrainerMemberListView.as_view(), name='trainer-members'),
    path('api/posts/', BaiDangFeedView.as_view(), name='post-feed'),
    path('api/posts/<int:post_id>/', BaiDangDeleteView.as_view(), name='post-delete'),
    path('api/posts/<int:post_id>/interactions/', BaiDangTuongTacView.as_view(), name='post-interactions'),
    path('api/posts/<int:post_id>/comments/', BaiDangBinhLuanView.as_view(), name='post-comments'),
    path('api/messages/conversations/', TinNhanConversationView.as_view(), name='message-conversations'),
    path('api/messages/', TinNhanMessageView.as_view(), name='messages'),
    path('api/accounts/', AccountListView.as_view(), name='account-list'),
    path('api/accounts/<int:user_id>/', AccountDetailView.as_view(), name='account-detail'),
    path('api/accounts/<int:user_id>/status/', AccountStatusView.as_view(), name='account-status'),
    path('api/profile/update/', SelfProfileUpdateView.as_view(), name='self-profile-update'),
    path('api/lich-tap/', LichTapByRoleView.as_view(), name='lich-tap-by-role'),
    path('api/lich-tap/create/', CreateLichTapView.as_view(), name='create-lich-tap'),
    path('api/lich-tap/delete/<int:schedule_id>/', DeleteLichTapView.as_view(), name='delete-lich-tap'),
    path('api/bai-tap/user/<int:user_id>/', BaiTapByUserIdView.as_view(), name='bai-tap-by-user-id'),
    path('api/bai-tap/create-day/', CreateBaiTapView.as_view(), name='create-bai-tap-day'),
    path('api/bai-tap/create-exercise/', CreateChiTietBaiTapView.as_view(), name='create-bai-tap-exercise'),
    path('api/bai-tap/delete-day/<int:baitap_id>/', DeleteBaiTapView.as_view(), name='delete-bai-tap-day'),
    path('api/bai-tap/delete-exercise/<int:detail_id>/', DeleteChiTietBaiTapView.as_view(), name='delete-bai-tap-exercise'),
    path('api/lich-an/user/<int:user_id>/', BuaAnByUserIdView.as_view(), name='lich-an-by-user-id'),
    path('api/lich-an/create-meal/', CreateBuaAnView.as_view(), name='create-bua-an'),
    path('api/lich-an/create-food/', CreateChiTietBuaAnView.as_view(), name='create-chi-tiet-bua-an'),
    path('api/lich-an/delete-meal/<int:bua_an_id>/', DeleteBuaAnView.as_view(), name='delete-bua-an'),
    path('api/lich-an/delete-food/<int:detail_id>/', DeleteChiTietBuaAnView.as_view(), name='delete-chi-tiet-bua-an'),
    path('api/chi-so-co-the/create/', CreateChiSoCoTheView.as_view(), name='create-chi-so-co-the'),
    path('api/chi-so-co-the/delete/<int:chisocothe_id>/', DeleteChiSoCoTheView.as_view(), name='delete-chi-so-co-the'),
    path('api/chi-so-co-the/user/<int:user_id>/', ChiSoCoTheByUserIdView.as_view(), name='chi-so-co-the-by-user-id'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
