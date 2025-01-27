class HttpError extends Error {
  constructor(statusCode, message, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }

    this.statusCode = statusCode;
    this.message = message;
  }
}

async function checkResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new HttpError(response.status, message);
  }
}

async function sendRequest(url, options) {
  try {
    const sessionId = localStorage.getItem('sessionId');

    // If we're sending FormData, don't force JSON Content-Type
    let defaultHeaders = {};
    if (!(options.body instanceof FormData)) {
      defaultHeaders = { 'Content-Type': 'application/json' };
    }

    const headers = {
      ...defaultHeaders,
      ...(sessionId && { 'X-Session-ID': sessionId }),
      ...options.headers,
    };

    const response = await fetch(url, {
      credentials: 'include',
      headers,
      ...options,
    });

    await checkResponse(response);

    if (options.method !== 'DELETE') {
      return await response.json(); // Only parse JSON if the server actually returns JSON
    }
    return response;
  } catch (err) {
    console.error('An error occurred', err);
    return err;
  }
}

export async function getCourses(
  paginate = false,
  page = 1,
  status = 'A',
  scope = 'all'
) {
  return sendRequest(
    `${
      import.meta.env.VITE_API_URL
    }courses?page=${page}&paginate=${paginate}&status=${status}&scope=${scope}`,
    {}
  );
}

export async function getCourse(id) {
  return sendRequest(`${import.meta.env.VITE_API_URL}course/${id}`, {});
}

export async function createCourse(courseFormData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}courses`, {
    method: 'POST',
    body: courseFormData,
  });
}

export async function updateCourse(id, updates) {
  return sendRequest(`${import.meta.env.VITE_API_URL}course/${id}`, {
    method: 'PATCH',
    body: updates,
  });
}

export async function deleteCourse(id) {
  return sendRequest(`${import.meta.env.VITE_API_URL}course/${id}`, {
    method: 'DELETE',
  });
}

export async function getCourseContent(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}course/${id}/course-content`,
    {}
  );
}

export async function createCourseContent(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}course/${id}/course-content`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

export async function updateCourseContent(id, updates) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}course/${id}/course-content`,
    {
      method: 'PUT',
      body: updates,
    }
  );
}

export async function getSections(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}sections/course-content/${id}`,
    {}
  );
}

export async function getSection(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}section/${id}/course-content`,
    {}
  );
}

export async function createSection(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}sections/course-content/${id}`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

export async function updateSection(id, updates) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}section/${id}/course-content`,
    {
      method: 'PATCH',
      body: updates,
    }
  );
}

export async function deleteSection(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}section/${id}/course-content`,
    {
      method: 'DELETE',
    }
  );
}

export async function getSectionItems(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}section-items/section/${id}`,
    {}
  );
}

export async function createSectionItem(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}section-items/section/${id}`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

export async function updateSectionItem(id, updates) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}section-item/${id}/section`,
    {
      method: 'PUT',
      body: updates,
    }
  );
}

export async function deleteSectionItem(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}section-item/${id}/section`,
    {
      method: 'DELETE',
    }
  );
}

export async function getWorkouts(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}workouts/section-item/${id}`,
    {}
  );
}

export async function createWorkout(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}workouts/section-item/${id}`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

export async function updateWorkout(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}workout/${id}/section-item`,
    {
      method: 'PATCH',
      body: formData,
    }
  );
}

export async function deleteWorkout(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}workout/${id}/section-item`,
    {
      method: 'DELETE',
    }
  );
}

export async function getCorrectExercises(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}correct-exercises/course/workout/${id}`,
    {}
  );
}

export async function createCorrectExerciseForm(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}correct-exercises/course/workout/${id}`,
    {
      method: 'POST',
      body: formData,
    }
  );
}
export async function updateCorrectExerciseForm(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}correct-exercise/${id}/course/workout`,
    {
      method: 'PATCH',
      body: formData,
    }
  );
}

export async function deleteCorrectExerciseForm(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}correct-exercise/${id}/course/workout`,
    {
      method: 'DELETE',
    }
  );
}

export async function getWrongExercises(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}wrong-exercises/course/workout/${id}`,
    {}
  );
}
export async function createWrongExerciseForm(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}wrong-exercises/course/workout/${id}`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

export async function updateWrongExerciseForm(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}wrong-exercise/${id}/course/workout`,
    {
      method: 'PATCH',
      body: formData,
    }
  );
}

export async function deleteWrongExerciseForm(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}wrong-exercise/${id}/course/workout`,
    {
      method: 'DELETE',
    }
  );
}

export async function getCourseEnrollees(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}enrollment/course/${id}`,
    {}
  );
}

export async function createCourseEnrollment(id) {
  // i.e., the user enrolls in a course

  return sendRequest(`${import.meta.env.VITE_API_URL}enrollment/course/${id}`, {
    method: 'POST',
  });
}

export async function deleteCourseUnenrollment(id) {
  // i.e., the user unenrolls in a course

  return sendRequest(
    `${import.meta.env.VITE_API_URL}enrollment/unenrollment/${id}`,
    {
      method: 'DELETE',
    }
  );
}

export async function getCourseComments(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}comments/course/${id}`,
    {}
  );
}

export async function getUser() {
  return sendRequest(`${import.meta.env.VITE_API_URL}user-detail`, {});
}

export async function getUserByItsId(id) {
  return sendRequest(`${import.meta.env.VITE_API_URL}user/${id}`, {});
}

export async function updateUser(formData) {
  // this only handles Profile Picture
  return sendRequest(`${import.meta.env.VITE_API_URL}user-detail`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function createCourseComment(id, formData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}comments/course/${id}`, {
    method: 'POST',
    body: formData,
  });
}

export async function updateCourseComment(id, formData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}comment/${id}/course`, {
    method: 'PUT',
    body: formData,
  });
}

export async function deleteCourseComment(id) {
  return sendRequest(`${import.meta.env.VITE_API_URL}comment/${id}/course`, {
    method: 'DELETE',
  });
}
export async function getUserCoursesProgress() {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}user/courses/progress`,
    {}
  );
}
export async function getUserCourseProgress(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}/user/course/${id}/progress`,
    {}
  );
}
export async function createUserCourseProgress(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}user/course/${id}/progress`,
    {
      method: 'POST',
    }
  );
}

export async function updateUserCourseProgress(id, formData) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}user/course/${id}/progress`,
    {
      method: 'PATCH',
    }
  );
}

export async function deleteUserCourseProgress(id) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}user/course/${id}/progress`,
    {
      method: 'DELETE',
    }
  );
}

export async function getUserSection(id) {
  return sendRequest(`${import.meta.env.VITE_API_URL}user/section/${id}`, {});
}

export async function updateUserSection(id, formData) {
  // btw, this interaction between the user and section primarily checks whether this section is completed or uncompleted.
  return sendRequest(`${import.meta.env.VITE_API_URL}user/section/${id}`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function getUserEnrolledCourses(page = 1) {
  return sendRequest(
    `${import.meta.env.VITE_API_URL}user/enrollments?page=${page}`,
    {}
  );
}

// Don't be confused about this. This is the course rating instance itself (so this returns a list with a single item only), not the course's rating.
export async function getCourseRating(id) {
  return sendRequest(`${import.meta.env.VITE_API_URL}course/${id}/rate`, {});
}
export async function createCourseRating(id, formData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}course/${id}/rate`, {
    method: 'POST',
    body: formData,
  });
}

export async function updateCourseRating(id, formData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}course/rate/${id}`, {
    method: 'PATCH',
    body: formData,
  });
}
export async function getBlogs(page = 1) {
  return sendRequest(`${import.meta.env.VITE_API_URL}blogs?page=${page}`, {});
}

export async function getBlog(id) {
  return sendRequest(`${import.meta.env.VITE_API_URL}blog/${id}`, {});
}

export async function createBlog(formData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}blogs`, {
    method: 'POST',
    body: formData,
  });
}

export async function updateBlog(id, formData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}blog/${id}`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function deleteBlog(id, formData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}blog/${id}`, {
    method: 'DELETE',
  });
}

export async function getBlogComments(id) {
  return sendRequest(`${import.meta.env.VITE_API_URL}comments/blog/${id}`, {});
}

export async function createBlogComment(id, formData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}comments/blog/${id}`, {
    method: 'POST',
    body: formData,
  });
}

export async function updateBlogComment(id, formData) {
  return sendRequest(`${import.meta.env.VITE_API_URL}comment/${id}/blog`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function deleteBlogComment(id) {
  return sendRequest(`${import.meta.env.VITE_API_URL}comment/${id}/blog`, {
    method: 'DELETE',
  });
}
