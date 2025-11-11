from django import forms
from django.forms import inlineformset_factory

from .models import DocumentRegister, DocumentEntry


class DocumentRegisterForm(forms.ModelForm):
    class Meta:
        model = DocumentRegister
        fields = [
            "reg_no",
            "reg_date",
            "filed_date",
            "related_doc_no",
            "withdrawal_set_no",
            "notes",
        ]
        widgets = {
            "reg_date": forms.DateInput(attrs={"type": "date", "class": "form-control"}),
            "filed_date": forms.DateInput(attrs={"type": "date", "class": "form-control"}),
            "reg_no": forms.TextInput(attrs={"class": "form-control"}),
            "related_doc_no": forms.TextInput(attrs={"class": "form-control"}),
            "withdrawal_set_no": forms.TextInput(attrs={"class": "form-control"}),
            "notes": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
        }


class DocumentEntryForm(forms.ModelForm):
    class Meta:
        model = DocumentEntry
        fields = ["title", "order", "content", "attached_file"]
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control"}),
            "order": forms.NumberInput(attrs={"class": "form-control", "min": 0}),
            "content": forms.Textarea(attrs={"class": "form-control", "rows": 2}),
            "attached_file": forms.ClearableFileInput(attrs={"class": "form-control-file"}),
        }


DocumentEntryFormSet = inlineformset_factory(
    DocumentRegister,
    DocumentEntry,
    form=DocumentEntryForm,
    extra=1,
    can_delete=True,
)
