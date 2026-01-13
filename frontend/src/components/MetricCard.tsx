import { Card } from 'antd'
import './MetricCard.css'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  color?: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#1890ff',
}) => {
  return (
    <Card className="metric-card" bordered={false}>
      <div className="metric-card-content">
        <div className="metric-card-header">
          {icon && (
            <div className="metric-card-icon" style={{ color }}>
              {icon}
            </div>
          )}
          <div className="metric-card-title">{title}</div>
        </div>
        <div className="metric-card-value" style={{ color }}>
          {value}
        </div>
        {subtitle && <div className="metric-card-subtitle">{subtitle}</div>}
      </div>
    </Card>
  )
}

export default MetricCard
