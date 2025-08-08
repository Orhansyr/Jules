from django.urls import path
from .views import TodoView, TodoDetailView

urlpatterns = [
    path('', TodoView.as_view(), name='todo_list_create'),
    path('<int:pk>/', TodoDetailView.as_view(), name='todo_detail'),
]
