import React from 'react';
import { Link } from 'react-router-dom';
import Error from '../assets/images/404.gif'

const NotFound = () => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const redirectPath = isAuthenticated ? '/dashboard' : '/';

  return (
      <div className='common-body-st'>
    <div style={styles.container}>
      <img className="roboatimg" src={Error} alt="robot" />
      <p style={styles.message}>Oops! The page you're looking for doesn't exist.</p>
      <Link to={redirectPath} style={styles.link}>
        {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
      </Link>
    </div>
     </div>
  );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
        background: '#ffffff',
        padding: '0 1rem',
      },
      
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '16px',
    marginBottom: '2rem',
  },
  link: {
    padding: '0.5rem 1.5rem',
    background: 'linear-gradient(3deg, #0B622F, #18934B)', 
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '500',
  },
};

export default NotFound;
