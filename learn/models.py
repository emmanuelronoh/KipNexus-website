from django.db import models
from datetime import date
from django.contrib.auth.models import AbstractUser
from rest_framework.exceptions import AuthenticationFailed
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import Avg
from django.utils import timezone


# Create your models here.
class User(AbstractUser):
    profile_pic = models.ImageField(
        upload_to="profile_pictures/",
        height_field=None,
        width_field=None,
        null=True,
        blank=True,
    )
    is_instructor = models.BooleanField(default=False)

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        else:
            return self.username


class UserProgress(models.Model):
    """
    Represents the progress of a user in a course.
    """

    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="user_progress"
    )
    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="course_progress"
    )
    sections_completed = models.IntegerField(default=0, blank=True, null=True)

    def delete_with_auth_user(self, user):
        if self.user != user:
            raise AuthenticationFailed("Not allowed to delete")
        self.delete()


class UserSection(models.Model):
    """
    Represents the relationship between a user and a section.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    section = models.ForeignKey("Section", on_delete=models.CASCADE)
    is_clicked = models.BooleanField(default=False)

    class Meta:
        unique_together = ("user", "section")



class CourseRating(models.Model):
    """
    Represents a course's rating
    """

    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="user_ratings"
    )
    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="course_rating"
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )


class Course(models.Model):
    """
    Represents a course in the learning platform.
    """

    STATUS_CHOICES = [
        ("P", "Pending"),
        ("A", "Approved"),
        ("R", "Rejected"),
    ]

    DIFFICULTY_CHOICES = [
        ("BG", "Beginner"),
        ("IN", "Intermediate"),
        ("AD", "Advanced"),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to="images/", null=True, blank=True)
    difficulty = models.CharField(max_length=2, choices=DIFFICULTY_CHOICES)
    course_created = models.DateField(null=True, blank=True) # course_created is manually initiated in CourseSerializer
    course_updated = models.DateTimeField(null=True, blank=True, auto_now=True)
    created_by = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="creator"
    )
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default="P")
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    weeks = models.IntegerField()
    is_draft = models.BooleanField(default=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"( id: {self.id}) Course: {self.title}. By {self.created_by.username}"

    def delete_with_auth_user(self, user):
        if self.created_by != user and not user.is_superuser:
            raise AuthenticationFailed("Not allowed to delete")
        self.thumbnail.delete(save=False)
        self.delete()

    def course_rating_average(self):
        return self.course_rating.aggregate(Avg("rating"))["rating__avg"]

    def enrollee_count(self):
        return self.enrolled.count()

    def save(self, *args, **kwargs):
        if self.pk is None:
            self.course_created = timezone.now().date()
        super().save(*args, **kwargs)


class CourseContent(models.Model):
    """
    Represents a course's overview and it's content
    """

    preview = models.URLField()
    overview = models.TextField()
    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="course_content"
    )

    def __str__(self):
        return f"( pk: { self.pk } ) Course: {self.course.title}"


class Section(models.Model):
    """
    Represents a section / accordion
    """

    course_content = models.ForeignKey(
        "CourseContent", on_delete=models.CASCADE, related_name="sections"
    )
    heading = models.CharField(max_length=200)

    def delete_with_auth_user(self, user):
        if self.course_content.course.created_by != user:
            raise AuthenticationFailed("Not allowed to delete")

        self.delete()


class SectionItem(models.Model):
    """
    Represents a section's items / accordion item
    """

    section = models.ForeignKey(
        "Section", on_delete=models.CASCADE, related_name="contents"
    )
    lecture = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    description_image = models.ImageField(blank=True, null=True)
    heading = models.CharField(max_length=200)

    def delete_with_auth_user(self, user):
        from .helpers import is_valid_ownership

        if not is_valid_ownership(user, self.section.course_content.course.id):
            raise AuthenticationFailed("Not allowed to delete")
        self.delete()


class CourseComments(models.Model):
    """
    Represents a comment on a course.
    """

    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="comments"
    )
    comment_by = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="comment_comments"
    )
    comment = models.TextField()
    comment_date = models.DateTimeField(auto_now_add=True)
    parent_comment = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies"
    )

    def __str__(self):
        return f" ( pk: { self.pk } ) Date: {self.comment_date}. Comment By: {self.comment_by}"

    def delete_with_auth_user(self, user):
        if self.comment_by != user:
            raise AuthenticationFailed("Not alowed to delete comment")
        self.delete()


class Workouts(models.Model):
    """
    Represent Workouts in a course or in a section
    """

    INTENSITY_CHOICES = [("L", "Low"), ("M", "Medium"), ("H", "High")]
    EXCERTION_CHOICES = [(i, str(i)) for i in range(1, 11)]

    section_item = models.ForeignKey(
        "SectionItem", on_delete=models.CASCADE, related_name="workouts"
    )
    exercise = models.TextField(
        null=True, blank=True
    )  # this is suppose to be description but im too lazy to change the field for my test cases too
    demo = models.ImageField(upload_to="workouts/")
    intensity = models.CharField(
        max_length=1, choices=INTENSITY_CHOICES, blank=True, null=True
    )
    rest_time = models.IntegerField(blank=True, null=True)
    sets = models.IntegerField(blank=True, null=True)
    reps = models.IntegerField(blank=True, null=True)
    excertion = models.IntegerField(choices=EXCERTION_CHOICES, blank=True, null=True)

    def __str__(self):
        return f"( pk: { self.pk } ) Course: {self.section_item.section.course_content.course.title} Workout: {self.exercise}"

    def delete_with_auth_user(self, user):
        from .helpers import is_valid_ownership

        if not is_valid_ownership(
            user, self.section_item.section.course_content.course.id
        ):
            raise AuthenticationFailed("Not allowed to delete")
        self.demo.delete(save=False)
        self.delete()


class CorrectExerciseForm(models.Model):
    demo = models.ImageField(upload_to="correct_exercise_form/")
    workout = models.ForeignKey(
        "Workouts", on_delete=models.CASCADE, related_name="correct_exercise_form"
    )
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"( pk: { self.pk } )Course: {self.workout.section_item.section.course_content.course.title}. Workout: {self.workout.exercise}"

    def delete_with_auth_user(self, user):
        from .helpers import is_valid_ownership

        if not is_valid_ownership(
            user, self.workout.section_item.section.course_content.course.id
        ):
            raise AuthenticationFailed("Not allowed to delete")
        self.demo.delete(save=False)
        self.delete()


class WrongExerciseForm(models.Model):
    demo = models.ImageField(upload_to="wrong_exercise_form/")
    workout = models.ForeignKey(
        "Workouts", on_delete=models.CASCADE, related_name="wrong_exercise_form"
    )
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"( pk: { self.pk } ) Course: {self.workout.section_item.section.course_content.course.title} Workout: {self.workout.exercise}"

    def delete_with_auth_user(self, user):
        from .helpers import is_valid_ownership

        if not is_valid_ownership(
            user, self.workout.section_item.section.course_content.course.id
        ):
            raise AuthenticationFailed("Not allowed to delete")
        self.demo.delete(save=False)
        self.delete()


class Enrollment(models.Model):
    """
    Bridge for a user to enroll a course
    """

    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="enrollee")
    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="enrolled"
    )
    date_enrolled = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"( pk: { self.pk } ) {self.user.username} is enrolled to {self.course}"

    def delete_with_auth_user(self, user):
        if self.user != user:
            raise AuthenticationFailed("Not allowed to unenroll")
        self.delete()


class Blog(models.Model):
    """
    Represents a mini blog
    """

    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="author")
    title = models.CharField(max_length=300)
    summary = models.CharField(max_length=300)
    content = models.TextField()
    blog_created = models.DateTimeField(auto_now_add=True)
    blog_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f" ( pk: { self.pk } ) Title: {self.title}. By {self.author}"

    def delete_with_auth_user(self, user):
        if self.author != user:
            raise AuthenticationFailed("Not allowed to delete")
        self.delete()


class BlogComments(models.Model):
    blog = models.ForeignKey("Blog", on_delete=models.CASCADE, related_name="blog")
    comment = models.TextField()
    comment_date = models.DateTimeField(auto_now_add=True)
    comment_by = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="commented_by"
    )
    parent_comment = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="blog_parent_comments",
    )

    def __str__(self):
        return f"( pk: { self.pk } ) comment_by: { self.comment_by}"

    def delete_with_auth_user(self, user):
        if self.comment_by != user:
            raise AuthenticationFailed("Not allowed to delete")
        self.delete()
