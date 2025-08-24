import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // 🔒 Redirect to /students if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/students');
        }
    }, [navigate]);

    // 📥 Handle input change (controlled form)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 🔐 Handle login submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // reset error state before trying again

        try {
            const { data } = await axios.post('http://localhost:8080/auth/login', form, {
                withCredentials: true, // optional — only needed if backend sets cookies
            });


            const token = data.token;
            localStorage.setItem('token', token);

            console.log('✅ Login successful, token saved');
            navigate('/students');

        } catch (err) {
            setError('Login failed');
            console.error(err);

            // Detailed info from backend if available
            if (err.response) {
                console.error('❌ Login error:', err);
                console.log("Status:", err.response.status);
                console.log("Data:", err.response.data);
                console.log("Headers:", err.response.headers);
                setError(err.response.data || 'Invalid credentials');
            } else if (err.request) {
                console.log("No response received:", err.request);
                setError('No response from server');
            } else {
                console.log("Request setup error:", err.message);
                setError("Unexpected error occurred.");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: '0 auto' }}>
            <h2>Login</h2>

            <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                required
                style={{ display: 'block', marginBottom: 10, width: '100%' }}
            />

            <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                style={{ display: 'block', marginBottom: 10, width: '100%' }}
            />

            <button type="submit" style={{ width: '100%' }}>Login</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
}

export default Login;
