from django.contrib.auth import get_user_model

from .serializers import ACTIVE_BOOKING_STATUSES

User = get_user_model()

PROMO_DISCOUNTS = {
    'PIKNIK10': 0.10,
    'WELCOME': 0.05,
}
REFERRAL_PROMO_DISCOUNT = 0.10


def find_referrer(promo_code):
    promo_code = (promo_code or '').upper()
    if not promo_code:
        return None
    return User.objects.filter(referral_code=promo_code).first()


def _eligible_for_auto_referral_discount(user):
    if user is None or not user.is_authenticated or not user.referred_by_id:
        return False
    from .models import Booking
    return not Booking.objects.filter(user=user, status__in=ACTIVE_BOOKING_STATUSES).exists()


def calculate_booking_price(cottage, check_in, check_out, guests, promo_code='', user=None):
    if check_out <= check_in:
        raise ValueError('Дата выезда должна быть позже даты заезда')

    nights = (check_out - check_in).days
    total = float(cottage.price_per_night) * nights

    discount = 0
    promo_code_upper = (promo_code or '').upper()
    if promo_code_upper in PROMO_DISCOUNTS:
        discount = total * PROMO_DISCOUNTS[promo_code_upper]
    elif find_referrer(promo_code):
        discount = total * REFERRAL_PROMO_DISCOUNT
    elif _eligible_for_auto_referral_discount(user):
        discount = total * REFERRAL_PROMO_DISCOUNT

    final_price = total - discount

    return {
        'cottage_id': cottage.id,
        'cottage_name': cottage.name,
        'price_per_night': float(cottage.price_per_night),
        'nights': nights,
        'guests': guests,
        'subtotal': round(total, 2),
        'discount': round(discount, 2),
        'total_price': round(final_price, 2),
    }
