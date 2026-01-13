import { Navigate } from 'react-router-dom'
import { authStore } from '../api/client'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = authStore.isAuthenticated()

  if (!isAuthenticated) {
    // 未登录，重定向到登录页
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
