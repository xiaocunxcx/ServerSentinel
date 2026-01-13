import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Reservations from '../pages/Reservations'
import Keys from '../pages/Keys'
import Nodes from '../pages/Nodes'
import NodeDetail from '../pages/NodeDetail'
import AdminAssets from '../pages/AdminAssets'

function AppRouter() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<Login />} />

      {/* 受保护的路由 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* 默认重定向到仪表板 */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* 仪表板 */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* 预约管理 */}
        <Route path="reservations" element={<Reservations />} />
        
        {/* SSH 密钥管理 */}
        <Route path="keys" element={<Keys />} />
        
        {/* 节点管理 */}
        <Route path="nodes" element={<Nodes />} />
        <Route path="nodes/:id" element={<NodeDetail />} />
        
        {/* 管理员功能 */}
        <Route path="admin/assets" element={<AdminAssets />} />
      </Route>

      {/* 404 重定向 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
