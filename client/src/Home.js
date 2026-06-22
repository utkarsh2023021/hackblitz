import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import SelfEvaluation from "./components/SelfEvaluation";
import "./Home.css";
import BookDonationPage from "./components/BookDonation";
import DiscussionSection from "./components/Discussion";
import TestComponent from "./components/TestComponent";
import TestCreator from "./components/TestCreator";
import AboutUs from "./components/AboutUs";
import { jwtDecode } from 'jwt-decode';
import HeroSection from "./components/HeroSection";
import Evaluate from "./components/Examevaluate";

const backend_link = "https://hackblitz-nine.vercel.app";

function Home1({ user, setUser, isLoggedIn, setIsLoggedIn, token, setToken }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const savedScreen = localStorage.getItem("activeScreen");
  const [activeScreen, setActiveScreen] = useState(savedScreen ? parseInt(savedScreen) : 1);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const body = document.body;
  const announcementRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (announcementRef.current && !announcementRef.current.contains(event.target)) {
        const bellIcon = document.querySelector('.announcement-bell');
        if (bellIcon && !bellIcon.contains(event.target)) {
          setShowAnnouncements(false);
        }
      }
    };

    if (showAnnouncements) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAnnouncements]);
  
  let classId = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      classId = decodedToken.class;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!classId) return; 
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${backend_link}/api/class/announcements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId }),
        });
        if (!response.ok) throw new Error("Failed to fetch announcements");
        const data = await response.json();
        const updatedData = data.map((note) => ({
          ...note,
          expanded: false,
        }));
        setAnnouncements(updatedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [classId]);

  useEffect(() => {
    localStorage.setItem("activeScreen", activeScreen);
    activeScreen === 3 ? openChat() : closeChat();
  }, [activeScreen]);

  function openChat() {
    body.classList.add("blurred");
  }

  function closeChat() {
    body.classList.remove("blurred");
  }

  const toggleExpansion = (index) => {
    setAnnouncements((prev) =>
      prev.map((n, i) =>
        i === index ? { ...n, expanded: !n.expanded } : n
      )
    );
  };

  const dismissAnnouncement = (index) => {
    setAnnouncements((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleAnnouncementPanel = () => {
    setShowAnnouncements(!showAnnouncements);
  };

  // 🟢 Helper function to cleanly render exactly one screen
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 1:
        return (
          <HeroSection 
            setActiveScreen={setActiveScreen}
            user={user}
            setUser={setUser}
            token={token}
            setToken={setToken}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            announcementCount={announcements.length}
            toggleAnnouncementPanel={toggleAnnouncementPanel}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        );
      case 2: return <DiscussionSection />;
      case 3: return <TestComponent />;
      case 4: return <AboutUs />;
      case 5: return <BookDonationPage />;
      case 7: return <SelfEvaluation />;
      case 9: return <Evaluate />;
      default: return <p>Invalid Screen</p>;
    }
  };

return (
    <div className="app">
      <Navbar
        setActiveScreen={setActiveScreen}
        user={user}
        setUser={setUser}
        token={token}
        setToken={setToken}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        announcementCount={announcements.length}
        toggleAnnouncementPanel={toggleAnnouncementPanel}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      {showAnnouncements && (
        <div className="announcement-section" ref={announcementRef}>
          {/* ... announcement UI stays exactly the same ... */}
        </div>
      )}
      
      {/* 🟢 Removed the <main> wrapper here! Just render the screen directly */}
      {renderActiveScreen()}

    </div>
  );
}

export default Home1;
