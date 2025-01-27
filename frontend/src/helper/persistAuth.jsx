import { useContext, useEffect } from 'react';
import validateAuthStatus from './verifyAuth';
import { useAuthToken } from '../contexts/authContext';
import { SetIsLoadingContext } from '../contexts/IsLoadingContext';
import isFirefox from './isFirefox';

// handle jwt in state  when user refreshes page.
// for PRESERVATION OF STATE (because state doesn't survive a refresh of page)
// token is initialized to null when page loads, so this will run or mounts after a refresh.
export default function persistAuth() {
  const setIsLoading = useContext(SetIsLoadingContext);

  const { dispatch } = useAuthToken();
  useEffect(() => {
    (async () => {
      const response = await validateAuthStatus(); // returns both access and refresh token
      setIsLoading(false);

      if (!isFirefox()) {
        // Hnadle JWT auth for Firefox
        if (response?.access && response?.refresh) {
          dispatch({
            type: 'setToken',
            access: response['access'],
            refresh: response['refresh'],
          });
        } else {
          // Handle Session auth for Chrome/Safari or browsers that are very on cookies
          if (response?.sessionId && response?.isAuthenticated) {
            dispatch({
              type: 'setSession',
              isAuthenticated: true,
              sessionId: response.sessionId,
            });
          }
        }
      }
    })(); // calls the nameless async fn
  }, []);
}
