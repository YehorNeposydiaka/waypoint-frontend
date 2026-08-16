import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TripListPage from './pages/TripListPage'

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
        return <Navigate to="/login" replace />
    }
    return children
}

function App() {
    const isLoggedIn = !!localStorage.getItem('accessToken')

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/trips"
                    element={isLoggedIn ? <TripListPage /> : <Navigate to="/login" />}
                />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App