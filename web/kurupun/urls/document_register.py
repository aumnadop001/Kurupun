from django.urls import path
from kurupun.views import document_register

urlpatterns = [
    path("", document_register.document_register, name="document_register"),  # optional หน้าแรก
    path("document/register/new/", document_register.document_register_form, name="document_register_new"),
    path("document/register/<int:pk>/edit/", document_register.document_register_form, name="document_register_edit"),
    path("document/register/<int:pk>/delete/", document_register.document_register_delete, name="document_register_delete"),
]
