from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse

from ..forms import DocumentRegisterForm, DocumentEntryFormSet
from ..models import DocumentRegister


# document_register Page
def document_register(request):
    documents = DocumentRegister.objects.all()
    return render(
        request, "pages/document_register/list.html", {"documents": documents}
    )


def document_register_form(request, pk=None):
    """Create or edit a DocumentRegister with its entries using a form + inline formset."""
    instance = None
    if pk:
        instance = get_object_or_404(DocumentRegister, pk=pk)

    if request.method == "POST":
        form = DocumentRegisterForm(request.POST, request.FILES, instance=instance)
        formset = DocumentEntryFormSet(request.POST, request.FILES, instance=instance)
        if form.is_valid() and formset.is_valid():
            reg = form.save()
            formset.instance = reg
            formset.save()
            return redirect(reverse("document_register"))
    else:
        form = DocumentRegisterForm(instance=instance)
        formset = DocumentEntryFormSet(instance=instance)

    return render(
        request,
        "pages/document_register/form.html",
        {"form": form, "formset": formset, "instance": instance},
    )


def document_register_delete(request, pk):
    """Delete a DocumentRegister instance. Only accepts POST to perform deletion."""
    instance = get_object_or_404(DocumentRegister, pk=pk)
    if request.method == "POST":
        instance.delete()
    return redirect(reverse("document_register"))
