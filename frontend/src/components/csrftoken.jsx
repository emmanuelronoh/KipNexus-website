let _csrfToken = null;

export default async function getCsrfToken() {
  if (_csrfToken === null) {
    const response = await fetch('http://127.0.0.1:8000/csrf/', {
      credentials: 'include',
    });
    const data = await response.json();
    _csrfToken = data.csrfToken;
    console.log(_csrfToken);
  }
  return _csrfToken;
}
