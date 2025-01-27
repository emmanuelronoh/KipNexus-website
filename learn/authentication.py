from rest_framework.authentication import BaseAuthentication
from django.contrib.sessions.models import Session
from rest_framework import exceptions
from django.conf import settings
from .models import User

class HeaderSessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        session_key = request.META.get("HTTP_X_SESSION_ID")
        if not session_key:
            return None
        
        try:
            session = Session.objects.get(session_key=session_key)
            user_id = session.get_decoded().get("_auth_user_id")
            user = User.objects.get(pk=user_id)
            return (user, None)
        except (Session.DoesNotExist, User.DoesNotExist):
            raise exceptions.AuthenticationFailed("Invalid or expired session.")