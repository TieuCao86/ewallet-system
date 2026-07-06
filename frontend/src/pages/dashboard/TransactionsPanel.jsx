import { User, Wallet, Warning } from '@phosphor-icons/react'
import FormInput from '../../components/FormInput'

function TransactionsPanel({
  handleTransfer,
  transferError,
  transferPhone,
  setTransferPhone,
  transferAmount,
  setTransferAmount,
  transferNote,
  setTransferNote,
  transferLoading,
  wallet,
  limitPerTransaction,
  limitPerDay,

  filter,

  formatCurrency,
  formatNumberWithCommas,
  handleExportCSV
}) {

  const {
    filteredTransactions,

    filterDate,
    setFilterDate,

    filterType,
    setFilterType,

    filterStatus,
    setFilterStatus
  } = filter;

  return (
    <div className="tab-panel">
      <div className="transfer-grid">
        <div className="transfer-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0 }}>Chuyển tiền nhanh</h3>
            <span style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 550 }}>
              Số dư khả dụng: <strong style={{ color: 'var(--accent)' }}>{wallet.balance.toLocaleString()}đ</strong>
            </span>
          </div>
          <form className="auth-form" onSubmit={handleTransfer}>
            {transferError && <div className="error-message" style={{ fontSize: '0.9rem' }}><Warning size={16} /> {transferError}</div>}

            <FormInput
              label="Số điện thoại nhận tiền"
              id="recPhone"
              type="tel"
              placeholder="Nhập SĐT người nhận"
              value={transferPhone}
              onChange={(e) => setTransferPhone(e.target.value)}
              disabled={transferLoading}
              icon={User}
            />

            <FormInput
              label="Số tiền chuyển (đ)"
              id="transAmt"
              type="text"
              placeholder="Ví dụ: 50,000"
              value={transferAmount}
              onChange={(e) => setTransferAmount(formatNumberWithCommas(e.target.value))}
              disabled={transferLoading}
              icon={Wallet}
            />

            <div className="input-group">
              <label className="input-label" htmlFor="transNote">Lời nhắn chuyển khoản</label>
              <textarea
                className="input-field"
                id="transNote"
                placeholder="Nhập nội dung chuyển tiền (không dấu)"
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                disabled={transferLoading}
                style={{ minHeight: '80px', borderRadius: '14px', paddingLeft: '16px', resize: 'vertical' }}
              />
            </div>

            <button className="auth-btn" type="submit" disabled={transferLoading}>
              {transferLoading ? <div className="btn-spinner" /> : 'Thực hiện chuyển khoản'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="recent-transactions-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 700 }}>Hạn mức giao dịch</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 16px', lineHeight: 1.5 }}>
              Tài khoản của bạn đã được xác thực KYC thành công. Hạn mức giao dịch ví hiện tại của bạn là:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span>Hạn mức tối đa/giao dịch:</span>
                <strong>{limitPerTransaction.toLocaleString()}đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span>Hạn mức tối đa/ngày:</span>
                <strong>{limitPerDay.toLocaleString()}đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phí chuyển tiền nội bộ:</span>
                <strong style={{ color: '#22c55e' }}>Miễn phí 100%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-transactions-card">
        <div className="section-header">
          <h2>Lịch sử giao dịch ví</h2>
          <div className="filters-row">
            <select className="filter-select" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
              <option value="ALL">Tất cả thời gian</option>
              <option value="TODAY">Hôm nay</option>
              <option value="WEEK">7 ngày gần đây</option>
              <option value="MONTH">Tháng này</option>
            </select>

            <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="ALL">Mọi loại giao dịch</option>
              <option value="TRANSFER">Chuyển khoản</option>
              <option value="TOP_UP">Nạp tiền</option>
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
                  <td colSpan="5" className="no-data-row">Không có giao dịch nào khớp với bộ lọc tìm kiếm.</td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div className="recipient-cell">
                        <div className="recipient-avatar">
                          {(tx.recipient || '?').charAt(0).toUpperCase()}
                        </div>
                        {tx.recipient || 'Hệ thống'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--muted)' }}>
                        {tx.type === 'TRANSFER' && 'Chuyển tiền'}
                        {tx.type === 'TOP_UP' && 'Nạp ví'}
                        {tx.type === 'WITHDRAW' && 'Rút ví'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{tx.date}</td>
                    <td>
                      <span className={`status-badge ${tx.status === 'SUCCESS' ? 'success' : (tx.status === 'PENDING' ? 'pending' : 'failed')}`}>
                        {tx.status === 'SUCCESS' && 'Thành công'}
                        {tx.status === 'PENDING' && 'Chờ xử lý'}
                        {tx.status === 'FAILED' && 'Thất bại'}
                        {tx.status === 'CANCELLED' && 'Đã hủy'}
                      </span>
                    </td>
                    <td>
                      <span className={`transaction-amount ${tx.direction === 'IN' ? 'positive' : tx.direction === 'OUT' ? 'negative' : ''}`}>
                      {tx.direction === 'IN' ? '+' : tx.direction === 'OUT' ? '-' : ''}{formatCurrency(tx.amount)}
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

export default TransactionsPanel
