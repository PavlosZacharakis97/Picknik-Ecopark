from decimal import Decimal

from django.db import transaction as db_transaction
from django.db.models import F


def credit_balance(user, amount, tx_type, status='completed', description='',
                    related_object_type='', related_object_id=None):
    from apps.wallet.models import Transaction

    amount = Decimal(amount)
    with db_transaction.atomic():
        type(user).objects.filter(pk=user.pk).update(balance=F('balance') + amount)
        user.refresh_from_db(fields=['balance'])
        return Transaction.objects.create(
            user=user,
            type=tx_type,
            amount=amount,
            status=status,
            description=description,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
        )


def debit_balance(user, amount, tx_type, status='completed', description='',
                   related_object_type='', related_object_id=None):
    amount = Decimal(amount)
    if user.balance < amount:
        raise ValueError('Недостаточно средств на балансе')
    return credit_balance(
        user, -amount, tx_type, status=status, description=description,
        related_object_type=related_object_type, related_object_id=related_object_id,
    )
