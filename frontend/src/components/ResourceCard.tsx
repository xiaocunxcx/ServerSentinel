import { Card, Tag, Tooltip } from 'antd'
import { CloudServerOutlined } from '@ant-design/icons'
import { Node, Reservation, CurrentUser } from '../api/types'
import './ResourceCard.css'

interface ResourceCardProps {
  node: Node
  reservations?: Reservation[]
  currentUser?: CurrentUser | null
  onClick?: () => void
}

const ResourceCard: React.FC<ResourceCardProps> = ({ node, reservations = [], currentUser, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success'
      case 'offline':
        return 'error'
      case 'maintenance':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '在线'
      case 'offline':
        return '离线'
      case 'maintenance':
        return '维护中'
      default:
        return status
    }
  }

  const getDeviceStatus = (deviceId: number): 'idle' | 'busy' | 'mine' | 'offline' => {
    if (node.status !== 'online') {
      return 'offline'
    }

    const nodeReservations = reservations.filter(r => r.node_id === node.id)
    const machineReservations = nodeReservations.filter(r => r.type === 'machine')

    if (machineReservations.length > 0) {
      const reservation = machineReservations[0]
      const isMine = currentUser && reservation.user_id === currentUser.id
      return isMine ? 'mine' : 'busy'
    }

    const deviceReservations = nodeReservations.filter(r =>
      r.type === 'device' &&
      r.reserved_devices?.some(d => d.id === deviceId)
    )

    if (deviceReservations.length > 0) {
      const reservation = deviceReservations[0]
      const isMine = currentUser && reservation.user_id === currentUser.id
      return isMine ? 'mine' : 'busy'
    }

    return 'idle'
  }

  const getDeviceStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      idle: 'device-idle',
      busy: 'device-busy',
      mine: 'device-mine',
      offline: 'device-offline',
    }
    return statusMap[status] || 'device-idle'
  }

  const getDeviceTooltip = (device: any, status: string) => {
    if (status === 'offline') return `Device ${device.device_index} - ${device.model_name} (离线)`
    if (status === 'idle') return `Device ${device.device_index} - ${device.model_name} (空闲)`

    const nodeReservations = reservations.filter(r => r.node_id === node.id)
    const machineReservations = nodeReservations.filter(r => r.type === 'machine')

    if (machineReservations.length > 0) {
      const reservation = machineReservations[0]
      const isMine = currentUser && reservation.user_id === currentUser.id
      const ownership = isMine ? '我的' : '已占用'
      return `Device ${device.device_index} - ${device.model_name} (${ownership} - 整机预约)`
    }

    const deviceReservations = nodeReservations.filter(r =>
      r.type === 'device' &&
      r.reserved_devices?.some(d => d.id === device.id)
    )

    if (deviceReservations.length > 0) {
      const reservation = deviceReservations[0]
      const isMine = currentUser && reservation.user_id === currentUser.id
      const ownership = isMine ? '我的' : '已占用'
      return `Device ${device.device_index} - ${device.model_name} (${ownership})`
    }

    return `Device ${device.device_index} - ${device.model_name}`
  }

  const idleDevices = node.devices?.filter(device => getDeviceStatus(device.id) === 'idle').length || 0

  return (
    <Card
      className={`resource-card resource-card-${node.status}`}
      hoverable
      onClick={onClick}
    >
      <div className="resource-card-header">
        <div className="resource-card-title">
          <CloudServerOutlined className="resource-card-icon" />
          <span>{node.name}</span>
        </div>
        <Tag color={getStatusColor(node.status)}>
          {getStatusText(node.status)}
        </Tag>
      </div>

      <div className="resource-card-info">
        <div className="resource-card-info-item">
          <span className="label">IP 地址:</span>
          <span className="value">{node.ip_address}</span>
        </div>
        <div className="resource-card-info-item">
          <span className="label">设备数:</span>
          <span className="value">{node.devices?.length || 0}</span>
        </div>
        <div className="resource-card-info-item">
          <span className="label">空闲设备:</span>
          <span className="value success">{idleDevices}</span>
        </div>
      </div>

      <div className="device-grid">
        {node.devices?.map((device) => {
          const deviceStatus = getDeviceStatus(device.id)
          const statusClass = getDeviceStatusClass(deviceStatus)

          return (
            <Tooltip
              key={device.id}
              title={getDeviceTooltip(device, deviceStatus)}
            >
              <div className={`device-cell ${statusClass}`}>
                {device.device_index}
              </div>
            </Tooltip>
          )
        })}
      </div>
    </Card>
  )
}

export default ResourceCard
