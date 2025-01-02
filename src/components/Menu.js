import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const Menu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const returnHome = () => {
    onClose();
  };

  const showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    onClose();
  };

  return (
    <>
      <div className={`menu-overlay ${isOpen ? 'menu-open' : ''}`} onClick={onClose}></div>
      <div className={`menu-panel ${isOpen ? 'menu-open' : ''}`}>
        <div className="menu-logo">
          <center><img src="./kammu.ico" alt="Kammu AI Logo" /></center>
        </div>
        <div className="navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="menu-items">
            <a href="#" className="menu-item" onClick={returnHome}>
              <i>🏠</i>
              Home
            </a>
            <a href="#" className="menu-item" onClick={() => showPage('about-ai')}>
              <i>🤖</i>
              About Kammu AI
            </a>
            <a href="#" className="menu-item" onClick={() => showPage('about-author')}>
              <i>👤</i>
              About Author
            </a>
            <a href="#" className="menu-item" onClick={() => showPage('join-us')}>
              <i>🤝</i>
              Join Us
            </a>
          </div>
          <button 
            onClick={handleSignOut}
            className="menu-item"
            style={{
              background: 'linear-gradient(135deg, #5E72EB 0%, #FF6BE9 100%)',
              color: 'white',
              marginTop: '10px',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(94, 114, 235, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <i>🚪</i>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Menu;
