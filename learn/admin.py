from django.contrib import admin
from django.contrib.sessions.models import Session

from .models import *


class CourseAdmin(admin.ModelAdmin):
    readonly_fields = ["course_created", "course_updated"]
    list_display = ("id", "title")


class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username")


class SessionAdmin(admin.ModelAdmin):
    list_display = ["session_key", "expire_date"]


# Register your models here.
admin.site.register(Session, SessionAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(UserProgress)
admin.site.register(UserSection)
admin.site.register(Course, CourseAdmin)
admin.site.register(CourseContent)
admin.site.register(Section)
admin.site.register(SectionItem)
admin.site.register(CourseRating)
admin.site.register(CourseComments)
admin.site.register(Enrollment)
admin.site.register(Workouts)
admin.site.register(CorrectExerciseForm)
admin.site.register(WrongExerciseForm)
admin.site.register(Blog)
admin.site.register(BlogComments)
