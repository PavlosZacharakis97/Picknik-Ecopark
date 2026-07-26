from rest_framework import serializers
from .models import Cottage, Booking, Review


class CottageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cottage
        fields = '__all__'


class CottageListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cottage
        fields = ['id', 'number', 'name', 'cottage_type', 'price_per_night', 'max_guests', 'image', 'is_active', 'latitude', 'longitude']


class BookingSerializer(serializers.ModelSerializer):
    cottage_name = serializers.CharField(source='cottage.name', read_only=True)
    cottage_number = serializers.IntegerField(source='cottage.number', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'cottage', 'cottage_name', 'cottage_number', 'check_in', 'check_out', 'guests', 'total_price', 'status', 'promo_code', 'notes', 'created_at']
        read_only_fields = ['user', 'total_price', 'status']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['cottage', 'check_in', 'check_out', 'guests', 'promo_code', 'notes']


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