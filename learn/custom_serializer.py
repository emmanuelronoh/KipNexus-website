from rest_framework import serializers
from .models import User

# it's entity is to only provide an example for extend schema's request  body
# it's for methods' that don't have serializer specified 

class LoginCustomSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "password"]

class LogoutCustomSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = []