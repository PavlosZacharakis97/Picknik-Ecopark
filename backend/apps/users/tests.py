from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from .models import PhoneVerificationCode


class PhoneVerifyCodeTests(TestCase):
    def test_code_cannot_be_verified_twice(self):
        PhoneVerificationCode.objects.create(
            phone_number='+79991234567', code='1234',
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        client = APIClient()
        payload = {'phone_number': '+79991234567', 'code': '1234'}

        first = client.post('/api/auth/phone/verify-code/', payload, format='json')
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.data['verified'])

        second = client.post('/api/auth/phone/verify-code/', payload, format='json')
        self.assertEqual(second.status_code, 400)
