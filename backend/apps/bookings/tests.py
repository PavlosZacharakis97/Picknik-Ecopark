from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Cottage, Review, Favorite
from .services import calculate_booking_price

User = get_user_model()


def make_cottage(**kwargs):
    defaults = {
        'name': 'Тестовый домик',
        'number': kwargs.pop('number', 1),
        'price_per_night': Decimal('1000.00'),
        'max_guests': 4,
    }
    defaults.update(kwargs)
    return Cottage.objects.create(**defaults)


class PriceCalculationTests(TestCase):
    def test_promo_code_applies_discount(self):
        cottage = make_cottage()
        price = calculate_booking_price(
            cottage, date(2026, 1, 1), date(2026, 1, 4), guests=2, promo_code='PIKNIK10',
        )
        self.assertEqual(price['nights'], 3)
        self.assertEqual(price['subtotal'], 3000.0)
        self.assertEqual(price['discount'], 300.0)
        self.assertEqual(price['total_price'], 2700.0)

    def test_no_discount_without_promo_code(self):
        cottage = make_cottage()
        price = calculate_booking_price(cottage, date(2026, 1, 1), date(2026, 1, 2), guests=1)
        self.assertEqual(price['discount'], 0)
        self.assertEqual(price['total_price'], 1000.0)


class BookingReferralCommissionTests(TestCase):
    def test_booking_pays_referrer_commission(self):
        referrer = User.objects.create_user(username='ref@test.com', email='ref@test.com', password='pass12345', referral_code='REFCODE1')
        user = User.objects.create_user(username='guy@test.com', email='guy@test.com', password='pass12345')
        cottage = make_cottage()

        client = APIClient()
        client.force_authenticate(user)
        resp = client.post('/api/bookings/create/', {
            'cottage': cottage.id,
            'check_in': str(date.today() + timedelta(days=10)),
            'check_out': str(date.today() + timedelta(days=12)),
            'guests': 2,
            'promo_code': 'REFCODE1',
        }, format='json')

        self.assertEqual(resp.status_code, 201, resp.data)

        referrer.refresh_from_db()
        # 2 ночи * 1000 = 2000, минус 10% реферальная скидка = 1800; комиссия 15% от 1800 = 270
        self.assertEqual(referrer.balance, Decimal('270.00'))


class ReviewUniquenessTests(TestCase):
    def test_second_review_for_same_cottage_is_rejected(self):
        user = User.objects.create_user(username='u@test.com', email='u@test.com', password='pass12345')
        cottage = make_cottage()
        Review.objects.create(cottage=cottage, user=user, rating=5)

        client = APIClient()
        client.force_authenticate(user)
        resp = client.post('/api/reviews/create/', {'cottage': cottage.id, 'rating': 3}, format='json')

        self.assertEqual(resp.status_code, 400)
        self.assertEqual(Review.objects.filter(cottage=cottage, user=user).count(), 1)


class FavoriteTests(TestCase):
    def test_toggle_adds_then_removes(self):
        user = User.objects.create_user(username='fav@test.com', email='fav@test.com', password='pass12345')
        cottage = make_cottage()

        client = APIClient()
        client.force_authenticate(user)

        resp = client.post('/api/favorites/toggle/', {'cottage': cottage.id}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['favorited'])
        self.assertTrue(Favorite.objects.filter(user=user, cottage=cottage).exists())

        resp = client.post('/api/favorites/toggle/', {'cottage': cottage.id}, format='json')
        self.assertFalse(resp.data['favorited'])
        self.assertFalse(Favorite.objects.filter(user=user, cottage=cottage).exists())
