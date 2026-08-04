import re

from django.contrib.auth import get_user_model

User = get_user_model()


def generate_referral_code(user):
    code = f'REF{user.id:05d}'
    user.referral_code = code
    user.save(update_fields=['referral_code'])
    return code


def get_or_create_user_by_phone(phone_number):
    user = User.objects.filter(phone_number=phone_number).exclude(phone_number='').first()
    if user:
        return user, False

    digits = re.sub(r'\D', '', phone_number)
    email = f'guest_{digits}@guest.piknik-ecopark.ru'
    user = User.objects.create(
        email=email,
        username=email,
        first_name='Гость',
        last_name=phone_number,
        phone_number=phone_number,
    )
    user.set_unusable_password()
    user.save(update_fields=['password'])
    generate_referral_code(user)
    return user, True
