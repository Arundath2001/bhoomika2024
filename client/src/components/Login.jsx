import React, { useState } from "react";
import './Login.css';
import adminlogo from "../assets/adminlogo.png";
import InputNormal from "./InputNormal";
import ButtonNormal from "./ButtonNormal";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import AlertMessage from "./AlertMessage";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://93.127.167.205:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userName', data.user.username);
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('isAuthenticated', true);
                navigate('/dashboard');
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error("Login error: ", error);
            setErrorMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <LoadingScreen isVisible={loading} text="Logging in..." />
            <AlertMessage 
                isVisible={!!errorMessage} 
                message={errorMessage} 
                onClose={() => setErrorMessage('')} 
                isError={true} 
            />
            <div className="login_data">
                <img src={adminlogo} alt="login logo" />

                <div className="login_card">
                    <p className="login_head">Admin <span>Login</span></p>

                    <div className="login_fields">
                        <InputNormal type="text" value={username} onChange={(e) => setUsername(e.target.value)} label="Username" required />
                        <InputNormal type="password" value={password} onChange={(e) => setPassword(e.target.value)} label="Password" required />
                    </div>

                    <ButtonNormal onClick={handleLogin} text="Sign In" btn_color="btn_black" />
                </div>
            </div>
        </div>
    );
}

export default Login;
