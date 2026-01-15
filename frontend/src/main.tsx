import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './styles/global.css'

const { defaultAlgorithm } = theme

const customTheme = {
  algorithm: defaultAlgorithm,
  token: {
    colorPrimary: '#0c8c7d',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    colorBgBase: '#fafbfc',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f7fa',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#e2e8f0',
    colorText: '#1a202c',
    colorTextSecondary: '#718096',
    colorTextTertiary: '#a0aec0',
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 6,
    controlBorderRadius: 8,
    controlHeight: 40,
    controlHeightLG: 44,
    controlHeightSM: 32,
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    boxShadowCard: '0 4px 12px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 2px 4px rgba(0, 0, 0, 0.04)',
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      paddingInline: 20,
      fontWeight: 600,
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
      paddingBlock: 10,
    },
    Select: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 20,
      boxShadowCard: '0 4px 12px rgba(0, 0, 0, 0.06)',
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Table: {
      borderRadiusLG: 12,
      headerBg: '#fafbfc',
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Menu: {
      borderRadiusLG: 12,
      itemBorderRadius: 8,
      itemHeight: 44,
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={customTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
