import jwt
import logging
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.mixins import CreateModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.pagination import PageNumberPagination
from .models import User, Course
from .serializers import *
from Aestheitos import settings

# Documentation for Creating Custom Mixins
# https://www.django-rest-framework.org/api-guide/generic-views/#creating-custom-mixins

# def instructor_authentication(request):
#     """
#     Validating token for authentication purposes.

#     Checking if user is an instructor and logged in

#     return user instance
#     """

#     token = request.COOKIES.get("jwt")

#     if not token:
#         raise AuthenticationFailed("Unauthenticated!")

#     try:
#         payload = jwt.decode(token, key="secret", algorithms=["HS256"])
#     except jwt.ExpiredSignatureError:
#         raise AuthenticationFailed("Unauthenticated!")

#     user = User.objects.filter(id=payload["id"]).first()

#     # check if user is an instructor
#     if not user.is_instructor:
#         raise AuthenticationFailed(
#             "Unauthenticated! non-instructors not allowed to POST/PUT/DELETE"
#         )

#     return user


def user_authentication(request):
    """
    Validating token for authentication purposes.
    Ensure that the user is logged in and JWT is not tampered.

    return user instance
    """
    browser: str = get_browser(request)
    if browser == "firefox":
        token = request.COOKIES.get("access")

        if not token:
            raise AuthenticationFailed("Unauthenticated!")

        try:
            payload = jwt.decode(token, key=settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated!")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token!")

        user = User.objects.filter(id=payload["user_id"]).first()

        return user

    # probably google chrome or safari, and other browser that are so strict to cookies sigh
    if not request.user.is_authenticated:
        raise AuthenticationFailed("Unauthenticated!")
    return request.user


def get_auth_user(request):
    """
    User-look-up function. returns the user instance based on the request.user's JWT payload
    """
    browser: str = get_browser(request)
    if browser == "firefox":
        token = request.COOKIES.get("access")

        if not token:
            return None

        try:
            payload = jwt.decode(token, key=settings.SECRET_KEY, algorithms=["HS256"])
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None

        user = User.objects.filter(id=payload["user_id"]).first()

        return user

    # probably google chrome or safari, and other browser that are so strict to cookies sigh
    if not request.user.is_authenticated:
        return None
    return request.user


def is_valid_ownership(user, course_id):
    """
    we check if this course belongs to the instructor(creator of the course)
    """

    # retrieve the course object or instance
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    if user != course.created_by:
        return False

    return True


class CreateAPIMixin(CreateModelMixin):
    """
    Apply this mixin for APIView that requires authentication before creating
    This is to override exisitng create method (Polymorphism).
    """

    def perform_create(self, serializer):
        user = user_authentication(self.request)

        # Check daily limit for Course Creation
        from learn.serializers import (
            CourseSerializer,
        )  # solution to NameError: name 'CourseSerializer' is not defined

        if isinstance(serializer, CourseSerializer):
            serializer.check_daily_limit(user)
        # checking for additional arguements i.e pk so that our method will be flexible/ resuable for different serializers
        parameters = inspect.signature(serializer.save_with_auth_user).parameters
        if "pk" in parameters:
            try:
                serializer.save_with_auth_user(user, self.kwargs["pk"])
            except KeyError:
                serializer.save_with_auth_user(user, None)
        else:
            serializer.save_with_auth_user(user)


class UpdateAPIMixin(UpdateModelMixin):
    """
    Apply this mixin for instances tat requires authentication before updating.
    Override exisitng update method (Polymorphism).
    """

    def perform_update(self, serializer):
        user = user_authentication(self.request)
        serializer.save_with_auth_user(user, self.kwargs["pk"], update=True)


class DeleteAPIMixin(DestroyModelMixin):
    """
    Apply this mixin for instances that requires authentication before deleting.
    Ovveride existing delete method (Polymorphism)
    """

    def perform_destroy(self, instance):
        user = user_authentication(self.request)
        instance.delete_with_auth_user(user)


class CourseLookupMixin:
    """
    Apply this mixin to a view that depends on the course_id (i.e CourseContentDetail) for retrieving the snippet instance or object.
    """

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, course=self.kwargs["pk"])
        return obj


class CourseResultsPagination(PageNumberPagination):
    page_size = 15


class BlogResultsPagination(PageNumberPagination):
    page_size = 10


logger = logging.getLogger(__name__)


def get_browser(request):
    user_agent = request.META.get("HTTP_USER_AGENT", "").lower()
    logger.debug(f"User Agent: {user_agent}")

    is_firefox = "firefox" in user_agent
    logger.debug(f"Is Firefox: {is_firefox}")

    return "firefox" if is_firefox else "other"
