import React from 'react'
import { SignOut } from '@phosphor-icons/react'

export default function AdminHeader({ activeTab, isLive, handleLogout }) {
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Thống kê tổng quan'
      case 'users':
        return 'Quản lý thông tin khách hàng'
      case 'kyc':
        return 'Phê duyệt xác thực KYC'
      case 'wallets':
        return 'Quản lý Ví tài khoản'
      case 'transactions':
        return 'Giám sát giao dịch hệ thống'
      case 'logs':
        return 'Nhật ký kiểm toán (Audit Logs)'
      case 'settings':
        return 'Cài đặt tài khoản QTV'
      default:
        return 'Trang Quản trị'
    }
  }

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        <h1>{getHeaderTitle()}</h1>
      </div>

      <div className="admin-header-right">
        <span className={`admin-mode-badge ${isLive ? 'live' : 'mock'}`}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
          {isLive ? 'Live API Connected' : 'Demo Simulator'}
        </span>

        <div className="admin-profile-pill">
          <div className="admin-avatar">A</div>
          <span className="admin-username">Quản trị viên</span>
        </div>

        <button className="admin-logout-btn" onClick={handleLogout} title="Đăng xuất">
          <SignOut size={22} weight="bold" />
        </button>
      </div>
    </header>
  )
}
