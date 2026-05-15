import React from 'react'
import {Route, Routes, useLocation,Navigate} from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import MyResultpage from './pages/MyResultPage';

function RequireAuth({ children}) {
  const isLoggedIn = Boolean(localStorage.getItem("authToken"));
  const location = useLocation();

  if (!isLoggedIn) {
    return (<Navigate to="/login" state={{ from: location }} replace /> );
  }
  return children;
}

const App = () => {
  return (

   <Routes>
     <Route path="/" element={<Home />} />
     <Route path='/login' element={<Login/>} />
     <Route path='/signup' element={<Signup/>} /> 

     <Route 
       path="/result"
       element={
        <RequireAuth>
          <MyResultpage />
        </RequireAuth>
       }
      />
   </Routes>
  );
};

export default App;
