import React from 'react'
import { Users, ShieldCheck, Wallet, Warning } from '@phosphor-icons/react'

export default function OverviewPanel({
  users,
  kycRequests,
  wallets,
  transactions,
  auditLogs,
  setSelectedTx
}) {
  const pendingKycCount = kycRequests.filter(k => k.status === 'PENDING').length
  const frozenWalletsCount = wallets.filter(w => w.status === 'FROZEN').length
  const suspiciousTxCount = transactions.filter(t => t.suspicious).length

  return (
    <div>
      {/* Metrics Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-info">
            <span className="admin-metric-label">Tổng khách hàng</span>
            <span className="admin-metric-value">{users.length}</span>
          </div>
          <div className="admin-metric-icon bg-blue-light">
            <Users size={24} weight="bold" />
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-info">
            <span className="admin-metric-label">Yêu cầu KYC chờ duyệt</span>
            <span className="admin-metric-value">{pendingKycCount}</span>
          </div>
          <div className="admin-metric-icon bg-amber-light">
            <ShieldCheck size={24} weight="bold" />
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-info">
            <span className="admin-metric-label">Ví bị đóng băng</span>
            <span className="admin-metric-value">{frozenWalletsCount}</span>
          </div>
          <div className="admin-metric-icon bg-red-light">
            <Wallet size={24} weight="bold" />
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-info">
            <span className="admin-metric-label">Giao dịch nghi vấn</span>
            <span className="admin-metric-value">{suspiciousTxCount}</span>
          </div>
          <div className="admin-metric-icon bg-amber-light" style={{ color: '#d97706', background: 'rgba(217, 119, 6, 0.1)' }}>
            <Warning size={24} weight="bold" />
          </div>
        </div>
      </div>

      {/* Subcontent block: Recent logs and Suspicious transactions side-by-side */}
      <div className="overview-grid-columns">
        {/* Suspicious Tx Card list */}
        <div className="overview-box">
          <h3 style={{ margin: '0 0 20px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Warning size={20} color="#f59e0b" weight="fill" /> Giao dịch đáng ngờ gần đây
          </h3>
          {transactions.filter(t => t.suspicious).length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Không có giao dịch nghi vấn nào cần theo dõi.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.filter(t => t.suspicious).map(t => (
                <div key={t.transactionId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid var(--line)', borderRadius: '12px', background: 'var(--bg)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{t.transactionId}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>{t.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>{t.amount.toLocaleString()}đ</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'capitalize' }}>{t.type}</div>
                  </div>
                  <div>
                    <button className="table-action-btn view" onClick={() => setSelectedTx(t)}>Chi tiết</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Audit Log Card list */}
        <div className="overview-box">
          <h3 style={{ margin: '0 0 20px', fontFamily: 'var(--font-display)' }}>Nhật ký hoạt động mới nhất</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.logId} style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <div style={{ color: 'var(--ink)', fontWeight: 600 }}>{log.action}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                  <span>Tác nhân: {log.actor.split(' ')[0]}</span>
                  <span>{log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
