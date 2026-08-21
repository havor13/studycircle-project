from django.urls import path
from .views import recommendations, search

urlpatterns = [
    path('search/', search, name='search'),
    path('recommendations/', recommendations, name='recommendations'),
]
