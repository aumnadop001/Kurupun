from rest_framework import serializers
from .models import DocumentRegistry


class DocumentRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRegistry
        fields = '__all__'
