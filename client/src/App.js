import './App.css';
import Auth from './Login';
import { useState, useEffect } from 'react';
import Home from "./Home";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(localStorage.getItem('username') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start as true to prevent UI flash
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    const fetchUserData = async () => {
      const userType = localStorage.getItem('userType');
      if (token && userType === 'Student') {
        try {
          const decoded = jwtDecode(token);
          const response = await axios.get(`https://hackblitz-nine.vercel.app/api/auth/profile/${decoded.id}`);
          setUser(response.data.username);
          localStorage.setItem('username', response.data.username);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Optional: Handle invalid token cleanup here
        }
      } else if (token && userType === 'Teacher') {
        setIsLoggedIn(true);
      }
      setIsLoading(false); // Ensure loading stops regardless of the outcome
    };

    fetchUserData();
  }, [token]);

  if (isLoading) {
    return <div>Loading...</div>; // Render a fallback while checking auth state
  }

  return (
    <div className="App">
      {isLoggedIn ? (
        <Home
          user={user}
          setUser={setUser}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          token={token}
          setToken={setToken}
        />
      ) : (
        <Auth
          user={user}
          setUser={setUser}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
         
        />
      )}
    </div>
  );
}

export default App;