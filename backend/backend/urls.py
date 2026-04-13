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
from fitness.views import LichTapByRoleView, CreateLichTapView, DeleteLichTapView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', CustomLoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/trainer/my-members/', TrainerMemberListView.as_view(), name='trainer-members'),
    path('api/accounts/', AccountListView.as_view(), name='account-list'),
    path('api/accounts/<int:user_id>/', AccountDetailView.as_view(), name='account-detail'),
    path('api/accounts/<int:user_id>/status/', AccountStatusView.as_view(), name='account-status'),
    path('api/profile/update/', SelfProfileUpdateView.as_view(), name='self-profile-update'),
    path('api/lich-tap/', LichTapByRoleView.as_view(), name='lich-tap-by-role'),
    path('api/lich-tap/create/', CreateLichTapView.as_view(), name='create-lich-tap'),
    path('api/lich-tap/delete/<int:schedule_id>/', DeleteLichTapView.as_view(), name='delete-lich-tap'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
