import { Route, Routes } from 'react-router-dom';
import CryptoPrice from './Components/CryptoPrice';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route exact path='/' element={<Home />} />
        <Route exact path='/login' element={<Login />} />
        <Route exact path='/register' element={<Register />} />
        <Route exact path='/cryptoprice' element={<CryptoPrice />} />
      </Routes>
      <iframe
        src="https://www.chatbase.co/chatbot-iframe/-4N2LCezkoY-ZgfuyuM7b"
        title="Chatbot"
        width="100%"
        style={{height: "100%", minHeight: "700px"}}
        frameborder="0"
      ></iframe>
    </>
  );
}

export default App;
