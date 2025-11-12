# main/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from main.views import api_root

urlpatterns = [
    path('admin/', admin.site.urls),
    # API root at /api/
    path('api/', api_root),
    # Namespaced includes so reverse() can target them explicitly
    path('api/auth/', include(('src.authentication.urls', 'authentication'), namespace='authentication')),
    path('api/', include(('src.documentRegistry.urls', 'document_registry'), namespace='document_registry')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
