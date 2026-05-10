import React from 'react'
import { loginStyles } from '../assets/dummyStyles'
import {Link} from "react-router-dom" 
import{ArrowLeft} from "lucide-react"

const Login = ({onLoginSuccess = null}) => {
  return (
    <div className={loginStyles.pageContainer}>
    <div className={loginStyles.bubble1}></div>      
    <div className={loginStyles.bubble2}></div>      

    <Link to="/" className={loginStyles.backButton}>
    <ArrowLeft className={loginStyles.backButtonIcon} />
    <span className={loginStyles.backButtonText}>Home</span>
    </Link>
    </div>
  );
};

export default Login
