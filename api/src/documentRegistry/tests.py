from django.test import TestCase
from rest_framework.test import APIClient
from .models import DocumentRegistry


class DocumentRegistryAPITest(TestCase):
	def setUp(self):
		self.client = APIClient()
		DocumentRegistry.objects.create(
			registry_number='R-001',
			registration_date='2025-01-01',
			document_title='Test Doc',
			sender='Alice',
			first_item='Item 1',
			storage_date='2025-01-02',
			related_document_number='RD-1',
			withdrawal_set_number='WS-1',
		)

	def test_list_document_registries(self):
		resp = self.client.get('/api/document-registries/')
		self.assertEqual(resp.status_code, 200)
		data = resp.json()
		# router returns a list of objects
		self.assertIsInstance(data, list)
		self.assertEqual(len(data), 1)
		self.assertEqual(data[0]['registry_number'], 'R-001')
