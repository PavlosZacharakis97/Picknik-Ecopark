from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.bookings.urls')),
    path('api/wallet/', include('apps.wallet.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/content/', include('apps.content.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='spa'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])