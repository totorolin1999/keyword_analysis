from django.urls import path
from . import views
from .views import MyTokenObtainPairView

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('', views.apiOverview, name='api-Overview'),
    path('register/', views.register_user, name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('keyword-list/', views.keywordList, name='keyword-list'),
    path('category-list/', views.categoryList, name='category-list'),
    path('stock-chart/', views.stockChart, name='stock-chart'),
    path('track-list/', views.trackList, name='track-list'),
    path('time-list/', views.timeList, name='time-list'),
    path('track-detail/<str:pk>/', views.trackDetail, name='track-detail'),
    path('track-create/', views.trackCreate, name='track-create'),
    path('track-time-create/<str:pk>/', views.trackTimeCreate, name='track-time-create'),
    path('track-delete/<str:pk>/', views.trackDelete, name='track-delete'),
]