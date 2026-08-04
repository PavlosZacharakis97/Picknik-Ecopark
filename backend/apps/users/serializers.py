from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

from .services import generate_referral_code

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    ref_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'password', 'ref_code']

    def create(self, validated_data):
        ref_code = validated_data.pop('ref_code', '')
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['username'] = validated_data['email']
        if ref_code:
            referrer = User.objects.filter(referral_code=ref_code).first()
            if referrer:
                validated_data['referred_by'] = referrer
        user = super().create(validated_data)
        generate_referral_code(user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number', 'balance',
            'referral_code', 'payout_method', 'payout_card_last4', 'created_at',
        ]
        read_only_fields = ['balance', 'referral_code', 'created_at']


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class PhoneSendCodeSerializer(serializers.Serializer):
    phone_number = serializers.RegexField(r'^\+?\d{10,15}$')


class PhoneVerifyCodeSerializer(serializers.Serializer):
    phone_number = serializers.RegexField(r'^\+?\d{10,15}$')
    code = serializers.CharField(max_length=4)