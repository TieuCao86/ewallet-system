import { createBrowserRouter } from 'react-router-dom'
import Landing from '../pages/Landing.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import ForgotPassword from '../pages/ForgotPassword.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Admin from '../pages/Admin.jsx'
import AdminLogin from '../pages/AdminLogin.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/admin',
    element: <Admin />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
])

