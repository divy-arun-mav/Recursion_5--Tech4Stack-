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
    </>
  );
}

export default App;
