import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import CryptoPrice from './Components/CryptoPrice';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';

function App() {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route exact path='/' element={<Home />} />
        <Route exact path='/login' element={<Login />} />
        <Route exact path='/register' element={<Register />} />
        <Route exact path='/cryptoprice' element={<CryptoPrice />} />
      </Routes>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          zIndex: 102,
        }}
      >
        <button className='chtbt' onClick={toggleChat}>
          Chat
        </button>
        <iframe
          src='https://www.chatbase.co/chatbot-iframe/-4N2LCezkoY-ZgfuyuM7b'
          title='Chatbot'
          width='100%'
          style={{ height: '100%', minHeight: '700px', border: '1px solid black', display: showChat ? 'block' : 'none' }}
          frameBorder='0'
        ></iframe>
      </div>
      <style>
        {`
        .chtbt {
          position: absolute;
          bottom: 0;
          right: 0;
        }

        .chtbt:hover + iframe {
          display: block;
        }

        iframe {
          display: none;
        }
        `}
      </style>
    </>
  );
}

export default App;
