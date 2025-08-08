from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from .models import Todo
import json

class TodoView(View):
    def get(self, request):
        # If the request is an AJAX request, return JSON
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            todos = list(Todo.objects.order_by('id').values())
            return JsonResponse(todos, safe=False)
        # Otherwise, render the template
        return render(request, 'index.html')

    def post(self, request):
        data = json.loads(request.body)
        title = data.get('title')
        if title:
            todo = Todo.objects.create(title=title)
            return JsonResponse({'id': todo.id, 'title': todo.title, 'completed': todo.completed}, status=201)
        return JsonResponse({'error': 'Title is required'}, status=400)

class TodoDetailView(View):
    def put(self, request, pk):
        try:
            todo = Todo.objects.get(pk=pk)
            data = json.loads(request.body)

            # Update title if provided
            if 'title' in data:
                todo.title = data['title']

            # Toggle completed status if provided
            if 'completed' in data:
                todo.completed = data['completed']

            todo.save()
            return JsonResponse({'id': todo.id, 'title': todo.title, 'completed': todo.completed})
        except Todo.DoesNotExist:
            return JsonResponse({'error': 'Todo not found'}, status=404)

    def delete(self, request, pk):
        try:
            todo = Todo.objects.get(pk=pk)
            todo.delete()
            return JsonResponse({'message': 'Todo deleted successfully'}, status=204) # 204 No Content
        except Todo.DoesNotExist:
            return JsonResponse({'error': 'Todo not found'}, status=404)
