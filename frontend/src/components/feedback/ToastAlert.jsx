import { CheckCircle, Warning } from '@phosphor-icons/react'
import '../../pages/Dashboard.css' // Import style dependencies

function ToastAlert({ show, message, type = 'success' }) {
  if (!show) return null

  const borderLeftColor = type === 'warning' ? '4px solid #eab308' : '4px solid #22c55e'

  return (
    <div className="toast-alert" style={{ borderLeft: borderLeftColor }}>
      {type === 'warning' ? (
        <Warning size={20} color="#eab308" weight="fill" />
      ) : (
        <CheckCircle size={20} color="#22c55e" weight="fill" />
      )}
      <span>{message}</span>
    </div>
  )
}

export default ToastAlert
