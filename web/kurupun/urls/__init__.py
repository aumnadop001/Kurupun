from .login import urlpatterns as login_urlpatterns
from .document_register import urlpatterns as document_register_urlpatterns

urlpatterns = [
    *login_urlpatterns,
    *document_register_urlpatterns,
]
