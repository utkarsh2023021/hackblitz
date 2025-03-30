import React, { useState ,useEffect} from 'react';
import axios from 'axios';
import Home from './Home';
const bg=require('./icons/Login.png');

// Login Form Component
const LoginForm = ({ onSuccess, setUser }) => {
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await axios.post('/api/auth/login', formData);
      console.log("Login Data:", res.data);

      if (res.data.ok) {
        setMessage({ text: 'Login Successful!', type: 'success' });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem("username", res.data.user.username);
        
        setUser(res.data.user.username);
       // onSuccess(token); 
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: 'Invalid Credentials!', type: 'error' });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.msg || 'Login error occurred',
        type: 'error',
      });
    }
  };

  return (

    <form 
    onSubmit={handleLogin} 
   
  >
    <input type="email" name="email" placeholder="Email" required />
    <input type="password" name="password" placeholder="Password" required />
    <button type="submit">Login</button>
    {message.text && (
      <p style={{ color: message.type === 'success' ? 'green' : 'red' }}>
        {message.text}
      </p>
    )}
  </form>
  

    
    
  );
};

// Signup Form Component
const SignupForm = ({ onSuccess }) => {
  const [message, setMessage] = useState({ text: '', type: '' });
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('/api/class/all');
        setClasses(res.data);
        if (res.data.length > 0) {
          setSelectedClass(res.data[0]._id); // set default selected class
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };

    fetchClasses();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    const formData = {
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value,
      class: selectedClass, // Use selected class from dropdown
    };

    try {
      const res = await axios.post('/api/auth/signup', formData);
      if (res.data.ok) {
        setMessage({ text: 'Signup Successful!', type: 'success' });
        localStorage.setItem('token', res.data.token);
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: 'Signup Failed!', type: 'error' });
      }
    } catch (err) {
      // If the user already exists, attempt auto-login
      if (err.response?.data?.msg === 'User already exists') {
        try {
          const loginRes = await axios.post('/api/auth/login', {
            email: formData.email,
            password: formData.password,
          });
          setMessage({ text: 'User already exists. Logged you in!', type: 'success' });
          localStorage.setItem('token', loginRes.data.token);
          if (onSuccess) onSuccess();
        } catch (loginErr) {
          setMessage({ text: 'User exists, but login failed. Check password.', type: 'error' });
        }
      } else {
        setMessage({ text: err.response?.data?.msg || 'Signup error occurred', type: 'error' });
      }
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input type="text" name="username" placeholder="Username" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      
      {/* Dropdown for selecting a class */}
      <select
        name="class"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        required
      >
        {classes.map((cls) => (
          <option key={cls._id} value={cls._id}>
            {cls.name}
          </option>
        ))}
      </select>
      
      <button type="submit">Signup</button>
      {message.text && (
        <p className="message" style={{ color: message.type === 'success' ? 'green' : 'red' }}>
          {message.text}
        </p>
      )}
    </form>
  );
};

// Main Authentication Component
const Auth = ({user,setUser,isLoggedIn,setIsLoggedIn}) => {
  // Toggle between login and signup forms
  const [isLogin, setIsLogin] = useState(true);
  // Track if the user is logged in
 

  // When login/signup is successful, set isLoggedIn to true
  const handleSuccess = () => {
    setIsLoggedIn(true);

  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    setUser(localStorage.getItem("username"));
    if (token) {
      setIsLoggedIn(true);
    }
  }, []); // ✅ Dependency array inside useEffect
  

  // If logged in, show the Home component
  if (isLoggedIn) {
    return <Home user={user} isLoggedIn={isLoggedIn} setUser={setUser} token={localStorage.getItem('token')}/>;
  }

  // Otherwise, show the authentication forms
  return (    <div style={{
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover", // Ensures full coverage while maintaining aspect ratio
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden" // Ensures no unwanted scrollbars
  }}>
    { !isLoggedIn && <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Login' : 'Signup'}</h2>
        {isLogin ? (
          <LoginForm onSuccess={handleSuccess} setUser={setUser} />
        ) : (
          <SignupForm onSuccess={handleSuccess} />
        )}
        <p>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-btn"
            style={{ cursor: 'pointer', color: '#b39040' }}
          >
            {isLogin ? 'Signup' : 'Login'}
          </span>
        </p>
      </div>
     
    </div> }
    </div>
  );
};

export default Auth;
