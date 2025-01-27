import { useContext, useEffect, useState } from 'react';
import {
  AccessTokenDecodedContext,
  useAuthToken,
  useDecodedAccessToken,
} from '../contexts/authContext';
import isFirefox from '../helper/isFirefox';

//ACCESS/REFRESH LOGIC here
export default function useRefreshToken() {
  if (!isFirefox()) {
    return;
  }
  const { token, dispatch } = useAuthToken();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  // const accessTokenExp = useContext(AccessTokenDecodedContext);
  const { accessTokenDecoded } = useDecodedAccessToken();
  const refreshBuffer = 30;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000); // update every second
    return () => clearInterval(interval); // cleanup on unmount
  }, []);
  // refreshing the access token when it expires, use refresh token
  // persist user authentication == true
  useEffect(() => {
    const hasToken = token['access'] !== null;
    // console.log(hasToken);
    (async () => {
      if (hasToken) {
        // console.log(`current time: ${currentTime}`);
        // console.log(`expiration: ${accessTokenExp.exp}`);
        if (currentTime > accessTokenDecoded?.exp - refreshBuffer) {
          // Refresh 30 seconds before token expires
          // console.log("expires!");
          const accessToken = await refreshAccessToken(token['refresh']);
          // console.log(`this is the ACCESS TOKEN RETURNED ${accessToken}`);
          dispatch({
            type: 'setToken',
            access: accessToken,
            refresh: token['refresh'],
          });
          // console.log('set isAuthentocated to true')
        }
      }
    })(); // calls the nameless async fn
  }, [currentTime]);
}

async function refreshAccessToken(refreshToken) {
  //   refreshing access token when it's due.

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}token/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(response.status);
    }

    const data = await response.json();

    return data['access'];
  } catch (error) {
    console.error(`error code: ${error}`);
    return false;
  }
}
