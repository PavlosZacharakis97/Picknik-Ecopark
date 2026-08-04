from django.utils import timezone
from rest_framework import serializers
from .models import Cottage, Booking, Review

ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'paid']


class OccupiedUntilMixin(serializers.Serializer):
    occupied_until = serializers.SerializerMethodField()

    def get_occupied_until(self, obj):
        booking = obj.bookings.filter(
            status__in=ACTIVE_BOOKING_STATUSES,
            check_out__gte=timezone.now().date(),
        ).order_by('check_out').first()
        return booking.check_out if booking else None


class CottageSerializer(OccupiedUntilMixin, serializers.ModelSerializer):
    class Meta:
        model = Cottage
        fields = '__all__'


class CottageListSerializer(OccupiedUntilMixin, serializers.ModelSerializer):
    class Meta:
        model = Cottage
        fields = ['id', 'number', 'name', 'cottage_type', 'price_per_night', 'max_guests', 'image', 'is_active', 'latitude', 'longitude', 'occupied_until']


class BookingSerializer(serializers.ModelSerializer):
    cottage_name = serializers.CharField(source='cottage.name', read_only=True)
    cottage_number = serializers.IntegerField(source='cottage.number', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'cottage', 'cottage_name', 'cottage_number', 'check_in', 'check_out', 'guests', 'total_price', 'status', 'promo_code', 'notes', 'created_at']
        read_only_fields = ['user', 'total_price', 'status']


class BookingCreateSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True)
    verification_code = serializers.CharField(required=False, allow_blank=True)
    balance_amount_used = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)

    class Meta:
        model = Booking
        fields = ['cottage', 'check_in', 'check_out', 'guests', 'promo_code', 'notes', 'phone_number', 'verification_code', 'balance_amount_used']

    def validate(self, attrs):
        request = self.context.get('request')
        is_authenticated = bool(request and request.user and request.user.is_authenticated)
        if not is_authenticated and not (attrs.get('phone_number') and attrs.get('verification_code')):
            raise serializers.ValidationError('Для бронирования без входа укажите телефон и код подтверждения')
        return attrs


class PriceCalculationSerializer(serializers.Serializer):
    cottage_id = serializers.IntegerField()
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    guests = serializers.IntegerField(min_value=1, default=1)
    promo_code = serializers.CharField(required=False, allow_blank=True)


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'booking', 'user', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']
