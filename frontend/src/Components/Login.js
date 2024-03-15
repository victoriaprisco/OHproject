import { auth } from "../firebase";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios"
axios.defaults.withCredentials = true


const Login = () => {
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCheckingAuth(false);
            if (user) {
                navigate('/dashboard');
            }
        });
        return unsubscribe;
    }, [navigate]);

    const performLogin = (e) => {
        e.preventDefault();
        if (!e.target.email.value) {
            alert("Please enter an email!");
            return;
        }
        if (!e.target.current_password.value) {
            alert("Please enter a password!");
            return;
        }
        const email = e.target.email.value;
        const pass = e.target.current_password.value;
        axios.post("http://localhost:5050/api/login", {
            email: email,
            password: pass,
        }, {
            withCredentials: true
        })
        // .then(r => console.log(r)).catch(e => console.log(e))
        .then((res) => {
            if(res.data.error ===  "\"incorrect password\"") {
                alert("incorrect password")
            }
            else {
                axios.get("http://localhost:5050/api/profile", {
                    withCredentials: true,
                    headers: {
                        Authorization: "Bearer " + res.data.token
                    }
                }).then(profileRes => console.log(profileRes)).catch(e => console.log(e))
            }
        }).catch(e => console.log(e))
    };

    const handleForgotPassword = () => {
        navigate("/forgotPassword")
    };

    if (checkingAuth) {
        return <div>Loading...</div>;
    }

    return (
        <div className="font-mono">
            <header className="bg-indigo-300 p-0 py-5">
                <div className="container flex justify-center items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2" />
                            <h1 className="text-3xl font-bold text-black font-mono">ONLINE OFFICE HOURS</h1>
                        </div>
                    </Link>
                </div>
            </header>
            <div className="flex justify-center mt-6 p-10 pb-4">
                <form onSubmit={performLogin} className="shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg bg-indigo-200">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="text"
                            name="email"
                            placeholder="Email"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="current_password"
                            type="password"
                            name="current_password"
                            placeholder="Password"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <input
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            value="Login"
                        />
                        <input
                            className="inline-block align-baseline font-bold text-sm text-indigo-500 hover:text-indigo-800"
                            type="button"
                            value="Forgot Password?"
                            onClick={handleForgotPassword}
                        />
                    </div>
                </form>
            </div>
            <div className="flex justify-center">
            Don't have an account? <Link to="/signup" className="font-semibold text-indigo-500 hover:underline ml-2 mr-2">Sign up</Link> to get started!
            </div>
           
        </div>
    );
};

export default Login;
