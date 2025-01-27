from django.test import Client, TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from .models import (
    User,
    UserProgress,
    Course,
    CourseRating,
    Enrollment,
    Blog,
    BlogComments,
)
from datetime import datetime, date

# Reference For APIClient testing
# https://www.django-rest-framework.org/api-guide/testing/#apiclient


class UserProgressListAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        course = Course.objects.create(
            title="test progress",
            description="nothing",
            difficulty="BG",
            created_by=self.user_2,
            weeks=18,
        )
        course_2 = Course.objects.create(
            title="test progress",
            description="nothing",
            difficulty="BG",
            created_by=self.user_2,
            weeks=18,
        )

        Enrollment.objects.create(user=self.user, course=course)
        Enrollment.objects.create(user=self.user, course=course_2)

        UserProgress.objects.create(user=self.user, course=course, sections_completed=6)
        UserProgress.objects.create(
            user=self.user, course=course_2, sections_completed=1
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)

        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )

        token = response.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_user_progress(self):
        """
        Ensure we can retrieve all list of user's course progress
        """

        # test retrieve with an authenticated client
        response = self.authenticated_client.get(reverse("learn:progress-list"))

        # test retrieve with an unathenticated client
        response_2 = self.unauthenticated_client.get(reverse("learn:progress-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["user"], 1)
        self.assertEqual(response.data[0]["course"], 1)
        self.assertEqual(response.data[1]["user"], 1)
        self.assertEqual(response.data[1]["course"], 2)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)


class UserProgressDetailAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        self.course = Course.objects.create(
            title="test progress",
            description="nothing",
            difficulty="BG",
            created_by=self.user_2,
            weeks=18,
        )
        self.course_2 = Course.objects.create(
            title="test progress",
            description="nothing",
            difficulty="BG",
            created_by=self.user_2,
            weeks=18,
        )
        self.course_3 = Course.objects.create(
            title="test progress",
            description="nothing",
            difficulty="BG",
            created_by=self.user_2,
            weeks=18,
        )

        Enrollment.objects.create(user=self.user, course=self.course)
        Enrollment.objects.create(user=self.user, course=self.course_2)
        Enrollment.objects.create(user=self.user, course=self.course_3)

        UserProgress.objects.create(
            user=self.user, course=self.course_2, sections_completed=1
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )
        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "secret"},
        )

        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_create_user_progress(self):

        # test create user progress with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:progress-detail", args=[1]),
            {"sections_completed": 1},
        )

        # test create user progress with an authenticated client on the same course.
        response_2 = self.authenticated_client.post(
            reverse("learn:progress-detail", args=[1]),
            {"sections_completed": 2},
        )

        # test create user progress with an invalid data type
        response_3 = self.authenticated_client.post(
            reverse("learn:progress-detail", args=[3]),
            {"sections_completed": "1"},
        )

        # test create user progress with an empty body / field on the same course
        response_4 = self.authenticated_client.post(
            reverse("learn:progress-detail", args=[3]), format="json"
        )

        # test create user progress for course that DOESN'T exist
        response_5 = self.authenticated_client.post(
            reverse("learn:progress-detail", args=[6]),
            {"sections_completed": 2},
            fomrat="json",
        )

        # test create user progress with an unauthenticated client
        response_6 = self.unauthenticated_client.post(
            reverse("learn:progress-detail", args=[1]),
            {"sections_completed": 1},
        )

        # test create user progress with authenticated client that isn't enrolled to a course
        response_7 = self.authenticated_client_2.post(
            reverse("learn:progress-detail", args=[1]),
            {"sections_completed": 1},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["sections_completed"], 1)
        self.assertEqual(response.data["user"], 1)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_200_OK)
        self.assertEqual(response_4.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_5.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_6.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_7.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_user_progress(self):
        """
        Ensure we can update a user progress instance
        """
        UserProgress.objects.create(
            user=self.user, course=self.course, sections_completed=6
        )
        UserProgress.objects.create(
            user=self.user, course=self.course_3, sections_completed=1
        )

        # test update user progress instance with an authenticated client
        response = self.authenticated_client.put(
            reverse("learn:progress-detail", args=[2]),
            {"sections_completed": 3},
        )

        # test update user progress instance again with an authenticated client
        response_2 = self.authenticated_client.put(
            reverse("learn:progress-detail", args=[2]),
            {"sections_completed": 6},
        )

        # test update user progress instance with an invalid data type
        response_3 = self.authenticated_client.put(
            reverse("learn:progress-detail", args=[1]),
            {"sections_completed": "10"},
        )

        # test update user progress instance with an empty body / field on the same course
        response_4 = self.authenticated_client.put(
            reverse("learn:progress-detail", args=[1]), format="json"
        )

        # test update user progress instance for course that DOESN'T exist
        response_5 = self.authenticated_client.put(
            reverse("learn:progress-detail", args=[6]),
            {"sections_completed": 2},
            fomrat="json",
        )

        # test update user progress instance with an unauthenticated client
        response_6 = self.unauthenticated_client.put(
            reverse("learn:progress-detail", args=[1]),
            {"sections_completed": 1},
        )

        # test update user progress instance with an authenticated client that isn't enrolled to a course
        response_7 = self.authenticated_client_2.put(
            reverse("learn:progress-detail", args=[1]),
            {"sections_completed": 1},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["sections_completed"], 3)
        self.assertEqual(response.data["user"], 1)
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertEqual(response_3.status_code, status.HTTP_200_OK)
        self.assertEqual(response_4.status_code, status.HTTP_200_OK)
        self.assertEqual(response_4.data["sections_completed"], 10)
        self.assertEqual(response_5.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_6.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response_7.status_code, status.HTTP_404_NOT_FOUND
        )  # well its 404 because user is not even enrolled to begin with


class CourseRatingCreateGetAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        self.user_3 = User.objects.create_user(username="testuser3", password="secret")

        course = Course.objects.create(
            title="test rating",
            description="nothing",
            difficulty="BG",
            created_by=self.user_2,
            weeks=18,
        )

        Enrollment.objects.create(user=self.user, course=course)

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_3 = APIClient(enforce_csrf_checks=True)

        self.unaunthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )

        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "secret"},
        )

        response_3 = self.authenticated_client_3.post(
            reverse("learn:login"),
            {"username": "testuser3", "password": "secret"},
        )

        token = response.json()
        token_2 = response_2.json()
        token_3 = response_3.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.authenticated_client_3.force_authenticate(
            user=self.user_3, token=token_3["access"]
        )
        self.unaunthenticated_client.force_authenticate(user=None)

    def test_create_course_rating(self):
        """
        Ensure we can create a course rating
        """

        # test create course rating with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:course-rating", args=[1]), {"rating": 1}, format="json"
        )

        # test create course rating with an authenticated client on the same course
        response_2 = self.authenticated_client.post(
            reverse("learn:course-rating", args=[1]), {"rating": 2}, format="json"
        )

        # test create course rating for a course instance that doesn't exist
        response_3 = self.authenticated_client.post(
            reverse("learn:course-rating", args=[6]), {"rating": 1}, format="json"
        )

        # test create course rating with an empty field
        response_4 = self.authenticated_client.post(
            reverse("learn:course-rating", args=[1]), format="json"
        )

        # test create course rating with an invalid data type
        response_5 = self.authenticated_client.post(
            reverse("learn:course-rating", args=[1]), {"rating": "123"}, format="json"
        )

        # test create course rating with an authenticated client that is NOT enrolled
        response_6 = self.authenticated_client_3.post(
            reverse("learn:course-rating", args=[1]), {"rating": 3}, format="json"
        )

        # test create course rating with unathenticated client
        response_7 = self.unaunthenticated_client.post(
            reverse("learn:course-rating", args=[1]),
            {
                "rating": 1,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_5.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_6.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_7.status_code, status.HTTP_403_FORBIDDEN)

    def test_retrieve_course_rating(self):
        """
        Ensure we can retrieve the course rating
        """
        
        # test retrieve instance with an authenticated client 
        response = self.authenticated_client.get(reverse('learn:course-rating', args=[1]))

        # test retrieve instance that doesn't exist
        response_2 = self.authenticated_client.get(reverse('learn:course-rating', args=[4]))

        # test retrieve instance with an unauthenticated client
        response_3 = self.unaunthenticated_client.get(reverse('learn:course-rating', args=[1]))

        # test retrieve instance with another authenticated client that is the course's creator
        response_4 = self.authenticated_client_2.get(reverse('learn:course-rating', args=[2]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertEqual(response_3.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_4.status_code, status.HTTP_200_OK)


class CourseRatingDetailAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="username", password="password")
        self.user_2 = User.objects.create_user(username="username123", password="password123")

        course = Course.objects.create(
            title="test rating",
            description="nothing",
            difficulty="BG",
            created_by=self.user_2,
            weeks=18,
        )
        Enrollment.objects.create(user=self.user, course=course)
        Enrollment.objects.create(user=self.user_2, course=course)

        CourseRating.objects.create(user=self.user, course=course, rating=2)
        CourseRating.objects.create(user=self.user_2, course=course, rating=4)


        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unaunthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "username", "password": "password"},
        )

        response_2 = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "username123", "password": "password123"},
        )
        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user_2, token=token_2['access']
        )
        self.unaunthenticated_client.force_authenticate(user=None)


    def test_update_course_rating(self):
        """
        Ensure we can update the course rating
        """

        # test update instance with an authenticated client
        response = self.authenticated_client.patch(reverse('learn:course-rating-detail', args=[1]), {'rating': 4})

        # test update instance that doesnt exist
        response_2 = self.authenticated_client.patch(reverse('learn:course-rating-detail', args=[5]), {'rating': 4})

        # test update instance with an authenticated client, but rating is 10
        response_3 = self.authenticated_client.patch(reverse('learn:course-rating-detail', args=[1]), {'rating': 10})

        # test update instance with an authenticated client but the instance is doesn't belong to client
        response_4 = self.authenticated_client_2.patch(reverse('learn:course-rating-detail', args=[1]), {'rating': 2}) 

        # test update instance with an authenticated client that is the creator of the course
        response_5 = self.authenticated_client_2.patch(reverse('learn:course-rating-detail', args=[2]), {'rating': 3})

        # test update instance with unathenticated client
        response_6 = self.unaunthenticated_client.patch(reverse('learn:course-rating-detail', args=[2]), {'rating': 2})

        # test update instance without request body
        response_7 = self.authenticated_client.patch(reverse('learn:course-rating-detail', args=[1]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['rating'], 4)
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_5.status_code, status.HTTP_403_FORBIDDEN) 
        self.assertEqual(response_6.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_7.status_code, status.HTTP_200_OK)
        
        
        


class EnrollmentListAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        self.user_3 = User.objects.create_user(username="testuser3", password="secret")

        course = Course.objects.create(
            title="testing",
            created_by=self.user_2,
            weeks=18,
        )
        Enrollment.objects.create(user=self.user_3, course=course)

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_3 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )
        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "secret"},
        )
        response_3 = self.authenticated_client_3.post(
            reverse("learn:login"),
            {"username": "testuser3", "password": "secret"},
        )

        token = response.json()
        token_2 = response_2.json()
        token_3 = response_3.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.authenticated_client_3.force_authenticate(
            user=self.user_3, token=token_3["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_enrollment(self):
        """
        Ensure we can retrieve list of enrollees for a course
        """

        client = APIClient(enforce_csrf_checks=True)
        response = client.get(reverse("learn:enrollment-list", args=[1]))
        response_2 = client.get(reverse("learn:enrollment-list", args=[5]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertListEqual(response_2.data, [])

    def test_create_enrollment(self):
        """
        Ensure we can create an enrollment
        """
        # test create enrollment for a course that doesn't exist
        response_1 = self.authenticated_client.post(
            reverse("learn:enrollment-list", args=[5])
        )

        # test create enrollment with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:enrollment-list", args=[1])
        )

        # test create enrollment with an authenticated client for the same course
        response_2 = self.authenticated_client.post(
            reverse("learn:enrollment-list", args=[1])
        )

        # test create enrollment with an authenticated client that is the owner of the course.
        response_3 = self.authenticated_client_2.post(
            reverse("learn:enrollment-list", args=[1])
        )

        # test create enrollment with an authenticated client that is already enrolled
        response_4 = self.authenticated_client_3.post(
            reverse("learn:enrollment-list", args=[1])
        )

        # test create enrollment with an unathenticated client
        response_5 = self.unauthenticated_client.post(
            reverse("learn:enrollment-list", args=[1])
        )

        self.assertEqual(response_1.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # self.assertEqual(response.data["course"], 1)
        self.assertIsNotNone(response.data["course"])
        self.assertEqual(response.data["user"], 1)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_4.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_5.status_code, status.HTTP_403_FORBIDDEN)


class UnenrollmentViewAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        self.user_3 = User.objects.create_user(username="testuser3", password="secret")

        self.course = Course.objects.create(
            title="testing",
            created_by=self.user_2,
            weeks=18,
        )
        Enrollment.objects.create(user=self.user, course=self.course)
        Enrollment.objects.create(user=self.user_3, course=self.course)

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_3 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )
        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "secret"},
        )
        response_3 = self.authenticated_client_3.post(
            reverse("learn:login"),
            {"username": "testuser3", "password": "secret"},
        )

        token = response.json()
        token_2 = response_2.json()
        token_3 = response_3.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.authenticated_client_3.force_authenticate(
            user=self.user_3, token=token_3["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_delete_enrollment(self):
        """
        Ensure we can delete a enrollment instance (i.e unenroll)
        """

        # test delete enrollment with an unauthenticated_client
        response = self.unauthenticated_client.delete(
            reverse("learn:unenrollment", args=[1])
        )

        # test delete enrollment with an authenticated client that is NOT enrolled
        response_2 = self.authenticated_client_2.delete(
            reverse("learn:unenrollment", args=[1])
        )

        # test delete enrollment with authenticated client that is enrolled
        response_3 = self.authenticated_client.delete(
            reverse("learn:unenrollment", args=[1])
        )
        response_4 = self.authenticated_client_3.delete(
            reverse("learn:unenrollment", args=[2])
        )

        unenrolled = Enrollment.objects.filter(user=self.user, course=self.course)
        unenrolled_2 = Enrollment.objects.filter(user=self.user_2, course=self.course)
        enrollee = Enrollment.objects.filter(id=1)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response_4.status_code, status.HTTP_204_NO_CONTENT)
        self.assertQuerySetEqual(unenrolled, [])
        self.assertQuerySetEqual(unenrolled_2, [])
        self.assertEqual(len(enrollee), 0)


class EnrollmentUserListAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")

        course = Course.objects.create(
            title="testing",
            created_by=self.user_2,
            weeks=18,
        )
        course_2 = Course.objects.create(
            title="testing2",
            created_by=self.user_2,
            weeks=18,
        )

        Enrollment.objects.create(user=self.user, course=course)
        Enrollment.objects.create(user=self.user, course=course_2)

        self.authenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )

        token = response.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )

    def test_retrieve_user_enrolled_courses(self):
        """
        Ensure we can retrieve list of courses for a user
        """

        response = self.authenticated_client.get(reverse("learn:courses-enrolled"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["user"], self.user.id)
        self.assertEqual(response.data["results"][0]["user"], self.user.id)


class BlogListAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")

        Blog.objects.create(
            title="test blog",
            summary="summary of blog the summary is empty actually hehe",
            content="idk there's no content yet lorem ipsum blah blah blah blah blah blah",
            author=self.user,
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )

        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "secret"},
        )

        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_blog_list(self):
        """
        Ensure we can retrieve list of blogs
        """
        client = APIClient(enforce_csrf_checks=True)

        response = client.get(reverse("learn:blog-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertIn("test", response.data['results'][0]["title"])

    def test_create_blog(self):
        """
        Ensure we can create a blog
        """

        # test create blog with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:blog-list"),
            {"title": "testing post", "content": "creating content", "summary": "idk"},
        )

        # test create blog with an invalid data type
        response_2 = self.authenticated_client.post(
            reverse("learn:blog-list"), {"title": 123, "content": 123, "summary": "empty"}, format="json"
        )

        # test create blog with an empty field / data
        response_3 = self.authenticated_client.post(
            reverse("learn:blog-list"), format="json"
        )

        # test create blog with unauthenticated client
        response_4 = self.unauthenticated_client.post(
            reverse("learn:blog-list"),
            {"title": "im probably not authenticated", "content": "idk", "summary": "idk"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("testing", response.data["title"]) 
        self.assertEqual(response.data["author"]["user_id"], self.user.id)

        self.assertIsNotNone(response.data["content"])
        self.assertEqual(response_2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_2.data["title"], "123")
        self.assertEqual(response_2.data["content"], "123")
        self.assertEqual(response_2.data["summary"], "empty")
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_403_FORBIDDEN)


class BlogDetailAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")

        Blog.objects.create(
            title="test blog",
            content="idk there's no content yet lorem ipsum blah blah blah blah blah blah",
            summary="nothing here",
            author=self.user,
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )

        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "secret"},
        )

        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_blog(self):
        """
        Ensure we can retrieve a blog instance
        """

        client = APIClient(enforce_csrf_checks=True)
        response = client.get(reverse("learn:blog-detail", args=[1]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data)

    def test_update_blog(self):
        """
        Ensure we can update a blog instance
        """

        # test update instance with an authenticated client
        response = self.authenticated_client.put(
            reverse("learn:blog-detail", args=[1]),
            {"title": "updated by me", "content": "there's now a content", "summary": "no summary"},
        )

        # test update instance with an empty field / data
        response_2 = self.authenticated_client.put(
            reverse("learn:blog-detail", args=[1]), format="json"
        )

        # test update instance with an invalid field
        response_3 = self.authenticated_client.put(
            reverse(
                "learn:blog-detail",
                args=[1],
            ),
            {"wow": "amazing", "anamzing": "invalid", "idk": 'lol'},
        )

        # test update instance with an authenticated client != author
        response_4 = self.authenticated_client_2.put(
            reverse("learn:blog-detail", args=[1]),
            {"title": "it's my title", "content": "just testing.", "summary": "testing"},
        )

        # test update instance with an unathenticated client
        response_5 = self.unauthenticated_client.put(
            reverse("learn:blog-detail", args=[1]),
            {"title": "idk", "content": "testing nothing", "summary": "testing"},
        )

        # test update instance that doesn't exist
        response_6 = self.authenticated_client.put(
            reverse("learn:blog-detail", args=[6]),
            {"title": "...", "content": "...", "summary": "..."},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("updated", response.data["title"])
        self.assertEqual(response.data["author"]["user_id"], self.user.id)
        self.assertIsNotNone(response.data["content"])
        self.assertIsNotNone(response.data["summary"])

        self.assertEqual(response_2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_5.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_6.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_blog(self):
        """
        Ensure we can delete a blog instance
        """

        # test delete instance that doesnt exist
        response = self.authenticated_client.delete(
            reverse("learn:blog-detail", args=[66])
        )

        # test delete instance with unauthenticated client
        response_2 = self.unauthenticated_client.delete(
            reverse("learn:blog-detail", args=[1])
        )

        # test delete instance with authenticated client that DOESNT own the blog
        repsonse_3 = self.authenticated_client_2.delete(
            reverse("learn:blog-detail", args=[1])
        )

        # test delete instance with an authenticated client
        response_4 = self.authenticated_client.delete(
            reverse("learn:blog-detail", args=[1])
        )

        enrollees = Blog.objects.all()

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(repsonse_3.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_4.status_code, status.HTTP_204_NO_CONTENT)
        self.assertQuerySetEqual(enrollees, [])


class BlogCommentListAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")

        blog = Blog.objects.create(
            title="test blog",
            content="idk there's no content yet lorem ipsum blah blah blah blah blah blah",
            author=self.user,
        )
        BlogComments.objects.create(
            blog=blog, comment="testing comment", comment_by=self.user_2
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )

        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "secret"},
        )

        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_comment_list(self):
        """
        Ensure we can retrieve the list of comments for a blog
        """

        client = APIClient(enforce_csrf_checks=True)

        response = client.get(reverse("learn:blog-comments", args=[1]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["user_id"], self.user_2.id)
        self.assertIsNotNone(response.data)

    def test_blog_create_comment(self):
        """
        Ensure we can create a comment for a blog
        """

        # test create comment with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:blog-comments", args=[1]),
            {"comment": "amazing, just for testing"},
        )

        # test create comment with an authenticated client and replying to comment
        response_1 = self.authenticated_client_2.post(
            reverse("learn:blog-comments", args=[1]),
            {
                "comment": "replying to your comment",
                "parent_comment": response.data["id"],
            },
        )

        # test create comment with an blog that DOESN'T exists
        response_2 = self.authenticated_client.post(
            reverse("learn:blog-comments", args=[6]),
            {"comment": "comment"},
        )

        # test create comment with an empty field / data
        response_3 = self.authenticated_client.post(
            reverse("learn:blog-comments", args=[1]), format="json"
        )

        # test create comment with an invalid field
        response_4 = self.authenticated_client.post(
            reverse("learn:blog-comments", args=[1]),
            {"commnt": "typo here"},
        )
        # test create comment with an invalid data type
        response_5 = self.authenticated_client.post(
            reverse("learn:blog-comments", args=[1]), {"comments": 123}, format="json"
        )
        # test create comment with an unauthenticated client
        response_6 = self.unauthenticated_client.post(
            reverse("learn:blog-comments", args=[1]), {"comment": "idk"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data)
        self.assertEqual(response.data["user_id"], self.user.id)
        self.assertEqual(response_1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_1.data["user_id"], self.user_2.id)
        self.assertEqual(response_1.data["parent_comment"], response.data["id"])
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_5.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_6.status_code, status.HTTP_403_FORBIDDEN)


class BlogCommentDetailAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")

        blog = Blog.objects.create(
            title="test blog",
            content="idk there's no content yet lorem ipsum blah blah ",
            author=self.user,
        )
        BlogComments.objects.create(
            blog=blog, comment="testing comment", comment_by=self.user_2
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
        )

        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "secret"},
        )

        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_blog_comment(self):
        """
        Ensure we can retrieve a blog comment instance
        """

        client = APIClient(enforce_csrf_checks=True)

        # test retrieve instance
        response = client.get(reverse("learn:blog-comment", args=[1]))

        # test retrieve instance that doesn't exist
        response_2 = client.get(reverse("learn:blog-comment", args=[6]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user_id"], self.user_2.id)
        self.assertIsNotNone(response.data["comment"])
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_blog_comment(self):
        """
        Ensure we can update a blog comment instance
        """

        # test update instance with an authenticated client
        response = self.authenticated_client_2.put(
            reverse("learn:blog-comment", args=[1]),
            {"comment": "modified"},
        )

        # test update instance with anthenticated client != comment_by
        response_2 = self.authenticated_client.put(
            reverse("learn:blog-comment", args=[1]),
            {"comment": "modified or not"},
        )
        # test update instance that doesnt exist
        response_3 = self.authenticated_client_2.put(
            reverse("learn:blog-comment", args=[6]), {"comment": "idk"}, format="json"
        )

        # test update instance with an empty field / data
        response_4 = self.authenticated_client_2.put(
            reverse("learn:blog-comment", args=[1]), format="json"
        )

        # test update instance with an unanthenticated client
        response_5 = self.unauthenticated_client.put(
            reverse("learn:blog-comment", args=[1]),
            {"comment": "trying"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data["comment"])
        self.assertEqual(response.data["user_id"], self.user_2.id)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_5.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_blog_comment(self):
        """
        Ensure we can delete a blog comment instance
        """

        # test delete instance with an unathenticated client
        response = self.unauthenticated_client.delete(
            reverse("learn:blog-comment", args=[1])
        )

        # test delete instance that doesnt exist
        response_2 = self.authenticated_client_2.delete(
            reverse("learn:blog-comment", args=[6])
        )

        # test delete instance with an authenticated client != comment_by
        response_3 = self.authenticated_client.delete(
            reverse("learn:blog-comment", args=[1])
        )

        # test delete instance with an authenticated client
        response_4 = self.authenticated_client_2.delete(
            reverse("learn:blog-comment", args=[1])
        )

        comments = BlogComments.objects.all()

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_3.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_4.status_code, status.HTTP_204_NO_CONTENT)
        self.assertQuerySetEqual(comments, [])
