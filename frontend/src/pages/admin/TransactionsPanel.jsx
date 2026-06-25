import React from 'react'
import { MagnifyingGlass, Warning, Flag, Eye } from '@phosphor-icons/react'

export default function TransactionsPanel({
  transactions,
  searchTerm,
  setSearchTerm,
  txTypeFilter,
  setTxTypeFilter,
  txStatusFilter,
  setTxStatusFilter,
  requestPinAuthorization,
  setSelectedTx
}) {
  const filteredTx = transactions.filter(t => {
    const matchesSearch = t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = txTypeFilter === 'ALL' || t.type === txTypeFilter
    const matchesStatus = txStatusFilter === 'ALL' || 
      (txStatusFilter === 'SUSPICIOUS' ? t.suspicious === true : t.status === txStatusFilter)

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div>
      {/* Filter controls */}
      <div className="admin-action-bar">
        <div className="admin-search-wrapper">
          <MagnifyingGlass className="admin-search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm mã giao dịch, số tài khoản..."
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <select
            className="admin-select"
            value={txTypeFilter}
            onChange={(e) => setTxTypeFilter(e.target.value)}
          >
            <option value="ALL">Tất cả hình thức</option>
            <option value="TRANSFER">Chuyển tiền (Transfer)</option>
            <option value="TOPUP">Nạp ví (Topup)</option>
            <option value="WITHDRAW">Rút ví (Withdraw)</option>
          </select>

          <select
            className="admin-select"
            value={txStatusFilter}
            onChange={(e) => setTxStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công (Success)</option>
            <option value="FAILED">Thất bại (Failed)</option>
            <option value="SUSPICIOUS">Nghi vấn (Suspicious)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Ví nguồn</th>
              <th>Ví nhận/Đối tác</th>
              <th>Số tiền</th>
              <th>Hình thức</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Nghi vấn</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--muted)' }}>Không tìm thấy giao dịch hợp lệ.</td>
              </tr>
            ) : (
              filteredTx.map(t => (
                <tr key={t.transactionId} style={t.suspicious ? { background: 'rgba(245, 158, 11, 0.03)' } : {}}>
                  <td>
                    <strong>{t.transactionId}</strong>
                    {t.suspicious && (
                      <span style={{ marginLeft: '6px', color: '#f59e0b' }} title="Nghi vấn gian lận">
                        <Warning size={14} weight="fill" style={{ display: 'inline' }} />
                      </span>
                    )}
                  </td>
                  <td><strong>{t.senderWalletId}</strong></td>
                  <td>{t.recipient}</td>
                  <td>
                    <strong style={{ color: t.amount > 0 ? '#22c55e' : 'var(--ink)' }}>
                      {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}đ
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {t.type === 'TRANSFER' ? 'Chuyển tiền' : (t.type === 'TOPUP' ? 'Nạp tiền' : 'Rút tiền')}
                    </span>
                  </td>
                  <td><span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t.date}</span></td>
                  <td>
                    <span className={`admin-badge ${t.status.toLowerCase()}`}>
                      {t.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="copy-btn"
                      onClick={() => requestPinAuthorization('TOGGLE_SUSPICIOUS_TX', { transactionId: t.transactionId, suspicious: t.suspicious })}
                      title={t.suspicious ? 'Gỡ cờ nghi ngờ gian lận' : 'Đánh dấu nghi ngờ gian lận'}
                      style={{ color: t.suspicious ? '#ef4444' : 'var(--muted)' }}
                    >
                      <Flag size={18} weight={t.suspicious ? 'fill' : 'regular'} />
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="table-action-btn view"
                        onClick={() => setSelectedTx(t)}
                      >
                        <Eye size={14} /> Chi tiết
                      </button>
                      {t.status === 'SUCCESS' && (
                        <button
                          className="table-action-btn lock"
                          onClick={() => requestPinAuthorization('FAIL_TRANSACTION', { transactionId: t.transactionId })}
                          title="Đánh dấu thất bại để thu hồi/hoàn trả"
                          style={{ padding: '4px 8px' }}
                        >
                          Hủy GD
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
