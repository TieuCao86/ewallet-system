import React from 'react'
import {
  Users,
  Wallet,
  ArrowsClockwise,
  ShieldCheck,
  ListBullets,
  Warning,
  Gear
} from '@phosphor-icons/react'

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  setSearchTerm,
  setTxTypeFilter,
  setTxStatusFilter,
  kycRequests,
  transactions
}) {
  const pendingKycCount = kycRequests.filter(k => k.status === 'PENDING').length
  const suspiciousTxCount = transactions.filter(t => t.suspicious).length

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <img src="/VTPayLogo-Transparent.png" alt="Logo" />
        <span className="admin-brand-name">VT Pay Admin</span>
      </div>

      <nav className="admin-sidebar-menu">
        <button
          className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => { setActiveTab('overview'); setSearchTerm(''); }}
        >
          <ListBullets size={20} weight="bold" />
          Tổng quan
        </button>

        <button
          className={`admin-menu-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
        >
          <Users size={20} weight="bold" />
          Quản lý người dùng
        </button>

        <button
          className={`admin-menu-item ${activeTab === 'kyc' ? 'active' : ''}`}
          onClick={() => { setActiveTab('kyc'); setSearchTerm(''); }}
        >
          <ShieldCheck size={20} weight="bold" />
          Duyệt KYC
          {pendingKycCount > 0 && (
            <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#ffffff', borderRadius: '50%', width: '20px', height: '20px', display: 'grid', placeItems: 'center', fontSize: '0.75rem' }}>
              {pendingKycCount}
            </span>
          )}
        </button>

        <button
          className={`admin-menu-item ${activeTab === 'wallets' ? 'active' : ''}`}
          onClick={() => { setActiveTab('wallets'); setSearchTerm(''); }}
        >
          <Wallet size={20} weight="bold" />
          Quản lý Ví
        </button>

        <button
          className={`admin-menu-item ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('transactions')
            setSearchTerm('')
            setTxTypeFilter('ALL')
            setTxStatusFilter('ALL')
          }}
        >
          <ArrowsClockwise size={20} weight="bold" />
          Quản lý giao dịch
          {suspiciousTxCount > 0 && (
            <span style={{ marginLeft: 'auto', background: '#f59e0b', color: '#ffffff', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
              {suspiciousTxCount} nghi vấn
            </span>
          )}
        </button>

        <button
          className={`admin-menu-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => { setActiveTab('logs'); setSearchTerm(''); }}
        >
          <Warning size={20} weight="bold" />
          Audit Logs
        </button>

        <button
          className={`admin-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('settings'); setSearchTerm(''); }}
        >
          <Gear size={20} weight="bold" />
          Cài đặt
        </button>
      </nav>

      <div className="admin-sidebar-footer">
        <span>Phiên bản v1.0.0 (Build 1606)</span>
      </div>
    </aside>
  )
}
