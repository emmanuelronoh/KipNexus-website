from rest_framework.serializers import ModelSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers
from django.shortcuts import get_object_or_404
import inspect
from .models import *
from .helpers import is_valid_ownership

#  In Django, a serializer is a way to convert complex data types, like Django models, into Python native datatypes that can then be easily rendered into JSON, XML, or other content types. This process is called serialization.


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class UserDetailSerializer(ModelSerializer):
    user_id = serializers.IntegerField(source="id")

    class Meta:
        model = User
        fields = [
            "user_id",
            "username",
            "first_name",
            "last_name",
            "profile_pic",
            "is_staff",
            "is_superuser",
            "date_joined",
        ]


class UserProgressSerializer(ModelSerializer):
    class Meta:
        model = UserProgress
        fields = "__all__"
        read_only_fields = ["user", "course"]

    def save_with_auth_user(self, user, pk, update=False):

        if update:

            if user != self.instance.user:
                raise AuthenticationFailed("Not allowed to modify")
            self.save()
            return

        course = get_object_or_404(Course, id=pk)
        enrolled = Enrollment.objects.filter(user=user, course=course)
        progress = UserProgress.objects.filter(user=user, course=pk)

        if not enrolled:
            raise AuthenticationFailed("Not allowed to create")
        if progress:
            raise AuthenticationFailed("already created one")

        self.save(user=user, course=course)


class UserSectionSerializer(ModelSerializer):
    class Meta:
        model = UserSection
        fields = "__all__"
        read_only_fields = ["user", "section"]

    def save_with_auth_user(
        self,
        user,
        pk,
        update=False,
    ):
        self.save()  # save immediately so that the UserSection instance's sections, when filtered, are up to date.
        if update:
            section = get_object_or_404(Section, id=pk)
            user_progress = UserProgress.objects.get(
                user=user, course=section.course_content.course.id
            )
            user_progress.sections_completed = UserSection.objects.filter(
                user=user,
                section__course_content=section.course_content,
                is_clicked=True,
            ).count()
            user_progress.save()


class CourseRatingSerializer(ModelSerializer):
    class Meta:
        model = CourseRating
        fields = "__all__"
        read_only_fields = ["user", "course"]

    def save_with_auth_user(self, user, pk, update=False):
        if update:
            self.save()
            return

        course = get_object_or_404(Course, id=pk)
        is_enrolled = Enrollment.objects.filter(user=user, course=course).exists()
        is_rated = CourseRating.objects.filter(user=user, course=course).exists()

        if not is_enrolled:
            raise AuthenticationFailed("not allowed to create rating")

        if is_rated:
            raise AuthenticationFailed("has already been rated!")

        self.save(user=user, course=course)


class CourseSerializer(ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    created_by_name = serializers.StringRelatedField(
        source="created_by", read_only=True
    )
    difficulty_display = serializers.SerializerMethodField()
    enrollee_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = "__all__"
        read_only_fields = ["created_by"]

    def save_with_auth_user(self, user, pk, update=False):

        if update:
            # Check if 'read' is the only field being updated
            if set(self.validated_data.keys()) == {"read"}:
                self.instance.read = self.validated_data.get("read")
                self.instance.save(update_fields=["read"])
                return

            if "status" in self.validated_data and not user.is_staff:
                raise AuthenticationFailed("Only staff can change the status")

            if user.is_superuser or user.is_staff:
                self.save()
            elif self.instance.created_by == user:
                self.save()
            else:
                raise AuthenticationFailed("Not allowed to modify")

            self.save()
            return
        self.save(created_by=user)

    def get_average_rating(self, obj) -> float:
        return obj.course_rating_average()

    def get_difficulty_display(self, obj):
        return obj.get_difficulty_display()

    def get_enrollee_count(self, obj):
        return obj.enrollee_count()

    def check_daily_limit(self, user):
        # Get the count of courses created by the user today
        if user.is_superuser or user.is_staff:
            return
        courses_today = Course.objects.filter(
            created_by=user, course_created=date.today()
        ).count()
        if courses_today >= 2:
            raise serializers.ValidationError(
                {
                    "detail": "Sorry, you can only create two courses per day.\n This is to prevent the spamming of creations."
                }
            )


class CourseContentSerializer(ModelSerializer):
    class Meta:
        model = CourseContent
        fields = "__all__"
        read_only_fields = ["course"]

    def save_with_auth_user(self, user, pk, update=False):

        if self.instance.course.created_by != user:
            raise AuthenticationFailed("Not allowed to modify")
        self.save()


class SectionSerializer(ModelSerializer):
    class Meta:
        model = Section
        fields = "__all__"
        read_only_fields = ["course_content"]

    def save_with_auth_user(self, user, pk, update=False):
        if update:
            if not is_valid_ownership(user, self.instance.course_content.course.id):
                raise AuthenticationFailed("Not allowed to modify")
            self.save()
            return

        course_content = get_object_or_404(CourseContent, id=pk)
        if not is_valid_ownership(user, course_content.course.id):
            raise AuthenticationFailed("Not allowed to create")
        self.save(course_content=course_content)


class SectionItemSerializer(ModelSerializer):
    class Meta:
        model = SectionItem
        fields = "__all__"
        read_only_fields = ["section"]

    def save_with_auth_user(self, user, pk, update=False):
        if update:
            if not is_valid_ownership(user, self.instance.section.course_content.course.id):
                raise AuthenticationFailed("Not allowed to modify")
            self.save()
            return

        section = get_object_or_404(Section, id=pk)
        if not is_valid_ownership(user, section.course_content.course.id):
            raise AuthenticationFailed("Not allowed to create")
        self.save(section=section)


class CourseCommentsSerializer(ModelSerializer):
    replies = serializers.SerializerMethodField()
    comment_by = UserDetailSerializer(read_only=True)

    class Meta:
        model = CourseComments
        fields = "__all__"
        read_only_fields = ["course", "comment_by"]

    def get_replies(self, obj):
        replies = CourseComments.objects.filter(parent_comment=obj)
        return CourseCommentsSerializer(replies, many=True).data

    def save_with_auth_user(self, user, pk, update=False):
        if update:
            if self.instance.comment_by != user:
                raise AuthenticationFailed("Not allowed to modify comment")
            self.save()
            return
        course = get_object_or_404(Course, id=pk)
        self.save(course=course, comment_by=user)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        comment_by_representation = representation.pop("comment_by")
        for key in comment_by_representation:
            representation[key] = comment_by_representation[key]
        return representation


class EnrollmentSerializer(ModelSerializer):
    course = CourseSerializer(read_only=True)
    total_sections = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = "__all__"
        read_only_fields = ["user", "course"]

    def save_with_auth_user(self, user, pk):
        course = get_object_or_404(Course, id=pk)
        is_enrolled = Enrollment.objects.filter(user=user, course=course).exists()
        if is_valid_ownership(user, course.id):
            raise AuthenticationFailed("Not allowed to enroll in their own course")

        if is_enrolled:
            raise AuthenticationFailed("already enrolled")

        self.save(user=user, course=course)

    def get_total_sections(self, obj):
        sections = Section.objects.filter(course_content__course=obj.course).count()
        return sections


class WorkoutsSerializer(ModelSerializer):
    class Meta:
        model = Workouts
        fields = "__all__"
        read_only_fields = ["section_item"]

    def save_with_auth_user(self, user, pk, update=False):

        if update:
            if not is_valid_ownership(
                user, self.instance.section_item.section.course_content.course.id
            ):
                raise AuthenticationFailed("Not allowed to modify")
            self.save()
            return

        section_item = get_object_or_404(SectionItem, id=pk)
        if not is_valid_ownership(user, section_item.section.course_content.course.id):
            raise AuthenticationFailed("Not allowed to create")
        self.save(section_item=section_item)


class CorrectExerciseFormSerializer(ModelSerializer):
    class Meta:
        model = CorrectExerciseForm
        fields = "__all__"
        read_only_fields = ["workout"]

    def save_with_auth_user(self, user, pk, update=False):

        if update:
            if not is_valid_ownership(
                user,
                self.instance.workout.section_item.section.course_content.course.id,
            ):
                raise AuthenticationFailed("Not allowed to modify")
            self.save()
            return

        workout = get_object_or_404(Workouts, id=pk)
        if not is_valid_ownership(
            user, workout.section_item.section.course_content.course.id
        ):
            raise AuthenticationFailed("Not allowed to create")
        self.save(workout=workout)


class WrongExerciseFormSerializer(ModelSerializer):
    class Meta:
        model = WrongExerciseForm
        fields = "__all__"
        read_only_fields = ["workout"]

    def save_with_auth_user(self, user, pk, update=False):

        if update:
            if not is_valid_ownership(
                user,
                self.instance.workout.section_item.section.course_content.course.id,
            ):
                raise AuthenticationFailed("Not allowed to modify")
            self.save()
            return

        workout = get_object_or_404(Workouts, id=pk)
        if not is_valid_ownership(
            user, workout.section_item.section.course_content.course.id
        ):
            raise AuthenticationFailed("Not allowed to create")
        self.save(workout=workout)


class BlogSerializer(ModelSerializer):
    author = UserDetailSerializer(read_only=True)

    class Meta:
        model = Blog
        fields = "__all__"
        read_only_fields = ["author"]

    def save_with_auth_user(self, user, pk, update=False):

        if update:
            if self.instance.author != user:
                raise AuthenticationFailed("Not allowed to modify")
            self.save()
            return

        self.save(author=user)


class BlogCommentsSerializer(ModelSerializer):
    replies = serializers.SerializerMethodField()
    comment_by = UserDetailSerializer(read_only=True)

    class Meta:
        model = BlogComments
        fields = "__all__"
        read_only_fields = ["blog", "comment_by"]

    def get_replies(self, obj):
        replies = BlogComments.objects.filter(parent_comment=obj)
        return BlogCommentsSerializer(replies, many=True).data

    def save_with_auth_user(self, user, pk, update=False):

        if update:
            if self.instance.comment_by != user:
                raise AuthenticationFailed("Not allowed to modify")
            self.save()

        blog = get_object_or_404(Blog, id=pk)
        self.save(blog=blog, comment_by=user)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        comment_by_representation = representation.pop("comment_by")
        for key in comment_by_representation:
            representation[key] = comment_by_representation[key]
        return representation
