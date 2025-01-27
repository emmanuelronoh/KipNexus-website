from django.urls import reverse
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


class SectionListAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="123")
        self.user_2 = User.objects.create_user(username="testuser2", password="123")
        self.course = Course.objects.create(
            title="testcourse",
            created_by=self.user,
            weeks=18,
        )

        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        self.section = Section.objects.create(heading="test week 5", course_content=self.course_content)
        self.section_2 = Section.objects.create(
            heading="test week 6", course_content=self.course_content
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "123"},
            
        )
        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "123"},
            
        )
        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_section_list(self):
        """
        Ensure we can retrieve the list of sections
        """

        response = self.authenticated_client.get(
            reverse("learn:course-section-list", args=[1])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertAlmostEqual(response.data[0]["heading"], "test week 5")
        self.assertAlmostEqual(response.data[1]["heading"], "test week 6")

    def test_create_section(self):
        """
        Ensure we can create a section
        """

        # test create section with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:course-section-list", args=[1]),
            {
                "heading": "testing creation",
            },
            
        )

        # test create section with an empty field
        response_2 = self.authenticated_client.post(
            reverse("learn:course-section-list", args=[1]), {}, format="json"
        )

        # test create section with an authenticated client != course's created_by
        response_3 = self.authenticated_client_2.post(
            reverse("learn:course-section-list", args=[1]),
            {"heading": "not my own course"},
            
        )

        # test create section with an unauthenticated client
        response_4 = self.unauthenticated_client.post(
            reverse("learn:course-section-list", args=[1]),
            {"heading": "try adding section"},
            
        )

        # test create section with an authenticated client and a course that doesn't exist
        response_5 = self.authenticated_client.post(
            reverse("learn:course-section-list", args=[2]),
            {"heading": "testing no course"},
            
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["heading"], "testing creation")
        self.assertIsNotNone(response.data)
        self.assertEqual(response_2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_3.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_4.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_5.status_code, status.HTTP_404_NOT_FOUND)


class SectionDetailAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="123")
        self.user_2 = User.objects.create_user(username="testuser2", password="123")
        self.course = Course.objects.create(
            title="testcourse",
            created_by=self.user,
            weeks=18,
        )
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        self.section = Section.objects.create(heading="test week 1", course_content=self.course_content)

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "123"},
            
        )
        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "123"},
            
        )
        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_section(self):
        """
        Ensure we can retrieve a section instance
        """

        # test retrieve a section instance
        response = self.authenticated_client.get(
            reverse("learn:course-section-detail", args=[1])
        )
        # test retrieve a section instance that doesnt exist
        response_2 = self.authenticated_client.get(
            reverse("learn:course-section-detail", args=[4])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["heading"], "test week 1")
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_section(self):
        """
        Ensure we can update a section instance
        """

        # test update instance with an authenticated client
        response = self.authenticated_client.put(
            reverse("learn:course-section-detail", args=[1]),
            {"heading": "testing new heading"},
            
        )

        # test update instance that doesn't exist with an auth client
        response_2 = self.authenticated_client.put(
            reverse("learn:course-section-detail", args=[6]),
            {"heading": "testing new heading"},
            
        )

        # test update instance with an empty field and authenticated client
        response_3 = self.authenticated_client.put(
            reverse("learn:course-section-detail", args=[1]), {}, format="json"
        )

        # test update instance with an authenticated client != course's created_by
        response_4 = self.authenticated_client_2.put(
            reverse("learn:course-section-detail", args=[1]), {"heading": "testing"}
        )

        # test update instance with an unauthenticated client
        response_5 = self.unauthenticated_client.put(
            reverse("learn:course-section-detail", args=[1]),
            {"heading": "nothing"},
            
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["heading"], "testing new heading")
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_4.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_5.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_section(self):
        """
        Ensure we can delete a section instance
        """

        # test delete instance with an unauthenticated client
        response = self.unauthenticated_client.delete(
            reverse("learn:course-section-detail", args=[1])
        )

        # test delete instance that doesn't exist with auth client
        response_2 = self.authenticated_client.delete(
            reverse("learn:course-section-detail", args=[6])
        )

        # test delete instance with an authenticated client != course's created by
        response_3 = self.authenticated_client_2.delete(
            reverse("learn:course-section-detail", args=[1])
        )

        # test delete instance with an authenticated client
        response_4 = self.authenticated_client.delete(
            reverse("learn:course-section-detail", args=[1])
        )

        # check the instance if it reallly is deleted
        response_5 = self.authenticated_client.get(
            reverse("learn:course-section-detail", args=[1])
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_3.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_4.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response_5.status_code, status.HTTP_404_NOT_FOUND)


class SectionItemListAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="123")
        self.user_2 = User.objects.create_user(username="testuser2", password="123")
        self.course = Course.objects.create(
            title="testcourse",
            created_by=self.user,
            weeks=18,
        )
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        self.section = Section.objects.create(heading="test week 5", course_content=self.course_content)
        self.section_item = SectionItem.objects.create(
            section=self.section,
            description="testing just testing just testing",
            lecture="https://www.youtube.com/testing",
            heading="testing item lol",
        )
        self.section_item_2 = SectionItem.objects.create(
            section=self.section,
            description="testing just another test lmao",
            lecture="https://www.youtube/com/wwatchthistest",
            heading="testing item 2",
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "123"},
            
        )
        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "123"},
            
        )
        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_section_item_list(self):
        """
        Ensure we can retrieve the list of section items
        """

        response = self.authenticated_client.get(
            reverse("learn:section-item-list", args=[1])
        )
        response_2 = self.authenticated_client_2.get(
            reverse("learn:section-item-list", args=[4])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("testing", response.data[0]["description"])
        self.assertIn("testing", response.data[1]["description"])
        self.assertIn("testing", response.data[0]["heading"])
        self.assertIn("testing", response.data[1]["heading"])
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertListEqual(response_2.data, [])

    def test_create_section_item(self):
        """
        Ensure we can create a section item
        """

        # test create section item with an authenticated client
        response = self.authenticated_client.post(
            reverse("learn:section-item-list", args=[1]),
            {
                "lecture": "https://www.youtube.com/readme",
                "description": "go move here",
                "heading": "nothing just test heading for a section item",
            },
            
        )

        # test create section item with an authenticated client and section that doesn't exist
        response_2 = self.authenticated_client.post(
            reverse("learn:section-item-list", args=[6]),
            {
                "lecture": "https://facebook.com/lmao",
                "description": "noope",
                "heading": "nothing just test heading for a section item",
            },
            
        )

        # test create section item with an authenticated client != course's created by
        response_3 = self.authenticated_client_2.post(
            reverse("learn:section-item-list", args=[1]),
            {
                "lecture": "https://youtube.com/nothing",
                "description": "lol",
                "heading": "nothing just test heading for a section item",
            },
            
        )

        # test create section item with an empty field and auth client
        response_4 = self.authenticated_client.post(
            reverse("learn:section-item-list", args=[1]), {}, format="json"
        )

        # test create section item with missing field
        response_5 = self.authenticated_client.post(
            reverse("learn:section-item-list", args=[1]),
            {
                "lecture": "https://youtube.com/stillokay",
            },
            
        )

        response_6 = self.unauthenticated_client.post(
            reverse("learn:section-item-list", args=[1]),
            {
                "lecture": "https://youtube.com/nope",
                "description": "still error",
                "heading": "nothing just test heading for a section item",
            },
            
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("youtube", response.data["lecture"])
        self.assertIn("go", response.data["description"])
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_3.status_code, status.HTTP_403_FORBIDDEN)
        self.assertNotEqual(response_4.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_5.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_6.status_code, status.HTTP_403_FORBIDDEN)


class SectionItemDetailAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="123")
        self.user_2 = User.objects.create_user(username="testuser2", password="123")
        self.course = Course.objects.create(
            title="testcourse",
            created_by=self.user,
            weeks=18,
        )
        self.course_content = CourseContent.objects.create(
            preview="https://www.youtube.com/watch?v=eTJQOi_xlTo&t=102s",
            overview="API TESTING",
            course=self.course,
        )
        self.section = Section.objects.create(
            heading="test week 100", course_content=self.course_content
        )
        self.section_item = SectionItem.objects.create(
            section=self.section,
            description="testing just testing just testing",
            lecture="https://www.youtube.com/testing",
            heading="testing section item heading",
        )
        self.section_item_2 = SectionItem.objects.create(
            section=self.section,
            description="testing just another test lmao",
            lecture="https://www.youtube/com/metest",
            heading="testing section item 2 heading",
        )

        self.authenticated_client = APIClient(enforce_csrf_checks=True)
        self.authenticated_client_2 = APIClient(enforce_csrf_checks=True)
        self.unauthenticated_client = APIClient(enforce_csrf_checks=True)

        response = self.authenticated_client.post(
            reverse("learn:login"),
            {"username": "testuser", "password": "123"},
            
        )
        response_2 = self.authenticated_client_2.post(
            reverse("learn:login"),
            {"username": "testuser2", "password": "123"},
            
        )
        token = response.json()
        token_2 = response_2.json()

        self.authenticated_client.force_authenticate(
            user=self.user, token=token["access"]
        )
        self.authenticated_client_2.force_authenticate(
            user=self.user_2, token=token_2["access"]
        )
        self.unauthenticated_client.force_authenticate(user=None)

    def test_retrieve_section_item(self):
        """
        Ensure we can retrieve a section item instance
        """

        # test retrieve section item instance
        response = self.authenticated_client.get(
            reverse("learn:section-item-detail", args=[1])
        )

        # test retrieve section item instance
        response_2 = self.authenticated_client.get(
            reverse("learn:section-item-detail", args=[2])
        )

        # test retrieve section item instance that doesnt exist
        response_3 = self.authenticated_client_2.get(
            reverse("learn:section-item-detail", args=[6])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("testing", response.data["description"])
        self.assertIn("youtube", response.data["lecture"])
        self.assertIn("testing", response.data["heading"])
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertIn("testing", response_2.data["description"])
        self.assertIn("youtube", response_2.data["lecture"])
        self.assertIn("testing", response.data["heading"])
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_section_item(self):
        """
        Ensure we can update a section item instance
        """

        # test update section item instance with an authenticated client
        response = self.authenticated_client.put(
            reverse("learn:section-item-detail", args=[1]),
            {
                "description": "new testing",
                "lecture": "https://youtube.com/calisthenics",
                "heading": "nothing just test heading for a section item",
            },
            
        )

        # test update section item instance with authenticated  client
        response_2 = self.authenticated_client.put(
            reverse("learn:section-item-detail", args=[2]),
            {
                "description": "new testing 2",
                "lecture": "https://instagram.com/video",
                "heading": "nothing just test heading for a section item",
            },
            
        )

        # test update section item instance that doesn't exist with auth client
        response_3 = self.authenticated_client.put(
            reverse("learn:section-item-detail", args=[6]),
            {
                "description": "new testing this put",
                "lecture": "https://youtube.com/calime",
                "heading": "nothing just test heading for a section item",
            },
            
        )

        # test update section item instance wtih an empty field and auth client
        response_4 = self.authenticated_client.put(
            reverse("learn:section-item-detail", args=[1]), {}, format="json"
        )

        # test update section item instance with an authenticated client != course's created by
        response_5 = self.authenticated_client_2.put(
            reverse("learn:section-item-detail", args=[2]),
            {
                "description": "something new ",
                "lecture": "https://udemy.com/lolno",
                "heading": "nothing just test heading for a section item",
            },
            
        )

        # test update section item instance with an empty field and auth client 2 -> forbidden anyway
        response_6 = self.authenticated_client_2.put(
            reverse("learn:section-item-detail", args=[1]),
            {"heading": "nothing just test heading for a section item"},
            
        )

        # test update section item instance with an unauthenticated client
        response_7 = self.unauthenticated_client.put(
            reverse("learn:section-item-detail", args=[1]),
            {
                "description": "trying to change it ",
                "lecture": "https://idk.com/anymore",
                "heading": "nothing just test heading for a section item",
            },
            
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("new testing", response.data["description"])
        self.assertIn("calisthenics", response.data["lecture"])
        self.assertIn("nothing", response.data["heading"])
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)
        self.assertIn("2", response_2.data["description"])
        self.assertIn("instagram", response_2.data["lecture"])
        self.assertEqual(response_3.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_4.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_5.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_6.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_7.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_section_item(self):
        """
        Ensure we can delete a section item instance
        """

        # test delete section item instance with an unauthenticated client
        response = self.unauthenticated_client.delete(
            reverse("learn:section-item-detail", args=[1])
        )

        # test delete section item instance that doesn't exist with auth client
        response_2 = self.authenticated_client.delete(
            reverse("learn:section-item-detail", args=[6])
        )

        # test delete section item instance with an authenticated client != course's created_by
        response_3 = self.authenticated_client_2.delete(
            reverse("learn:section-item-detail", args=[1])
        )

        # test delete section item instance with an authenticated client
        response_4 = self.authenticated_client.delete(
            reverse("learn:section-item-detail", args=[1])
        )

        # check if the instance is really deleted
        response_5 = self.authenticated_client.get(
            reverse("learn:section-item-detail", args=[1])
        )

        # test delete section item instance with an authenticated client again
        response_6 = self.authenticated_client.delete(
            reverse("learn:section-item-detail", args=[2])
        )

        # check if the instance is really deleted
        response_7 = self.authenticated_client.get(
            reverse("learn:section-item-detail", args=[2])
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_2.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_3.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response_4.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response_5.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_6.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response_7.status_code, status.HTTP_404_NOT_FOUND)
