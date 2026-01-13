import { Card, Tag, Tooltip } from 'antd'
// import { ServerOutlined } from '@ant-design/icons'
import { Node } from '../api/types'
import './ResourceCard.css'

interface ResourceCardProps {
  node: Node
  onClick?: () => void
}

const ResourceCard: React.FC<ResourceCardProps> = ({ node, onClick }) => {
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

  const idleDeviceCount = node.devices?.length || 0

  return (
    <Card
      className={`resource-card resource-card-${node.status}`}
      hoverable
      onClick={onClick}
    >
      <div className="resource-card-header">
        <div className="resource-card-title">
          {/* <ServerOutlined className="resource-card-icon" /> */}
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
          <span className="value success">{idleDeviceCount}</span>
        </div>
      </div>

      <div className="device-grid">
        {node.devices?.map((device) => (
          <Tooltip
            key={device.id}
            title={`Device ${device.device_index} - ${device.model_name}`}
          >
            <div className="device-cell device-idle">
              {device.device_index}
            </div>
          </Tooltip>
        ))}
      </div>
    </Card>
  )
}

export default ResourceCard
