from decimal import Decimal

from apps.core.services.wallet import debit_balance

from .models import Withdrawal

MIN_WITHDRAWAL_AMOUNT = Decimal('500')
WITHDRAWAL_COMMISSION_RATE = Decimal('0.10')


def request_withdrawal(user, amount, method, card_last4=''):
    amount = Decimal(amount)
    if amount < MIN_WITHDRAWAL_AMOUNT:
        raise ValueError(f'Минимальная сумма вывода — {MIN_WITHDRAWAL_AMOUNT} руб')
    if amount > user.balance:
        raise ValueError('Недостаточно средств на балансе')

    commission_amount = (amount * WITHDRAWAL_COMMISSION_RATE).quantize(Decimal('0.01'))
    payout_amount = amount - commission_amount

    withdrawal = Withdrawal.objects.create(
        user=user,
        amount=amount,
        commission_amount=commission_amount,
        payout_amount=payout_amount,
        method=method,
        card_last4=card_last4,
    )
    debit_balance(
        user, amount, 'withdrawal', status='pending',
        description='Заявка на вывод средств',
        related_object_type='withdrawal', related_object_id=withdrawal.id,
    )
    return withdrawal
