import { DownloadSimple } from '@phosphor-icons/react'

function HistoryPanel({
  wallet,
  filteredTransactions,
  filterSearch,
  setFilterSearch,
  filterDate,
  setFilterDate,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  handleExportCSV,
  formatCurrency
}) {
  return (
    <div className="tab-panel">
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <span style={{ fontSize: '24px' }}>₫</span>
          </div>
          <div className="stat-info">
            <span>Số dư hiện tại</span>
            <strong>{wallet.balance.toLocaleString()}đ</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <span style={{ fontSize: '24px' }}>↑</span>
          </div>
          <div className="stat-info">
            <span>Tổng nhận (Lọc)</span>
            <strong>{filteredTransactions.filter(tx => tx.amount > 0 && tx.status === 'SUCCESS').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}đ</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <span style={{ fontSize: '24px' }}>↓</span>
          </div>
          <div className="stat-info">
            <span>Tổng chi (Lọc)</span>
            <strong>{filteredTransactions.filter(tx => tx.amount < 0 && tx.status === 'SUCCESS').reduce((sum, tx) => sum + Math.abs(tx.amount), 0).toLocaleString()}đ</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <span style={{ fontSize: '24px' }}>⏱</span>
          </div>
          <div className="stat-info">
            <span>Số giao dịch (Lọc)</span>
            <strong>{filteredTransactions.length}</strong>
          </div>
        </div>
      </div>

      <div className="recent-transactions-card">
        <div className="section-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ margin: 0 }}>Lịch sử giao dịch ví</h2>
            <button
              className="auth-btn"
              style={{ minHeight: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
              onClick={handleExportCSV}
            >
              <DownloadSimple size={18} weight="bold" />
              Xuất file CSV
            </button>
          </div>

          <div className="filters-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              className="filter-search-input"
              placeholder="Tìm kiếm theo mã GD, người nhận, số tiền..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />

            <select className="filter-select" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
              <option value="ALL">Tất cả thời gian</option>
              <option value="TODAY">Hôm nay</option>
              <option value="WEEK">7 ngày gần đây</option>
              <option value="MONTH">Tháng này</option>
            </select>

            <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="ALL">Mọi loại giao dịch</option>
              <option value="TRANSFER">Chuyển khoản</option>
              <option value="TOPUP">Nạp tiền</option>
              <option value="WITHDRAW">Rút tiền</option>
            </select>

            <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>
        </div>

        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Mã GD</th>
                <th>Người nhận / Nguồn</th>
                <th>Loại</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-row">Không có giao dịch nào khớp với bộ lọc tìm kiếm.</td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)' }}>{tx.id}</td>
                    <td>
                      <div className="recipient-cell">
                        <div className="recipient-avatar">{tx.recipient.substring(0, 1).toUpperCase()}</div>
                        {tx.recipient}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--muted)' }}>
                        {tx.type === 'TRANSFER' && 'Chuyển tiền'}
                        {tx.type === 'TOPUP' && 'Nạp ví'}
                        {tx.type === 'WITHDRAW' && 'Rút ví'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{tx.date}</td>
                    <td>
                      <span className={`status-badge ${tx.status === 'SUCCESS' ? 'success' : (tx.status === 'PENDING' ? 'pending' : 'failed')}`}>
                        {tx.status === 'SUCCESS' && 'Thành công'}
                        {tx.status === 'PENDING' && 'Chờ xử lý'}
                        {tx.status === 'FAILED' && 'Thất bại'}
                      </span>
                    </td>
                    <td>
                      <span className={`transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HistoryPanel
