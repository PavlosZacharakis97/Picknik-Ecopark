import logging

logger = logging.getLogger('sms')


def send_sms(phone_number, message):
    logger.info('SMS to %s: %s', phone_number, message)
    print(f'[SMS] -> {phone_number}: {message}')
