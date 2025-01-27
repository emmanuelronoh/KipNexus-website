from django.test import Client, TestCase
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from .models import *
from datetime import datetime, date


# Create your tests here.
class UserProgressTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(username="testuser")
        self.course = Course.objects.create(
            title="Testing title",
            description="Lorem ipsum dolor sit amet. Et illum dolores et numquam aperiam aut totam labore. Est tempora dicta At corrupti tenetur aut optio autem aut maiores distinctio ut sequi accusantium aut provident rerum et natus laudantium.Est nihil vero quo blanditiis doloribus et nesciunt rerum! Est magni accusantium non blanditiis doloribus eum molestias asperiores aut soluta odio id nisi velit!",
            difficulty="BG",
            created_by=self.user,
            weeks=18,
        )
        self.progress = UserProgress.objects.create(
            user=self.user, course=self.course, sections_completed=3
        )

    def test_user_progress_creation(self):
        self.assertIsNotNone(self.progress)
        self.assertEqual(3, self.progress.sections_completed)
        self.assertNotEqual(0, self.progress.sections_completed)

    def test_user_progress_update(self):
        self.progress.sections_completed = 50
        self.assertEqual(self.progress.sections_completed, 50)


class CourseRatingTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(username="testuser")
        self.user_2 = User.objects.create(username="testuser-course")
        self.course = Course.objects.create(
            title="test",
            description="testing",
            difficulty="AD",
            created_by=self.user_2,
            weeks=18,
        )
        self.course_2 = Course.objects.create(
            title="test_2",
            description="testing 2",
            difficulty="AD",
            created_by=self.user_2,
            weeks=18,
        )

        self.rating = CourseRating.objects.create(
            user=self.user, course=self.course_2, rating=1
        )

    def test_created_user_progress(self):

        self.assertEqual(1, self.rating.rating)
        self.assertEqual(self.rating.user, self.user)
        self.assertEqual(self.rating.course, self.course_2)

    def test_user_progress_creation(self):

        progress = CourseRating.objects.create(
            user=self.user, course=self.course_2, rating=5
        )

        self.assertIsNotNone(progress)

    def test_invalid_rating(self):
        rating = CourseRating(user=self.user, course=self.course_2, rating=10)

        with self.assertRaises(ValidationError):
            rating.full_clean()

    def test_course_rating_without_course(self):
        with self.assertRaises(IntegrityError):
            CourseRating.objects.create(user=self.user, rating=1)

    def test_course_rating_average(self):
        course = self.course_2
        CourseRating.objects.create(user=self.user, course=course, rating=3)
        CourseRating.objects.create(user=self.user, course=course, rating=4)
        CourseRating.objects.create(user=self.user, course=course, rating=5)

        average_rating = course.course_rating_average()
        self.assertEqual(average_rating, 3.25)  # The average of 1, 3, 4, 5 is 3.25


class CourseTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(username="testuser")

        self.course = Course.objects.create(
            title="Testing title",
            description="Lorem ipsum dolor sit amet. Et illum dolores et numquam aperiam aut totam labore. Est tempora dicta At corrupti tenetur aut optio autem aut maiores distinctio ut sequi accusantium aut provident rerum et natus laudantium.Est nihil vero quo blanditiis doloribus et nesciunt rerum! Est magni accusantium non blanditiis doloribus eum molestias asperiores aut soluta odio id nisi velit!",
            difficulty="BG",
            created_by=self.user,
            weeks=18,
        )

    def test_created_course(self):
        """
        Test creating a course
        """
        course = Course.objects.get(title="Testing title")
        self.assertEqual(course.title, "Testing title")
        self.assertEqual(
            course.description,
            "Lorem ipsum dolor sit amet. Et illum dolores et numquam aperiam aut totam labore. Est tempora dicta At corrupti tenetur aut optio autem aut maiores distinctio ut sequi accusantium aut provident rerum et natus laudantium.Est nihil vero quo blanditiis doloribus et nesciunt rerum! Est magni accusantium non blanditiis doloribus eum molestias asperiores aut soluta odio id nisi velit!",
        )
        self.assertEqual(course.difficulty, "BG")
        self.assertEqual(course.created_by, self.user)
        self.assertIsNotNone(
            course.thumbnail
        )  # since we allow it to be empty after all.
        self.assertIsNotNone(course.course_created)
        self.assertIsNotNone(course.course_updated)
        expected_choices = [
            ("BG", "Beginner"),
            ("IN", "Intermediate"),
            ("AD", "Advanced"),
        ]
        self.assertEqual(course.DIFFICULTY_CHOICES, expected_choices)

    def test_course_timestamps(self):
        """
        Testing timestamps of our course
        """
        course = Course.objects.get(id=self.course.id)

        self.assertEqual(course.course_created, course.course_updated.date())

        # Update the course
        course.difficulty = "IN"
        course.save()

        course.refresh_from_db()

        self.assertGreaterEqual(course.course_updated.date(), course.course_created)

    def test_update_course(self):
        """Test updating a course"""
        test = Course.objects.get(title="Testing title")
        test.title = "New test title"
        test.description = "New test description"
        test.difficulty = "AD"
        test.save()

        self.assertNotEqual(test.title, self.course.title)
        self.assertNotEqual(test.description, self.course.description)
        self.assertNotEqual(test.difficulty, self.course.difficulty)

        self.assertEqual(test.title, "New test title")
        self.assertEqual(test.description, "New test description")
        self.assertEqual(test.difficulty, "AD")

    def test_course_deletion(self):
        course = Course.objects.get(title="Testing title")
        course.delete()

        with self.assertRaises(Course.DoesNotExist):
            Course.objects.get(title="Testing title")

    def test_invalid_course(self):
        course = Course(
            title="",
            description="Lorem ipsum dolor sit amet",
            difficulty="GOOD",
            created_by=self.user,
        )

        with self.assertRaises(ValidationError):
            course.full_clean()


class CourseContentTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(username="testuser")

        self.course = Course.objects.create(
            title="Testing Content",
            description="Lorem ipsum",
            difficulty="BG",
            created_by=self.user,
            weeks=18,
        )
        CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="Testing the goal of this program is give you mobility and by end of it you'll be flexible as Yujiro Hanma or Baki Hanma",
            course=self.course,
        )

    def test_created_content(self):
        """
        Test when creating a content
        """

        course = CourseContent.objects.get(id=self.course.id)
        self.assertEqual(course.course, self.course)
        self.assertEqual(
            course.preview, "https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s"
        )
        self.assertEqual(
            course.overview,
            "Testing the goal of this program is give you mobility and by end of it you'll be flexible as Yujiro Hanma or Baki Hanma",
        )
        self.assertEqual(course.course.weeks, 18)

    def test_update_content(self):
        """
        Tests when updating a content
        """
        course = CourseContent.objects.get(id=self.course.id)
        course.preview = "https://www.youtube.com/watch?v=Ru1hYrwCZJo&t=196s"
        course.overview = "Mobility exercise"
        self.assertEqual(course.course, self.course)
        self.assertEqual(
            course.preview, "https://www.youtube.com/watch?v=Ru1hYrwCZJo&t=196s"
        )
        self.assertEqual(course.overview, "Mobility exercise")

    def test_content_deletion(self):
        course = CourseContent.objects.get(id=self.course.id)
        course.delete()

        with self.assertRaises(CourseContent.DoesNotExist):
            CourseContent.objects.get(id=self.course.id)

    def test_course_content_without_course(self):
        with self.assertRaises(IntegrityError):
            CourseContent.objects.create(
                preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
                overview="Testing the goal of this program is give you mobility and by end of it you'll be flexible as Yujiro Hanma or Baki Hanma",
            )


class CourseCommentsTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(username="testuser")
        self.course = Course.objects.create(
            title="Testing Content",
            description="Lorem ipsum",
            difficulty="BG",
            created_by=self.user,
            weeks=18,
        )
        self.comment = CourseComments.objects.create(
            course=self.course, comment_by=self.user, comment="WOW grape nice material"
        )

        self.reply_comment = CourseComments.objects.create(
            course=self.course,
            comment_by=self.user,
            comment="This is a reply",
            parent_comment=self.comment,
        )

    def test_comment(self):
        comment = CourseComments.objects.get(
            course=self.course, comment="WOW grape nice material"
        )
        self.assertEqual(comment.comment, "WOW grape nice material")
        self.assertEqual(comment.comment_by, self.user)
        self.assertIsNotNone(comment.comment_date)

    def test_comment_update_delete(self):
        """
        Ensure we can modify and delete a comment instance
        """
        comment = CourseComments.objects.get(
            course=self.course, parent_comment__isnull=True
        )

        comment.comment = "wow"
        self.assertNotEqual(comment, "WOW grape nice material")

        comment.delete()

        with self.assertRaises(CourseComments.DoesNotExist):
            CourseComments.objects.get(comment="wow")

    def test_comment_replies(self):
        replies = self.comment.replies.all()
        self.assertIn(self.reply_comment, replies)

    def test_course_comment_without_course(self):
        with self.assertRaises(IntegrityError):
            CourseComments.objects.create(
                comment_by=self.user, comment="WOW grape nice material"
            )

    def test_course_comment_no_comment_field(self):
        comment = CourseComments.objects.create(
            course=self.course, comment_by=self.user
        )
        with self.assertRaises(ValidationError):
            comment.full_clean()


class SectionTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(username="testuser")
        self.user2 = User.objects.create(username="testuser123")
        self.course = Course.objects.create(
            title="testing",
            created_by=self.user,
            weeks=18,
        )
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        self.section = Section.objects.create(course_content=self.course_content, heading="week 6")

    def test_section_creation(self):

        self.assertEqual(self.section.course_content, self.course_content)
        self.assertEqual(self.section.heading, "week 6")
        self.assertEqual(self.section.course_content.course.created_by, self.user)
        self.assertNotEqual(self.section.course_content.course.created_by, self.user2)

    def test_section_without_course_reference(self):

        with self.assertRaises(IntegrityError):
            Section.objects.create(heading="forgot ops")

    def test_section_without_title(self):
        section = Section.objects.create(course_content=self.course_content)
        with self.assertRaises(ValidationError):
            section.full_clean()


class SectionItemTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(username="testme")
        self.course = Course.objects.create(
            created_by=self.user,
            title="testing sectionItem",
            weeks=18,
        )
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        self.section = Section.objects.create(course_content=self.course_content, heading="week 12")
        self.section_item = SectionItem.objects.create(
            section=self.section,
            lecture="https://www.youtube.com",
            heading="test instance's section item heading",
        )
        self.workout = Workouts.objects.create(
            section_item=self.section_item,
            exercise="Test Exercise",
            intensity="L",
            rest_time=60,
            sets=3,
            reps=10,
            excertion=5,
        )
        self.workout_2 = Workouts.objects.create(
            section_item=self.section_item,
            exercise="Test Exercise number 2",
            intensity="L",
            rest_time=60,
            sets=3,
            reps=10,
            excertion=5,
        )

    def test_section_item_creation(self):

        self.assertEqual(self.section_item.section, self.section)
        self.assertIn("test", self.section_item.heading)


class WorkoutsTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(username="testuser")

        self.course = Course.objects.create(
            title="Test Course",
            created_by=self.user,
            weeks=18,
        )
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        section = Section.objects.create(course_content=self.course_content, heading="week 123")
        self.section_item = SectionItem.objects.create(
            section=section,
            description="after doing this go do this",
            heading="test instance's section item heading",
        )
        self.workout = Workouts.objects.create(
            section_item=self.section_item,
            exercise="Test Exercise",
            intensity="L",
            rest_time=60,
            sets=3,
            reps=10,
            excertion=5,
        )

    def test_workout_creation(self):
        """
        Ensure we can create a new workout object
        """
        self.assertEqual(self.workout.section_item, self.section_item)
        self.assertEqual(self.workout.exercise, "Test Exercise")
        self.assertEqual(self.workout.intensity, "L")
        self.assertEqual(self.workout.rest_time, 60)
        self.assertEqual(self.workout.sets, 3)
        self.assertEqual(self.workout.reps, 10)
        self.assertEqual(self.workout.excertion, 5)

    def test_intensity_choices(self):
        choices = dict(Workouts.INTENSITY_CHOICES)
        self.assertEqual(choices["L"], "Low")
        self.assertEqual(choices["M"], "Medium")
        self.assertEqual(choices["H"], "High")

    def test_excertion_choices(self):
        choices = dict(Workouts.EXCERTION_CHOICES)
        self.assertEqual(choices[1], "1")
        self.assertEqual(choices[10], "10")

    def test_invalid_intensity(self):
        workout = Workouts(
            exercise="Test Exercise",
            intensity="Invalid intensity",
            sets=3,
            reps=10,
            excertion=5,
        )
        with self.assertRaises(ValidationError):
            workout.full_clean()


class CorrectExerciseFormTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="testuser")

        self.course = Course.objects.create(
            title="Test Course",
            created_by=self.user,
            weeks=18,
        )
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        section = Section.objects.create(heading="week 6", course_content=self.course_content)
        section_item = SectionItem.objects.create(
            section=section,
            lecture="https://www.youtube.com",
            heading="test instance's section item heading",
        )
        self.workout = Workouts.objects.create(
            section_item=section_item,
            exercise="Push Up",
            intensity="M",
            rest_time=90,
            sets=3,
            reps=10,
            excertion=5,
        )
        self.correct_exercise_form = CorrectExerciseForm.objects.create(
            demo="images/images/chinwhiteup.gif",
            workout=self.workout,
            description="Scapula position retracted",
        )

    def test_correct_exercise_form_creation(self):
        self.assertEqual(
            self.correct_exercise_form.demo,
            "images/images/chinwhiteup.gif",
        )
        self.assertEqual(self.correct_exercise_form.workout, self.workout)
        self.assertEqual(
            self.correct_exercise_form.description, "Scapula position retracted"
        )

    def test_correct_exercise_form_without_workout(self):
        with self.assertRaises(IntegrityError):
            CorrectExerciseForm.objects.create(
                demo="{{URL}}",
                workout=None,
                description="Scapula position retracted",
            )

    def test_correct_exercise_form_creation_with_invalid_demo(self):
        exercise = CorrectExerciseForm.objects.create(
            demo="",
            workout=self.workout,
            description="Flared elbow",
        )
        with self.assertRaises(ValidationError):
            exercise.full_clean()


class WrongExerciseFormTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="testuser")

        self.course = Course.objects.create(
            title="Test Course",
            created_by=self.user,
            weeks=18,
        )
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        section = Section.objects.create(course_content=self.course_content, heading="week 10")
        section_item = SectionItem.objects.create(
            section=section,
            description="after doing a set rest 100000 minutes",
            heading="test instance's section item heading",
        )
        self.workout = Workouts.objects.create(
            section_item=section_item,
            exercise="Push Up",
            intensity="M",
            rest_time=90,
            sets=3,
            reps=10,
            excertion=5,
        )
        self.wrong_exercise_form = WrongExerciseForm.objects.create(
            demo="images/images/chinwhiteup.gif",
            workout=self.workout,
            description="Flared elbow",
        )

    def test_wrong_exercise_form_creation(self):
        self.assertEqual(
            self.wrong_exercise_form.demo,
            "images/images/chinwhiteup.gif",
        )
        self.assertEqual(self.wrong_exercise_form.workout, self.workout)
        self.assertEqual(self.wrong_exercise_form.description, "Flared elbow")

    def test_wrong_exercise_form_without_workout(self):
        with self.assertRaises(IntegrityError):
            WrongExerciseForm.objects.create(
                demo="images/images/chinupVecs.gif",
                workout=None,
                description="Scapula position retracted",
            )

    def test_wrong_exercise_form_creation_with_invalid_demo(self):
        exercise = WrongExerciseForm.objects.create(
            demo="",
            workout=self.workout,
            description="Flared elbow",
        )
        with self.assertRaises(ValidationError):
            exercise.full_clean()


class EnrollmentTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="testuser")
        self.user2 = User.objects.create(username="testuser123")

        self.course = Course.objects.create(
            title="Test Course",
            created_by=self.user,
            weeks=18,
        )
        self.enrollment = Enrollment.objects.create(user=self.user2, course=self.course)

    def test_user_enrollment(self):
        self.assertEqual(self.enrollment.user, self.user2)

    def test_course_enrollment(self):
        self.assertEqual(self.enrollment.course, self.course)

    def test_date_enrolled(self):
        self.assertIsInstance(self.enrollment.date_enrolled, datetime)

    def test_related_names(self):
        self.assertIn(self.enrollment, self.user2.enrollee.all())
        self.assertIn(self.enrollment, self.course.enrolled.all())

    def test_enrollment_without_user(self):
        with self.assertRaises(IntegrityError):
            Enrollment.objects.create(user=None, course=self.course)

    def test_enrollment_without_course(self):
        with self.assertRaises(IntegrityError):
            Enrollment.objects.create(user=self.user2, course=None)


class BlogTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="testuser")

        self.blog = Blog.objects.create(
            author=self.user, content="Testing", title="Noli me the test"
        )

    def test_author(self):
        self.assertEqual(self.blog.author, self.user)

    def test_content(self):
        self.assertEqual(self.blog.content, "Testing")

    def test_title(self):
        self.assertEqual(self.blog.title, "Noli me the test")

    def test_blog_creation_with_empty_content(self):
        blog = Blog.objects.create(
            author=self.user, content="", title="Empty Content Test"
        )
        self.assertEqual(blog.content, "")

    def test_blog_creation_with_long_title(self):
        long_title = "a" * 255
        blog = Blog.objects.create(
            author=self.user, content="Long title test", title=long_title
        )
        self.assertEqual(blog.title, long_title)

    def test_user_edit_blog(self):
        new_content = "Updated content"
        self.blog.content = new_content
        self.assertEqual(self.blog.content, new_content)

    def test_blog_creation_with_too_long_title(self):
        long_title = "a" * 350
        blog = Blog.objects.create(
            author=self.user, content="Too long title test", title=long_title
        )
        with self.assertRaises(ValidationError):
            blog.full_clean()


class BlogCommentsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="testuser")

        self.blog = Blog.objects.create(
            author=self.user, content="Testing", title="Test Blog"
        )
        self.comment = BlogComments.objects.create(
            blog=self.blog,
            comment="Test Comment",
            comment_by=self.user,
            parent_comment=None,
        )
        self.reply_comment = BlogComments.objects.create(
            blog=self.blog,
            comment_by=self.user,
            comment="This is a reply",
            parent_comment=self.comment,
        )

    def test_blog_comments(self):
        comment = BlogComments.objects.get(id=1)
        self.assertEqual(comment.blog.title, "Test Blog")
        self.assertEqual(comment.comment, "Test Comment")
        self.assertEqual(comment.comment_by.username, "testuser")
        self.assertIsNone(comment.parent_comment)

    def test_blog_comments_related_names(self):
        comment = BlogComments.objects.get(id=1)

        blog = Blog.objects.get(id=1)
        user = User.objects.get(id=1)

        # Test related names
        self.assertEqual(blog.blog.count(), 2)
        self.assertEqual(user.commented_by.count(), 2)
        self.assertEqual(comment.blog_parent_comments.count(), 1)

    def test_comment_replies(self):
        replies = self.comment.blog_parent_comments.all()
        self.assertIn(self.reply_comment, replies)

    def test_blog_comment_no_comment_field(self):
        comment = BlogComments.objects.create(blog=self.blog, comment_by=self.user)
        with self.assertRaises(ValidationError):
            comment.full_clean()

    def test_blog_comments_does_not_exist(self):
        with self.assertRaises(BlogComments.DoesNotExist):
            BlogComments.objects.get(id=999)
