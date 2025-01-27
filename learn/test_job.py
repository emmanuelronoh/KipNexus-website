from io import StringIO
from django.core.management import call_command
from django.test import TestCase
from .models import User, Course
from learn.management.commands.runapscheduler import my_job
from django.utils import timezone
from datetime import timedelta


# NOTICE when running this
# REMOVE the auto_now option in the course_updated field so that we can put a hard-coded value for testing.

# class CourseApschedulerTestCase(TestCase):


#     def setUp(self):
#         self.user = User.objects.create(username="testme")
#         self.course = Course.objects.create(
#             created_by=self.user,
#             title="testing sectionItem",
#             weeks=18,
#             is_draft=True
#         )
#         # Update course_updated after the object has been created
#         self.course.course_updated = timezone.now() - timedelta(days=123)
#         self.course.save(update_fields=['course_updated'])
#         print(self.course.course_updated)
#     def test_my_job(self):
#         my_job()
#         self.assertFalse(Course.objects.filter(id=self.course.id).exists())
        
