import React from 'react';
import Header from './components/Header';
import Home from './pages/Home';

const App = () => {
  const appStyles = {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: 'Poppins, sans-serif',
    margin: 0,
    padding: 0,
    overflow: 'hidden'
  };

  return (
    <div style={appStyles}>
      <Header />
      <Home />
    </div>
  );
};

export default App;