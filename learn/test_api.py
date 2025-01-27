import os
import glob
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from .models import (
    User,
    Course,
    CourseContent,
    CourseComments,
    Workouts,
    CorrectExerciseForm,
    WrongExerciseForm,
    Section,
    SectionItem,
)

# Reference For APIClient testing
# https://www.django-rest-framework.org/api-guide/testing/#apiclient


# Client (REST API) Testing starts here
class RegisterAPITestCase(APITestCase):
    def test_create_account(self):
        """
        Ensure we can create a new account object.
        """

        url = reverse("learn:register")
        data = {
            "username": "testuser",
            "email": "testemail@gmail.com",
            "password": "secret",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, "testuser")


class Login_LogoutAPITestCase(APITestCase):
    def setUp(self):
        User.objects.create_user(username="testuser", password="secret")

    def test_login(self):
        """
        Ensure that sucessfully logged in
        """
        client = APIClient()
        response1 = client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
            
        )
        response2 = client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "wrongpass"},
            
        )
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIsNotNone(response1.data["access"])

    def test_logout(self):
        client = APIClient()
        response = client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
            
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CourseListAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        Course.objects.create(
            title="set up",
            description="nothing",
            difficulty="BG",
            thumbnail="images/images/skillz.jpg",
            created_by=self.user,
            weeks=18,
        )
        Course.objects.create(
            title="set up2",
            description="nothing2",
            difficulty="BG",
            thumbnail="images/images/skillz.jpg",
            created_by=self.user,
            weeks=18,
        )
        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.unaunthenticated_client = APIClient(enforce_csrf_checks=True)
        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
            
        )
        token = response.json()
        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.unaunthenticated_client.force_authenticate(user=None)

    def tearDown(self):
        # prevents accumulating picture/image (i.e deletes files that were created by this test case)
        for filename in glob.glob("images/images/picture_*.jpg"):
            os.remove(filename)

    def test_retrieve_course_list(self):
        """
        Ensure we can retrieve the list of courses.
        """

        client = APIClient(enforce_csrf_checks=True)
        response = client.get(reverse("learn:course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(
            Course.objects.get(title="set up").title,
            response.data[0]["title"],
        )
        self.assertEqual(
            Course.objects.get(title="set up2").title,
            response.data[1]["title"],
        )

    def test_create_course(self):
        """
        Ensure we can create a new course
        """

        with open("images/images/skillz.jpg", "rb") as file:
            image = SimpleUploadedFile(
                "picture.jpg", file.read(), content_type="image/jpeg"
            )

        # test required fields
        response = self.authenticated_client.post(
            reverse("learn:course-list"),
            {
                "title": "test field required",
            },
        )

        # test invalid thumbnail
        response_2 = self.authenticated_client.post(
            reverse("learn:course-list"),
            {
                "title": "test difficulty repsonse and test thumbnail repsonse",
                "description": "testing thumbnail is not a valid file",
                "difficulty": "BG",
                "thumbnail": "/images/images/skillz.jpg",
                "weeks": 12,
            },
        )

        # test create course with an unathenticated user
        response_3 = self.unaunthenticated_client.post(
            reverse("learn:course-list"),
            {
                "title": "test no cookie",
                "description": "not empty",
                "difficulty": "BG",
                "thumbnail": image,
                "weeks": 12
            },
        )

        # reset cursor for file reading of image
        image.seek(0)

        # test create course with an authenticated client and valid fields but is not allowed due to limitations
        response_4 = self.authenticated_client.post(
            reverse("learn:course-list"),
            {
                "title": "test ok response",
                "description": "all fields properly filled",
                "difficulty": "BG",
                "thumbnail": image,
                "weeks": 12
            },
        )

        # test create course with an authyenticated client and invalid fields
        response_5 = self.authenticated_client.post(
            reverse("learn:course-list"), {"lols": "lmao", "probaby valdi": "idk"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_3.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_4.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsNotNone(response_4.data["detail"])
        self.assertIn('Sorry', response_4.data["detail"])
        self.assertEqual(response_5.status_code, status.HTTP_400_BAD_REQUEST)


class CourseDetailAPITestCase(APITestCase):

    def setUp(self):
        user = User.objects.create_user(username="testuser", password="secret")
        Course.objects.create(
            title="set up",
            description="nothing",
            difficulty="BG",
            thumbnail="images/images/skillz.jpg",
            created_by=user,
                        weeks=18,

        )
        Course.objects.create(
            title="set up2",
            description="nothing2",
            difficulty="BG",
            thumbnail="images/images/skillz.jpg",
            created_by=user,
                        weeks=18,

        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "secret"},
            
        )
        token = response.json()

        self.authenticated_client.force_authenticate(user=user, token=token["access"])
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_course(self):
        """
        Ensure we can retreive a course instance
        """

        client = APIClient(enforce_csrf_checks=True)
        response1 = client.get(reverse("learn:course-detail", args=[1]))
        response2 = client.get(reverse("learn:course-detail", args=[2]))
        response3 = client.get(reverse("learn:course-detail", args=[3]))
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response3.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_course(self):
        """
        Ensure we can update a course instance
        """

        # test update instance with unauthenticated client
        response = self.unauthenticated_client.put(
            reverse("learn:course-detail", args=[1]),
            {
                "title": "test unauth",
                "description": "test unauth",
                "difficulty": "AD",
                "weeks": 1
            },
            
        )
        # test update instance with an authenticated client and invalid fields
        response_2 = self.authenticated_client.put(
            reverse("learn:course-detail", args=[1]),
            {
                "title": "test changing title",
                "description": "",
                "difficulty": "abc",
                "weeks": 2
            },
            
        )
        # test update instance with an invalid course id
        response_3 = self.authenticated_client.put(
            reverse("learn:course-detail", args=[3]),
            {
                "title": "test changing title",
                "description": "",
                "difficulty": "abc",
                "weeks": 2

            },
            
        )

        # test update course with an authenticated client
        response_4 = self.authenticated_client.put(
            reverse("learn:course-detail", args=[1]),
            {
                "title": "changing title using put",
                "description": "nothing1",
                "difficulty": "AD",
                "weeks": 2

            },
            
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_200_OK)
        self.assertEqual(response_4.data["title"], "changing title using put")
        self.assertEqual(response_4.data['weeks'], 2)

    def test_delete_course(self):
        """
        Ensure we can delete a course instance
        """

        # test delete instance with an unathenticated client
        response = self.unauthenticated_client.delete(
            reverse("learn:course-detail", args=[2])
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # test delete instance with an authenticated client
        response = self.authenticated_client.delete(
            reverse("learn:course-detail", args=[2])
        )

        courses = Course.objects.filter(id=1)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(courses), 1)


class CourseContentDetailAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.course1 = Course.objects.create(
            title="Testing Content",
            description="Lorem ipsum",
            difficulty="BG",
            created_by=self.user,
                        weeks=18,

        )
        self.course2 = Course.objects.create(
            title="Testing Content",
            description="Lorem ipsum",
            difficulty="BG",
            created_by=self.user,
                        weeks=18,

        )
        self.content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course2,
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"), {"username": "testuser", "password": "secret"}
        )
        token = response.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )

    def test_retrieve_course_content(self):
        client = APIClient(enforce_csrf_checks=True)
        response_1 = client.get(reverse("learn:course-content", args=[2]))
        response_2 = client.get(reverse("learn:course-content", args=[1]))

        self.assertEqual(response_1.status_code, status.HTTP_200_OK)
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_1.data["preview"], self.content.preview)
        self.assertEqual(response_1.data["overview"], self.content.overview)
        self.assertEqual(self.user, self.content.course.created_by)

    def test_create_course_content(self):
        # test create content with an authenticated client
        response_1 = self.authenticated_client.post(
            reverse("learn:course-content", args=[1]),
            {
                "preview": "https://www.youtube.com",
                "overview": "testing post method",
            },
            
        )
        # test create content with an unauthenticated client
        response_2 = self.unauthenticated_client.post(
            reverse("learn:course-content", args=[1]),
            {
                "preview": "https://www.youtube.com",
                "overview": "testing post method",
            },
            
        )

        self.assertEqual(response_1.status_code, status.HTTP_200_OK)
        self.assertEqual(response_1.data["overview"], "testing post method")
        self.assertEqual(response_1.data["preview"], "https://www.youtube.com")
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_course_content(self):
        # test update instance with an authenticated client
        response_1 = self.authenticated_client.put(
            reverse("learn:course-content", args=[2]),
            {
                "preview": "https://www.youtube.com",
                "overview": "testing Put method brah",
            },
            
        )

        # test update instance with an unanthenticated client
        response_2 = self.unauthenticated_client.put(
            reverse("learn:course-content", args=[2]),
            {
                "preview": "https://www.youtube.com",
                "overview": "testing Put method brah",
            },
            
        )

        # test update CourseContent instance that doesn't exist
        response_3 = self.authenticated_client.put(
            reverse("learn:course-content", args=[1]),
            {
                "preview": "https://www.youtube.com",
                "overview": "testing Put method brah",
            },
            
        )

        self.assertEqual(response_1.status_code, status.HTTP_200_OK)
        self.assertEqual(response_1.data["overview"], "testing Put method brah")
        self.assertEqual(response_1.data["preview"], "https://www.youtube.com")
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)


class WorkoutListAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.course = Course.objects.create(title="Test Course", created_by=self.user,             weeks=18,
)
        
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        self.section = Section.objects.create(course_content=self.course_content, heading="testing")
        self.section_item = SectionItem.objects.create(
            section=self.section, description="go to this and that and that "
        )

        self.workout = Workouts.objects.create(
            section_item=self.section_item,
            exercise="Test Exercse",
            intensity="L",
            rest_time=60,
            sets=3,
            reps=10,
            excertion=5,
        )
        self.authenticated_client = APIClient(enforce_csrf_checks=True)
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

    def tearDown(self):
        # prevents accumulating picture/image (i.e deletes files that were created by this test case)
        for filename in glob.glob("images/workouts/picture_*.gif"):
            os.remove(filename)

        # for filename in glob.glob("images/picture_*.gif"):
        #     os.remove(filename)

        # remove the specific 'picture.gif' file
        if os.path.exists("images/workouts/picture.gif"):
            os.remove("images/workouts/picture.gif")

    def test_retrieve_workout_list(self):
        """
        Ensure we can retreive the list of workouts
        """
        client = APIClient(enforce_csrf_checks=True)
        response_1 = client.get(reverse("learn:course-workout-list", args=[1]))
        response_2 = client.get(reverse("learn:course-workout-list", args=[2]))

        self.assertEqual(response_1.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)
        self.assertListEqual(response_2.data, [])

    def test_create_workout(self):
        """
        Ensure we can create a new workout
        """

        with open("images/images/chinupVecs.gif", "rb") as file:
            image = SimpleUploadedFile(
                "picture.gif", file.read(), content_type="image/gif"
            )

        # test create workout with an authenticated client
        response_1 = self.authenticated_client.post(
            reverse("learn:course-workout-list", args=[1]),
            {
                "exercise": "Reverse Plank bridge",
                "demo": image,
                "intensity": "M",
                "rest_time": "1",
                "sets": "3",
                "reps": "60",
                "excertion": "8",
            },
        )

        image.seek(0)

        # test create workout with an unatuhenticated client
        response_2 = self.unauthenticated_client.post(
            reverse("learn:course-workout-list", args=[1]),
            {
                "exercise": "Reverse Plank bridge",
                "demo": image,
                "intensity": "H",
                "rest_time": "1",
                "sets": "3",
                "reps": "60",
                "excertion": "8",
            },
        )

        # test create workout with an empty field
        response_3 = self.authenticated_client.post(
            reverse("learn:course-workout-list", args=[1]),
            {
                "exercise": "",
                "demo": "",
                "intensity": "",
                "rest_time": "",
                "sets": "",
                "reps": "",
                "excertion": "",
            },
        )

        # test create workout with an invalid field
        response_4 = self.authenticated_client.post(
            reverse("learn:course-workout-list", args=[1]),
            {
                "exercise": 1,
                "demo": "lmao",
                "intensity": 2,
                "rest_time": "lmao",
                "sets": 3,
                "reps": "lmao",
                "excertion": 5,
            },
        )

        self.assertEqual(response_1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_1.data["exercise"], "Reverse Plank bridge")
        self.assertIn(
            "images",
            response_1.data["demo"],
        )
        self.assertEqual(response_1.data["intensity"], "M")
        self.assertEqual(response_1.data["rest_time"], 1)
        self.assertEqual(response_1.data["sets"], 3)
        self.assertEqual(response_1.data["reps"], 60)
        self.assertEqual(response_1.data["excertion"], 8)

        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_400_BAD_REQUEST)


class WorkoutDetailAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")

        self.course = Course.objects.create(title="Test Course", created_by=self.user,             weeks=18,
)        
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        self.section = Section.objects.create(
            heading="Testing section", course_content=self.course_content
        )
        self.section_item = SectionItem.objects.create(
            section=self.section, lecture="https://www.youtube.com"
        )
        self.workout = Workouts.objects.create(
            section_item=self.section_item,
            exercise="Test Exercse",
            intensity="L",
            rest_time=60,
            sets=3,
            reps=10,
            excertion=5,
        )
        self.authenticated_client = APIClient(enforce_csrf_checks=True)
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

    def tearDown(self):
        # prevents accumulating picture/image (i.e deletes files that were created by this test case)
        for filename in glob.glob("images/workouts/picture_*.gif"):
            os.remove(filename)

        # for filename in glob.glob("images/picture_*.gif"):
        #     os.remove(filename)

        # remove the specific 'picture.gif' file
        if os.path.exists("images/workouts/picture.gif"):
            os.remove("images/workouts/picture.gif")

    def test_retrieve_workout(self):
        """
        Ensure we can retrieve a workout instance
        """
        client = APIClient(enforce_csrf_checks=True)
        response = client.get(
            reverse("learn:course-workout-detail", args=[1]),
        )

        response_2 = client.get(
            reverse("learn:course-workout-detail", args=[4]),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data)
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_workout(self):
        """
        Ensure we can update a workout instance
        """

        with open("images/images/chinupVecs.gif", "rb") as file:
            image = SimpleUploadedFile(
                "picture.gif", file.read(), content_type="image/gif"
            )

        # test update instance with an authenticated client
        response_1 = self.authenticated_client.put(
            reverse("learn:course-workout-detail", args=[1]),
            {
                "exercise": "Hollow body Plank",
                "demo": image,
                "intensity": "M",
                "rest_time": 1,
                "sets": 3,
                "reps": 60,
                "excertion": 8,
            },
        )

        image.seek(0)

        # test update instance with an unauthenticated client
        response_2 = self.unauthenticated_client.put(
            reverse("learn:course-workout-detail", args=[1]),
            {
                "exercise": "Hollow body Plank",
                "demo": image,
                "intensity": "M",
                "rest_time": 1,
                "sets": 3,
                "reps": 60,
                "excertion": 8,
            },
        )

        image.seek(0)

        # test update instance with an invalid field
        response_3 = self.authenticated_client.put(
            reverse("learn:course-workout-detail", args=[1]),
            {
                "exercise": 1,
                "demo": "images/images/chinupVecs.gif",
                "intensity": "BG",
                "rest_time": 1,
                "sets": 3,
                "reps": 60,
                "excertion": 8,
            },
        )

        image.seek(0)

        # test update instance with an authenticated client and empty body
        response_4 = self.authenticated_client.put(
            reverse("learn:course-workout-detail", args=[1]), {}, format="json"
        )

        # dict = {
        #     "id": 1,
        #     "exercise": "Hollow body Plank",
        #     "demo": "http://127.0.0.1:8000/images/images/chinupVecs.gif",
        #     "intensity": "M",
        #     "rest_time": 1,
        #     "sets": 3,
        #     "reps": 60,
        #     "excertion": 8,
        #     "section_item": 1,
        # }
        self.assertEqual(response_1.status_code, status.HTTP_200_OK)
        # self.assertDic(response_1.data, dict)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_workout(self):
        """
        Ensure we can delete a workout instance
        """

        # test delete  with an unauthenticated client
        response1 = self.unauthenticated_client.delete(
            reverse("learn:course-workout-detail", args=[1])
        )

        # test delete request with an authenticated client
        response2 = self.authenticated_client.delete(
            reverse("learn:course-workout-detail", args=[1])
        )

        self.assertEqual(response2.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response1.status_code, status.HTTP_403_FORBIDDEN)


class CourseCommentListAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        self.course = Course.objects.create(title="test", created_by=self.user,             weeks=18,
)
        self.course_2 = Course.objects.create(title="test_2", created_by=self.user,             weeks=18,
)

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unathenticated_client = APIClient(enforce_csrf_checks=True)

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
            user=self.user_2, token=token_2["access"]
        )
        self.unathenticated_client.force_authenticate(user=None)

    def test_retrieve_comment_list(self):
        """
        Ensure we can retrieve the list of comments for a course
        """
        self.authenticated_client.post(
            reverse("learn:course-comments", args=[1]),
            {"comment": "testing for retrieval"},
            
        )

        client = APIClient(enforce_csrf_checks=True)

        # test the first created course and retrieve it's comments with client
        response = self.authenticated_client.get(
            reverse("learn:course-comments", args=[1])
        )

        # test the second created course (which is empty) and retrieve it's comments with client
        response_2 = client.get(reverse("learn:course-comments", args=[2]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn("testing", response.data[0]["comment"])
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertListEqual(response_2.data, [])

    def test_course_create_comment(self):
        """
        Ensure we can create a comment for a course
        """

        # test create comment with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:course-comments", args=[1]),
            {"comment": "testing authenticated client to comment"},
            
        )
        # test create comment with an unauthenticated client
        response_2 = self.unathenticated_client.post(
            reverse("learn:course-comments", args=[1]),
            {"comment": "testing unauthenticated client to comment"},
            
        )

        # test create comment with an invalid key or field
        response_3 = self.authenticated_client.post(
            reverse("learn:course-comments", args=[1]),
            {"wrongField": "testing authenticated client to comment"},
            
        )

        # test create comment with an authenticated client 2 and have it reply to authenticated client 1's comment
        response_4 = self.authenticated_client_2.post(
            reverse("learn:course-comments", args=[1]),
            {"comment": "testing authenticated client to comment", "parent_comment": 1},
            
        )

        # test create comment with an empty field / data
        response_5 = self.authenticated_client.post(
            reverse("learn:course-comments", args=[1]), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["comment"], "testing authenticated client to comment"
        )
        self.assertEqual(response.data["username"], self.user.username)
        self.assertIsNone(response.data["parent_comment"])
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_4.data["username"], self.user_2.username)
        self.assertEqual(response_4.data["parent_comment"], response.data["id"])
        self.assertEqual(response_5.status_code, status.HTTP_400_BAD_REQUEST)


class CourseCommentDetailAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        course = Course.objects.create(title="test", created_by=self.user_2,             weeks=18,
)
        self.comment = CourseComments.objects.create(
            course=course, comment="to modify", comment_by=self.user
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
        self.authenticated_client.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_course_comment(self):
        """
        Ensure we can retrieve a course comment instance
        """

        # test retrieve instance
        response = self.authenticated_client.get(
            reverse("learn:course-comment", args=[1])
        )

        # test retrieve intsance that doesn't exist
        response_2 = self.unauthenticated_client.get(
            reverse("learn:course-comment", args=[3])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.user.username)
        self.assertIn("to modify", response.data["comment"])
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_course_comment(self):
        """
        Ensure we can update a course comment instance
        """

        # test update instance with an authenticated user's own comment
        response = self.authenticated_client.put(
            reverse("learn:course-comment", args=[1]),
            {"comment": "modified"},
            
        )

        # test update instance with an authenticated user's own comment and change comment by
        response_2 = self.authenticated_client.put(
            reverse("learn:course-comment", args=[1]),
            {"comment": "modified comment_by", "comment_by": 2},
            
        )

        # test update instance that doesn't exist
        response_3 = self.authenticated_client.put(
            reverse("learn:course-comment", args=[4]), {"comment": "idk"}, format="json"
        )

        # test update instance with an authenticated user's own comment and not put any field
        response_4 = self.authenticated_client.put(
            reverse("learn:course-comment", args=[1]), {}, format="json"
        )

        # test update instance with an authenticated client != comment_by
        response_5 = self.authenticated_client_2.put(
            reverse("learn:course-comment", args=[1]),
            {"comment": "modifiying"},
            
        )

        # test update instance with unathenticated client != comment_by
        response_6 = self.unauthenticated_client.put(
            reverse("learn:course-comment", args=[1]),
            {"comment": "modifiying"},
            
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("modified", response.data["comment"])
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertEqual(response_2.data["username"], self.user.username)
        self.assertNotEqual(response_2.data["username"], self.user_2.username)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_5.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_6.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_course_comment(self):
        """
        Ensure we can delete a course comment instance
        """

        # test delete instance with an unauthenticated client != comment_by
        response = self.unauthenticated_client.delete(
            reverse("learn:course-comment", args=[1])
        )

        # test delete instance with an authenticated client != comment_by
        response_2 = self.authenticated_client_2.delete(
            reverse("learn:course-comment", args=[1])
        )

        # test delete instance that doesn't exist
        response_3 = self.authenticated_client.delete(
            reverse("learn:course-comment", args=[5])
        )

        # test delete instance with an authenticated client != comment_by
        response_4 = self.authenticated_client.delete(
            reverse("learn:course-comment", args=[1])
        )

        comments = CourseComments.objects.filter(course=1)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(comments), 0)


class CorrectExerciseFormListAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        course = Course.objects.create(title="test", created_by=self.user,             weeks=18,
)
        
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=course,
        )
        section = Section.objects.create(heading="week 5", course_content=self.course_content)
        section_item = SectionItem.objects.create(
            section=section, lecture="https://www.youtube.com"
        )
        workout = Workouts.objects.create(
            section_item=section_item,
            exercise="Regular dips",
            demo="images/images/chinwhiteup.gif",
        )
        CorrectExerciseForm.objects.create(
            demo="images/images/chinwhiteup.gif",
            description="scapula retracted during eccentric",
            workout=workout,
        )
        CorrectExerciseForm.objects.create(
            demo="images/images/chinwhiteup.gif",
            description="lean torso",
            workout=workout,
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
        self.authenticated_client.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def tearDown(self):
        # prevents accumulating picture/image (i.e deletes files that were created by this test case)
        for filename in glob.glob("images/correct_exercise_form/picture_*.gif"):
            os.remove(filename)

        # for filename in glob.glob("images/correct_exercise_form/picture_*.gif"):
        #     os.remove(filename)

        # remove the specific 'picture.gif' file
        if os.path.exists("images/correct_exercise_form/picture.gif"):
            os.remove("images/correct_exercise_form/picture.gif")

    def test_retrieve_correct_exercise_list(self):
        """
        Ensure we can retrieve the correct exercise list for a course.
        """
        client = APIClient()
        response = client.get(reverse("learn:correct-exercise-list", args=[1]))
        response_2 = client.get(reverse("learn:correct-exercise-list", args=[3]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertListEqual(response_2.data, [])

    def test_create_correct_exercise_demo(self):
        """
        Ensure we can create a correct exercise demo
        """

        with open("images/images/chinupVecs.gif", "rb") as file:
            image = SimpleUploadedFile(
                "picture.gif", file.read(), content_type="image/gif"
            )

        # test create correct exercise demo with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:correct-exercise-list", args=[1]),
            {
                "demo": image,
                "description": "scapula depressed",
            },
        )

        image.seek(0)

        # test create correct exercise demo with an authenticated client != created_by
        response_2 = self.authenticated_client_2.post(
            reverse("learn:correct-exercise-list", args=[1]),
            {
                "demo": image,
                "description": "idk don't be bad",
            },
        )

        image.seek(0)

        # test create correct exercise demo that a workout instance doesn't exist
        response_3 = self.authenticated_client.post(
            reverse("learn:correct-exercise-list", args=[5]),
            {
                "demo": image,
                "description": "idk",
            },
        )

        image.seek(0)

        # test create correct exercise demo with an unauthenticated client
        response_4 = self.unauthenticated_client.post(
            reverse("learn:correct-exercise-list", args=[1]),
            {"demo": image, "description": "idk"},
        )

        # test create correct exercise demo with an empty field
        response_5 = self.authenticated_client.post(
            reverse("learn:correct-exercise-list", args=[1])
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("scapula", response.data["description"])
        self.assertIn("images", response.data["demo"])
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_5.status_code, status.HTTP_400_BAD_REQUEST)


class CorrectExerciseFormDetailAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        course = Course.objects.create(title="test", created_by=self.user,             weeks=18,
)
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=course,
        )
        section = Section.objects.create(
            course_content=self.course_content, heading="idk just section testing"
        )
        section_item = SectionItem.objects.create(
            section=section, description="nothing just go on after this set go on"
        )
        workout = Workouts.objects.create(
            section_item=section_item,
            exercise="Regular dips",
            demo="images/images/pushupVecs.gif",
        )
        CorrectExerciseForm.objects.create(
            demo="images/images/pushupVecs.gif",
            description="scapula retracted during eccentric",
            workout=workout,
        )
        CorrectExerciseForm.objects.create(
            demo="images/images/pushupVecs.gif",
            description="lean torso",
            workout=workout,
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
        self.authenticated_client.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def tearDown(self):
        # prevents accumulating picture/image (i.e deletes files that were created by this test case)
        for filename in glob.glob("images/correct_exercise_form/picture_*.gif"):
            os.remove(filename)

        # for filename in glob.glob("images/picture_*.gif"):
        #     os.remove(filename)

        # remove the specific 'picture.gif' file
        if os.path.exists("images/correct_exercise_form/picture.gif"):
            os.remove("images/correct_exercise_form/picture.gif")

    def test_retrieve_correct_exercise_demo(self):
        """
        Ensure we can retrieve a correct exercise form instance
        """

        client = APIClient(enforce_csrf_checks=True)
        response = client.get(reverse("learn:correct-exercise-detail", args=[1]))
        response_2 = client.get(reverse("learn:correct-exercise-detail", args=[2]))
        response_3 = client.get(reverse("learn:correct-exercise-detail", args=[5]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("images", response.data["demo"])
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertIn("images", response.data["demo"])
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_correct_exercise_demo(self):
        """
        Ensure we can update a correct exercise form instance
        """

        with open("images/images/pushupVecs.gif", "rb") as file:
            image = SimpleUploadedFile(
                "picture.gif", file.read(), content_type="image/gif"
            )

        # test update instance with an authenticated client
        response = self.authenticated_client.put(
            reverse("learn:correct-exercise-detail", args=[1]),
            {
                "demo": image,
                "description": "shoulder blades down",
            },
        )

        image.seek(0)

        # test update instance with an authenticated client != created_by
        response_2 = self.authenticated_client_2.put(
            reverse("learn:correct-exercise-detail", args=[1]),
            {
                "demo": image,
                "description": "shoulder blades down",
            },
        )

        image.seek(0)

        # test update instance with an empty fields
        response_3 = self.authenticated_client.put(
            reverse("learn:correct-exercise-detail", args=[1])
        )

        image.seek(0)

        # test update instance that doesn't exists
        response_4 = self.authenticated_client.put(
            reverse("learn:correct-exercise-detail", args=[5]),
            {
                "demo": image,
                "description": "shoulder blades down",
            },
        )

        image.seek(0)

        # test update instance with an unathenticated client
        response_5 = self.unauthenticated_client.put(
            reverse("learn:correct-exercise-detail", args=[1]),
            {
                "demo": image,
                "description": "shoulder blades down",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_5.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_correct_exercise_demo(self):
        """
        Ensure we can delete a correct exercise form instance
        """

        # test delete instance with an unauthenticated client
        response = self.unauthenticated_client.delete(
            reverse("learn:correct-exercise-detail", args=[1])
        )

        # test delete instance with an authenticated client != created_by
        response_2 = self.authenticated_client_2.delete(
            reverse("learn:correct-exercise-detail", args=[1])
        )

        # test delete instance does NOT exist
        response_3 = self.unauthenticated_client.delete(
            reverse("learn:correct-exercise-detail", args=[5])
        )

        # test delete instance with an authenticated client
        response_4 = self.authenticated_client.delete(
            reverse("learn:correct-exercise-detail", args=[1])
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_204_NO_CONTENT)


class WrongExerciseFormListAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        course = Course.objects.create(title="test", created_by=self.user,             weeks=18,
)       
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=course,
        )
        section = Section.objects.create(course_content=self.course_content, heading="WEEK 4")
        section_item = SectionItem.objects.create(
            section=section, description="GO ON GO GO GO GO GO"
        )
        workout = Workouts.objects.create(
            section_item=section_item,
            exercise="Regular dips",
            demo="images/images/pushupVecs.gif",
        )
        WrongExerciseForm.objects.create(
            demo="images/images/pushupVecs.gif",
            description="shrugging",
            workout=workout,
        )
        WrongExerciseForm.objects.create(
            demo="images/images/pushupVecs.gif",
            description="flared elbows",
            workout=workout,
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
        self.authenticated_client.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def tearDown(self):
        # prevents accumulating picture/image (i.e deletes files that were created by this test case)
        for filename in glob.glob("images/wrong_exercise_form/picture_*.gif"):
            os.remove(filename)

        # for filename in glob.glob("images/wrong_exercise_form/picture_*.gif"):
        #     os.remove(filename)

            # remove the specific 'picture.gif' file
        if os.path.exists("images/wrong_exercise_form/picture.gif"):
            os.remove("images/wrong_exercise_form/picture.gif")

    def test_retrieve_wrong_exercise_list(self):
        """
        Ensure we can retrieve the wrong exercise list for a course.
        """
        client = APIClient()
        response = client.get(reverse("learn:wrong-exercise-list", args=[1]))
        response_2 = client.get(reverse("learn:wrong-exercise-list", args=[3]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertListEqual(response_2.data, [])

    def test_create_wrong_exercise_demo(self):
        """
        Ensure we can create a wrong exercise demo
        """

        with open("images/images/pushupVecs.gif", "rb") as file:
            image = SimpleUploadedFile(
                "picture.gif", file.read(), content_type="image/gif"
            )

        # test create wrong exercise demo with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:wrong-exercise-list", args=[1]),
            {
                "demo": image,
                "description": "scapula elevation",
            },
        )

        image.seek(0)

        # test create wrong exercise demo with an authenticated client != created_by
        response_2 = self.authenticated_client_2.post(
            reverse("learn:wrong-exercise-list", args=[1]),
            {
                "demo": image,
                "description": "idk don't be bad",
            },
        )

        image.seek(0)

        # test create wrong exercise demo that a workout instance doesn't exist
        response_3 = self.authenticated_client.post(
            reverse("learn:wrong-exercise-list", args=[5]),
            {
                "demo": image,
                "description": "idk",
            },
        )

        image.seek(0)

        # test create wrong exercise demo with an unauthenticated client
        response_4 = self.unauthenticated_client.post(
            reverse("learn:wrong-exercise-list", args=[1]),
            {"demo": image, "description": "idk"},
        )

        # test create wrong exercise demo with an empty field
        response_5 = self.authenticated_client.post(
            reverse("learn:wrong-exercise-list", args=[1])
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("scapula", response.data["description"])
        self.assertIn("picture", response.data["demo"])
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_5.status_code, status.HTTP_400_BAD_REQUEST)


class WrongExerciseFormDetailAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="secret")
        self.user_2 = User.objects.create_user(username="testuser2", password="secret")
        course = Course.objects.create(title="test", created_by=self.user,             weeks=18,
)
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=course,
        )
        section = Section.objects.create(heading="week 60", course_content=self.course_content)
        section_item = SectionItem.objects.create(
            section=section, lecture="https://www.youtube.com/watchme"
        )
        workout = Workouts.objects.create(
            section_item=section_item,
            exercise="Regular dips",
            demo="images/images/pushupVecs.gif",
        )
        WrongExerciseForm.objects.create(
            demo="images/images/pushupVecs.gif",
            description="scapula protracted during eccentric",
            workout=workout,
        )
        WrongExerciseForm.objects.create(
            demo="images/images/pushupVecs.gif",
            description="upright body",
            workout=workout,
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
        self.authenticated_client.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def tearDown(self):
        # prevents accumulating picture/image (i.e deletes files that were created by this test case)
        for filename in glob.glob("images/wrong_exercise_form/picture_*.gif"):
            os.remove(filename)

        # for filename in glob.glob("images/picture_*.gif"):
        #     os.remove(filename)

        # remove the specific 'picture.gif' file
        if os.path.exists("images/wrong_exercise_form/picture.gif"):
            os.remove("images/wrong_exercise_form/picture.gif")

    def test_retrieve_wrong_exercise_demo(self):
        """
        Ensure we can retrieve a wrong exercise form instance
        """

        client = APIClient(enforce_csrf_checks=True)
        response = client.get(reverse("learn:wrong-exercise-detail", args=[1]))
        response_2 = client.get(reverse("learn:wrong-exercise-detail", args=[2]))
        response_3 = client.get(reverse("learn:wrong-exercise-detail", args=[5]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("images", response.data["demo"])
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertIn("images", response.data["demo"])
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_wrong_exercise_demo(self):
        """
        Ensure we can update a wrong exercise form instance
        """

        with open("images/images/pushupVecs.gif", "rb") as file:
            image = SimpleUploadedFile(
                "picture.gif", file.read(), content_type="image/gif"
            )

        # test update instance with an authenticated client
        response = self.authenticated_client.put(
            reverse("learn:wrong-exercise-detail", args=[1]),
            {
                "demo": image,
                "description": "shoulder blades down",
            },
        )

        image.seek(0)

        # test update instance with an authenticated client != created_by
        response_2 = self.authenticated_client_2.put(
            reverse("learn:wrong-exercise-detail", args=[1]),
            {
                "demo": image,
                "description": "shoulder blades up",
            },
        )

        image.seek(0)

        # test update instance with an empty fields
        response_3 = self.authenticated_client.put(
            reverse("learn:wrong-exercise-detail", args=[1])
        )

        # test update instance that doesn't exists
        response_4 = self.authenticated_client.put(
            reverse("learn:wrong-exercise-detail", args=[5]),
            {
                "demo": image,
                "description": "shoulder blades down",
            },
        )

        image.seek(0)

        # test update instance with an unathenticated client
        response_5 = self.unauthenticated_client.put(
            reverse("learn:wrong-exercise-detail", args=[1]),
            {
                "demo": image,
                "description": "shoulder blades down",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_5.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_wrong_exercise_demo(self):
        """
        Ensure we can delete a wrong exercise form instance
        """

        # test delete instance with an unauthenticated client
        response = self.unauthenticated_client.delete(
            reverse("learn:wrong-exercise-detail", args=[1])
        )

        # test delete instance with an authenticated client != created_by
        response_2 = self.authenticated_client_2.delete(
            reverse("learn:wrong-exercise-detail", args=[1])
        )

        # test delete instance does NOT exist
        response_3 = self.unauthenticated_client.delete(
            reverse("learn:wrong-exercise-detail", args=[5])
        )

        # test delete instance with an authenticated client
        response_4 = self.authenticated_client.delete(
            reverse("learn:wrong-exercise-detail", args=[1])
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_204_NO_CONTENT)
