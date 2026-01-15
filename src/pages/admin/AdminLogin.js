import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                const { error, data } = await signUp(email, password);
                if (error) throw error;
                if (data.user && !data.session) {
                    setError('Please check your email to confirm your account.');
                    setLoading(false);
                    return; // Don't navigate if email confirmation is required
                }
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
            }
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-box">
                <h2>{isSignUp ? 'Admin Sign Up' : 'Admin Login'}</h2>
                <p>Shanga Beauty Store</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@shanga.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>

                    <div className="auth-switch">
                        <p>
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            <span onClick={() => setIsSignUp(!isSignUp)} className="toggle-link">
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
