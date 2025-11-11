from django.urls import path

# from kurupun.views import login, document_register
from kurupun.urls.login import urlpatterns as login_urlpatterns
from kurupun.urls.document_register import urlpatterns as document_register_urlpatterns

urlpatterns = [
    *login_urlpatterns,
    *document_register_urlpatterns,
]
