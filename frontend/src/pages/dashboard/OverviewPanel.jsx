import { ArrowDownLeft, ArrowUpRight, QrCode, ArrowsLeftRight, TrendDown, TrendUp, Clock, Wallet, CaretUp, CaretDown } from '@phosphor-icons/react'

function OverviewPanel({
                         wallet,
                         userProfile,
                         transactions = [],       // Nhận mảng 5 phần tử gần nhất
                         monthlyExpense = 0,
                         prevMonthlyExpense = 0,
                         monthlyIncome = 0,
                         prevMonthlyIncome = 0,
                         setModalType,
                         setActiveTab
                       }) {

  // Hàm helper tính toán phần trăm chênh lệch xu hướng tài chính
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { percent: 0, isUp: true, hasPrev: false };
    const diff = current - previous;
    const percent = Math.abs((diff / previous) * 100);
    return {
      percent: Math.round(percent * 10) / 10, // Làm tròn 1 chữ số thập phân
      isUp: diff >= 0,
      hasPrev: true
    };
  };

  const expenseTrend = calculateTrend(monthlyExpense, prevMonthlyExpense);
  const incomeTrend = calculateTrend(monthlyIncome, prevMonthlyIncome);

  return (
      <div className="tab-panel">
        <div className="wallet-overview-grid">
          <div className="wallet-card">
            <div className="wallet-card-header">
              <span className="wallet-label">Số dư khả dụng</span>
              <div className="wallet-id">
                <span>ID: {wallet?.walletId || '---'}</span>
              </div>
            </div>
            <div className="wallet-balance">
              <h2>{(wallet?.balance || 0).toLocaleString()}đ</h2>
            </div>
            <div className="wallet-card-footer">
              <div>
                <span style={{ fontSize: '0.78rem', display: 'block', opacity: 0.8, marginBottom: '2px' }}>Đăng nhập gần nhất</span>
                <strong>{wallet?.lastLogin || 'Vừa xong'}</strong>
              </div>
              <div className={`wallet-kyc ${userProfile?.kycStatus === 'APPROVED' ? 'verified' : (userProfile?.kycStatus === 'PENDING' ? 'pending' : 'rejected')}`}>
                {userProfile?.kycStatus === 'APPROVED' && 'Đã xác thực KYC'}
                {userProfile?.kycStatus === 'PENDING' && 'KYC Đang duyệt'}
                {userProfile?.kycStatus === 'REJECTED' && 'KYC Bị Từ Chối'}
                {!userProfile?.kycStatus && 'Chưa xác thực'}
              </div>
            </div>
          </div>

          <div className="quick-actions-panel">
            <h3>Giao dịch nhanh</h3>
            <div className="actions-grid">
              {/* FIX LỖI TẠI ĐÂY: Rút gọn chỉ truyền setModalType duy nhất */}
              <button className="action-btn" onClick={() => setModalType('topup')}>
                <ArrowDownLeft size={22} weight="bold" /> Nạp tiền
              </button>
              <button className="action-btn" onClick={() => setModalType('withdraw')}>
                <ArrowUpRight size={22} weight="bold" /> Rút tiền
              </button>
              <button className="action-btn" onClick={() => setActiveTab('transactions')}>
                <ArrowsLeftRight size={22} weight="bold" /> Chuyển tiền
              </button>
              <button className="action-btn" onClick={() => setModalType('qrscanner')}>
                <QrCode size={22} weight="bold" /> Quét QR
              </button>
              <button className="action-btn" onClick={() => setActiveTab('myqr')}>
                <QrCode size={22} weight="bold" style={{ color: 'var(--accent)' }} /> QR của tôi
              </button>
              <button className="action-btn" onClick={() => setActiveTab('bank')}>
                <Wallet size={22} weight="bold" /> Liên kết thẻ
              </button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Wallet size={24} weight="fill" />
            </div>
            <div className="stat-info">
              <span>Tổng số dư</span>
              <strong>{(wallet?.balance || 0).toLocaleString()}đ</strong>
            </div>
          </div>

          {/* Thẻ Chi Tiêu */}
          <div className="stat-card">
            <div className="stat-icon red">
              <TrendDown size={24} weight="bold" />
            </div>
            <div className="stat-info">
              <span>Chi tiêu tháng</span>
              <strong>{monthlyExpense.toLocaleString()}đ</strong>

              {expenseTrend.hasPrev && (
                  <span className={`trend-badge ${expenseTrend.isUp ? 'bad-trend' : 'good-trend'}`}>
                {expenseTrend.isUp ? <CaretUp weight="bold" /> : <CaretDown weight="bold" />}
                    {expenseTrend.percent}% so với tháng trước
              </span>
              )}
            </div>
          </div>

          {/* Thẻ Thu Nhập */}
          <div className="stat-card">
            <div className="stat-icon green">
              <TrendUp size={24} weight="bold" />
            </div>
            <div className="stat-info">
              <span>Thu nhập tháng</span>
              <strong>{monthlyIncome.toLocaleString()}đ</strong>

              {incomeTrend.hasPrev && (
                  <span className={`trend-badge ${incomeTrend.isUp ? 'good-trend' : 'bad-trend'}`}>
                {incomeTrend.isUp ? <CaretUp weight="bold" /> : <CaretDown weight="bold" />}
                    {incomeTrend.percent}% so với tháng trước
              </span>
              )}
            </div>
          </div>

          {/* Thẻ Số giao dịch gần đây */}
          <div className="stat-card">
            <div className="stat-icon orange">
              <Clock size={24} weight="bold" />
            </div>
            <div className="stat-info">
              <span>GD gần đây (Overview)</span>
              <strong>{transactions.length}</strong>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Chi tiêu theo nhóm</h3>
            <div className="donut-chart-wrapper">
              <svg width="120" height="120" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.2" />
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--accent)" strokeWidth="4.2" strokeDasharray="45 55" strokeDashoffset="25" />
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f97316" strokeWidth="4.2" strokeDasharray="35 65" strokeDashoffset="80" />
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4.2" strokeDasharray="20 80" strokeDashoffset="115" />
              </svg>
              <div className="donut-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ background: 'var(--accent)' }} />
                  <span>Ăn uống & Cà phê (45%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#f97316' }} />
                  <span>Điện, nước & Sinh hoạt (35%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#ef4444' }} />
                  <span>Các chi tiêu khác (20%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>Dòng tiền hàng tháng</h3>
            <div className="chart-flow-bars">
              <div className="bar-column">
                <div className="bar-stack">
                  <div className="bar-value" style={{ height: '70%', background: 'var(--accent)' }} />
                </div>
                <span className="bar-label">Th4</span>
              </div>
              <div className="bar-column">
                <div className="bar-stack">
                  <div className="bar-value" style={{ height: '85%', background: 'var(--accent)' }} />
                </div>
                <span className="bar-label">Th5</span>
              </div>
              <div className="bar-column">
                <div className="bar-stack">
                  <div className="bar-value" style={{ height: '55%', background: 'var(--accent)' }} />
                </div>
                <span className="bar-label">Th6</span>
              </div>
            </div>
          </div>

          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Hoạt động ví trong tuần</h3>
            <div className="chart-activity-timeline">
              <div className="activity-row">
                <div className="activity-label-group">
                  <div className="activity-dot" style={{ background: 'var(--accent)' }} />
                  <span>Chuyển tiền nội bộ</span>
                </div>
                <div className="activity-progress-bar">
                  <div className="activity-progress-fill" style={{ width: '75%', background: 'var(--accent)' }} />
                </div>
                <strong style={{ fontStyle: 'normal' }}>75%</strong>
              </div>
              <div className="activity-row">
                <div className="activity-label-group">
                  <div className="activity-dot" style={{ background: '#22c55e' }} />
                  <span>Nạp tiền ngân hàng</span>
                </div>
                <div className="activity-progress-bar">
                  <div className="activity-progress-fill" style={{ width: '50%', background: '#22c55e' }} />
                </div>
                <strong style={{ fontStyle: 'normal' }}>50%</strong>
              </div>
              <div className="activity-row">
                <div className="activity-label-group">
                  <div className="activity-dot" style={{ background: '#f97316' }} />
                  <span>Rút tiền về thẻ</span>
                </div>
                <div className="activity-progress-bar">
                  <div className="activity-progress-fill" style={{ width: '25%', background: '#f97316' }} />
                </div>
                <strong style={{ fontStyle: 'normal' }}>25%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default OverviewPanel;