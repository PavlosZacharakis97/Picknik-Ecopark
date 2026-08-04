from django.contrib.auth import get_user_model

User = get_user_model()

PROMO_DISCOUNTS = {
    'PIKNIK10': 0.10,
    'WELCOME': 0.05,
}
REFERRAL_PROMO_DISCOUNT = 0.10


def calculate_booking_price(cottage, check_in, check_out, guests, promo_code=''):
    if check_out <= check_in:
        raise ValueError('Дата выезда должна быть позже даты заезда')

    nights = (check_out - check_in).days
    total = float(cottage.price_per_night) * nights * guests

    discount = 0
    promo_code = (promo_code or '').upper()
    if promo_code in PROMO_DISCOUNTS:
        discount = total * PROMO_DISCOUNTS[promo_code]
    elif promo_code and User.objects.filter(referral_code=promo_code).exists():
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
