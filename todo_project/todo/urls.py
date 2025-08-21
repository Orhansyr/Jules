from django.urls import path
from .views import TodoView, TodoDetailView, ContactView

urlpatterns = [
    path('', TodoView.as_view(), name='todo_list_create'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('<int:pk>/', TodoDetailView.as_view(), name='todo_detail'),
]
