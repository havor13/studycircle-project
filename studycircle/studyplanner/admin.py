from django.contrib import admin
from .models import Task, Event

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'due_date', 'completed', 'owner', 'group')
    list_filter = ('completed', 'due_date', 'group')
    search_fields = ('title', 'description')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_time', 'end_time', 'group')
    list_filter = ('start_time', 'end_time', 'group')
    search_fields = ('name',)
