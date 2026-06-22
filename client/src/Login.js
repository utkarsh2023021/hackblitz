import React, { useState, useEffect } from 'react';
import axios from 'axios';
const bg = require('./icons/Login.png');
const backend_link = "https://hackblitz-nine.vercel.app";

// Student Login Form Component
const LoginForm = ({ onSuccess, setUser }) => {
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await axios.post(`${backend_link}/api/auth/login`, formData);
     
      if (res.data.ok) {
        setMessage({ text: 'Login Successful!', type: 'success' });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userType', "Student");
        localStorage.setItem("username", res.data.user.username);
        setUser(res.data.user.username);
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
    <form onSubmit={handleLogin}>
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

// Student Signup Form Component
const SignupForm = ({ onSuccess }) => {
  const [message, setMessage] = useState({ text: '', type: '' });
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${backend_link}/api/class/all`);
        setClasses(res.data);
        if (res.data.length > 0) {
          setSelectedClass(res.data[0]._id);
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
      class: selectedClass,
    };

    try {
      const res = await axios.post(`${backend_link}/api/auth/signup`, formData);
      if (res.data.ok) {
        setMessage({ text: 'Signup Successful!', type: 'success' });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userType', "Student");
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: 'Signup Failed!', type: 'error' });
      }
    } catch (err) {
      if (err.response?.data?.msg === 'User already exists') {
        try {
          const loginRes = await axios.post(`${backend_link}/api/auth/login`, {
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

// Teacher Login Form Component
const TeacherLoginForm = ({ onSuccess, setUser }) => {
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleTeacherLogin = async (e) => {
    e.preventDefault();

    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await axios.post(`${backend_link}/api/teachers/login`, formData);

      if (res.data.ok) {
        setMessage({ text: 'Teacher Login Successful!', type: 'success' });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userType', "Teacher");
        localStorage.setItem("username", res.data.teacher.username);
        setUser(res.data.teacher.username);
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: 'Invalid Credentials!', type: 'error' });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.msg || 'Teacher login error occurred',
        type: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleTeacherLogin}>
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

// Teacher Signup Form Component
const TeacherSignupForm = ({ onSuccess }) => {
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleTeacherSignup = async (e) => {
    e.preventDefault();

    const formData = {
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await axios.post(`${backend_link}/api/teachers/signup`, formData);
      if (res.data.ok) {
        setMessage({ text: 'Teacher Signup Successful!', type: 'success' });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userType', "Teacher");
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: 'Signup Failed!', type: 'error' });
      }
    } catch (err) {
      if (err.response?.data?.msg === 'Teacher already exists') {
        try {
          const loginRes = await axios.post(`${backend_link}/api/auth/teacher/login`, {
            email: formData.email,
            password: formData.password,
          });
          setMessage({ text: 'Teacher already exists. Logged you in!', type: 'success' });
          localStorage.setItem('token', loginRes.data.token);
          if (onSuccess) onSuccess();
        } catch (loginErr) {
          setMessage({ text: 'Teacher exists, but login failed. Check password.', type: 'error' });
        }
      } else {
        setMessage({ text: err.response?.data?.msg || 'Signup error occurred', type: 'error' });
      }
    }
  };

  return (
    <form onSubmit={handleTeacherSignup}>
      <input type="text" name="username" placeholder="Username" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Signup</button>
      {message.text && (
        <p className="message" style={{ color: message.type === 'success' ? 'green' : 'red' }}>
          {message.text}
        </p>
      )}
    </form>
  );
};

// Auth Component
// Auth Component
const Auth = ({ user, setUser, isLoggedIn, setIsLoggedIn }) => {
  const [localIsLogin, setLocalIsLogin] = useState(true);
  const [role, setRole] = useState('student'); // Tracks if they are logging in as Student or Teacher

  const handleSuccess = () => {
    setIsLoggedIn(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setUser(localStorage.getItem("username"));
    if (token) {
      setIsLoggedIn(true);
    }
  }, [setUser, setIsLoggedIn]);

  return (
    <div style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      height: "100vh",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden"
    }}>
      <div className="auth-container">
        <div className="auth-box">
          
          {/* 🟢 NEW: Role Toggle Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <button 
              onClick={() => setRole('student')}
              style={{
                width: 'auto',
                padding: '8px 20px',
                backgroundColor: role === 'student' ? '#b39040' : 'transparent',
                color: role === 'student' ? 'white' : '#ccc',
                border: role === 'student' ? 'none' : '2px solid #ccc',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Student
            </button>
            <button 
              onClick={() => setRole('teacher')}
              style={{
                width: 'auto',
                padding: '8px 20px',
                backgroundColor: role === 'teacher' ? '#b39040' : 'transparent',
                color: role === 'teacher' ? 'white' : '#ccc',
                border: role === 'teacher' ? 'none' : '2px solid #ccc',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Teacher
            </button>
          </div>

          <h2 style={{ padding: "20px 0", fontSize: "32px" }}>
            {role === 'teacher' ? 'Teacher' : 'Student'} {localIsLogin ? 'Login' : 'Signup'}
          </h2>

          {/* 🟢 Render the correct form based on the selected role */}
          {role === 'student' ? (
            localIsLogin ? <LoginForm onSuccess={handleSuccess} setUser={setUser} /> : <SignupForm onSuccess={handleSuccess} />
          ) : (
            localIsLogin ? <TeacherLoginForm onSuccess={handleSuccess} setUser={setUser} /> : <TeacherSignupForm onSuccess={handleSuccess} />
          )}

          <p style={{ marginTop: '20px' }}>
            {localIsLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <span
              onClick={() => setLocalIsLogin(!localIsLogin)}
              className="toggle-btn"
              style={{ cursor: 'pointer', color: '#b39040', fontWeight: 'bold' }}
            >
              {localIsLogin ? 'Signup' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;