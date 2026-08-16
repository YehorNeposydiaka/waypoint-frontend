import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const response = await api.post('/api/auth/login', { email, password })
            localStorage.setItem('accessToken', response.data.accessToken)
            localStorage.setItem('refreshToken', response.data.refreshToken)
            navigate('/trips')
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка входу')
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>WayPoint</h2>
                <p style={styles.subtitle}>Увійдіть у свій акаунт</p>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleLogin}>
                    <input
                        style={styles.input}
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button style={styles.button} type="submit">
                        Увійти
                    </button>
                </form>

                <p style={styles.link}>
                    Немає акаунту? <Link to="/register">Зареєструватись</Link>
                </p>
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        width: '360px',
    },
    title: {
        textAlign: 'center',
        marginBottom: '8px',
        fontSize: '28px',
        color: '#333',
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        marginBottom: '24px',
    },
    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '8px',
    },
    error: {
        color: 'red',
        marginBottom: '12px',
        fontSize: '14px',
    },
    link: {
        textAlign: 'center',
        marginTop: '16px',
        fontSize: '14px',
        color: '#666',
    },
}

export default LoginPage