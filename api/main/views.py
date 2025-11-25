# Django Imports
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create API Root
@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        # use namespaced names defined in main.urls includes
        'register': reverse('authentication:register', request=request, format=format),
        'login': reverse('authentication:token_obtain_pair', request=request, format=format),
        'profile': reverse('authentication:profile', request=request, format=format),
        'document_registries': reverse('document_registry:documentregistry-list', request=request, format=format),
        'inventory': reverse('inventory:inventory-list', request=request, format=format),
        'master': reverse('master:master-list', request=request, format=format),
    })