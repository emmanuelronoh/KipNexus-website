from .views import *
from django.urls import path

app_name = "learn"
urlpatterns = [

    # API CALLS

    # User 
    path("register", RegisterView.as_view(), name="register"),
    path('login', LoginView.as_view(), name='login'), 
    # token_obtain_pair returns access and refresh token
    path('token/refresh', MyTokenRefreshView.as_view(), name='token_refresh'),
    
    path("user", UserView.as_view(), name="user"),
    path("user/<int:pk>", UserRetrieveView.as_view()),
    path("user-detail", UserMyDetailsView.as_view(), name="user-detail"),
    # path("users", UserList.as_view(), name="users"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("user/courses/progress", UserProgressList.as_view(), name="progress-list"),
    path("user/course/<int:pk>/progress", UserProgressDetail.as_view(), name="progress-detail"),
    path('user/enrollments', EnrollmentUserList.as_view(), name="courses-enrolled"),
    path('user/section/<int:pk>', UserSectionView.as_view(), name="user-section"),


    # Course 
    path('courses', CourseList.as_view(), name='course-list'),
    path('course/<int:pk>/rate', CourseRatingCreate.as_view(), name="course-rating"),
    path('course/rate/<int:pk>', CourseRatingDetail.as_view(), name="course-rating-detail"),
    path('course/<int:pk>', CourseDetail.as_view(), name='course-detail'),
    path('course/<int:pk>/course-content', CourseContentDetail.as_view(), name='course-content'),

    # Course's section
    path('sections/course-content/<int:pk>', SectionList.as_view(), name="course-section-list"),
    path('section/<int:pk>/course-content', SectionDetail.as_view(), name="course-section-detail"),
    path('section-items/section/<int:pk>', SectionItemList.as_view(), name="section-item-list"),
    path('section-item/<int:pk>/section', SectionItemDetail.as_view(), name="section-item-detail"),

    # workouts
    path('workouts/section-item/<int:pk>', WorkoutList.as_view(), name="course-workout-list"),
    path('workout/<int:pk>/section-item', WorkoutDetail.as_view(), name="course-workout-detail"),
    path('correct-exercises/course/workout/<int:pk>', CorrectExerciseFormList.as_view(), name="correct-exercise-list"),
    path('correct-exercise/<int:pk>/course/workout', CorrectExerciseFormDetail.as_view(), name="correct-exercise-detail"),
    path('wrong-exercises/course/workout/<int:pk>', WrongExerciseFormList.as_view(), name="wrong-exercise-list"),
    path('wrong-exercise/<int:pk>/course/workout', WrongExerciseFormDetail.as_view(), name="wrong-exercise-detail"),

    # Course 's Comment
    path('comments/course/<int:pk>', CourseCommentList.as_view(), name="course-comments"),
    path('comment/<int:pk>/course', CourseCommentDetail.as_view(), name="course-comment"),

    # Enrollment
    path('enrollment/course/<int:pk>', EnrollmentList.as_view(), name="enrollment-list"),
    path('enrollment/unenrollment/<int:pk>', UnnrollmentView.as_view(), name="unenrollment"),

    # Blog
    path('blogs', BlogList.as_view(), name="blog-list"),
    path('blog/<int:pk>', BlogDetail.as_view(), name="blog-detail"),

    # Blog's comment
    path('comments/blog/<int:pk>', BlogCommentList.as_view(), name="blog-comments"),
    path('comment/<int:pk>/blog', BlogCommentDetail.as_view(), name="blog-comment")


]


    