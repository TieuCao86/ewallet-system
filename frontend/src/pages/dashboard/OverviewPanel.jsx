import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  ArrowsLeftRight,
  TrendDown,
  TrendUp,
  Clock,
  Wallet,
  CaretUp,
  CaretDown,
  Sun,
  CloudSun,
  SunHorizon,
  Moon,
  Eye,
  ArrowRight
} from '@phosphor-icons/react';
import './OverviewPanel.css'

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

  // --- 1. Hàm helper lấy lời chào thời gian thực ---
  const getGreetingData = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 11) {
      return { text: 'Chào buổi sáng', icon: <Sun size={22} weight="duotone" style={{ color: '#ffb703', filter: 'drop-shadow(0 2px 4px rgba(255, 183, 3, 0.3))' }} /> };
    } else if (hours >= 11 && hours < 14) {
      return { text: 'Chào buổi trưa', icon: <CloudSun size={22} weight="duotone" style={{ color: '#fd9e02', filter: 'drop-shadow(0 2px 4px rgba(253, 158, 2, 0.3))' }} /> };
    } else if (hours >= 14 && hours < 18) {
      return { text: 'Chào buổi chiều', icon: <SunHorizon size={22} weight="duotone" style={{ color: '#fb8500', filter: 'drop-shadow(0 2px 4px rgba(251, 133, 0, 0.3))' }} /> };
    } else {
      return { text: 'Chào buổi tối', icon: <Moon size={22} weight="duotone" style={{ color: '#fef08a', filter: 'drop-shadow(0 2px 8px rgba(254, 240, 138, 0.4))' }} /> };
    }
  };

  const greeting = getGreetingData();

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { percent: 0, isUp: true, hasPrev: false };
    const diff = current - previous;
    const percent = Math.abs((diff / previous) * 100);
    return { percent: Math.round(percent * 10) / 10, isUp: diff >= 0, hasPrev: true };
  };

  const expenseTrend = calculateTrend(monthlyExpense, prevMonthlyExpense);
  const incomeTrend = calculateTrend(monthlyIncome, prevMonthlyIncome);

  // --- 2. XỬ LÝ DỮ LIỆU ĐỒ THỊ & EVENT CLICK THAY ĐỔI DATA ---
  const currentMonth = new Date().getMonth() + 1;

  // Xác định số tháng hiển thị
  const mCurrent = currentMonth;
  const mPrev1 = ((currentMonth - 2 + 12) % 12) + 1;
  const mPrev2 = ((currentMonth - 3 + 12) % 12) + 1;

  // Thu thập dữ liệu từ ví (MOCK nhẹ dữ liệu cho 2 tháng trước nếu API chưa trả về, tháng liền kề lấy từ prevMonth của hook)
  const financialData = {
    [mPrev2]: { label: `Tháng ${mPrev2}`, income: prevMonthlyIncome * 0.8 || 2200000, expense: prevMonthlyExpense * 0.9 || 35000 },
    [mPrev1]: { label: `Tháng ${mPrev1}`, income: prevMonthlyIncome || 44166, expense: prevMonthlyExpense || 65786 },
    [mCurrent]: { label: `Tháng ${mCurrent}`, income: monthlyIncome, expense: monthlyExpense }
  };

  // State quản lý tháng đang được người dùng chọn xem (Mặc định ban đầu là tháng hiện tại)
  const [selectedMonth, setSelectedMonth] = useState(mCurrent);

  // Đồng bộ lại state nếu props dữ liệu từ useDashboardQuery thay đổi
  useEffect(() => {
    setSelectedMonth(mCurrent);
  }, [monthlyIncome, monthlyExpense]);

  const activeFinancials = financialData[selectedMonth];

  // Tìm Max toàn cục để tính tỷ lệ cột chuẩn xác nhất
  const allValues = Object.values(financialData).flatMap(d => [d.income, d.expense]);
  const maxAmount = Math.max(...allValues, 1000000);

  // Hàm tính toán chiều cao cột (%)
  const calcHeight = (val) => {
    if (!val || val === 0) return '8%'; // Nếu bằng 0, giữ mức tối thiểu 6% để không bị mất cột

    const calculatedHeight = (val / maxAmount) * 85;

    // Nếu số tiền quá nhỏ so với mốc Max khiến % chiều cao < 8%, áp dụng mốc tối thiểu 8%
    return `${Math.max(calculatedHeight, 8)}%`;
  };

  return (
      <div className="tab-panel">
        <div className="wallet-overview-grid">
          <div className="wallet-card">
            <div className="wallet-card-header-row">
              <div className="wallet-card-top">
                <span className="wallet-label">Số dư khả dụng</span>
                <div className="wallet-balance">
                  <h2>{(wallet?.balance || 0).toLocaleString()}đ</h2>
                </div>
              </div>
              <div className="wallet-greeting-box">
                {greeting.icon}
                <span>{greeting.text}, <strong>{userProfile?.fullName || 'Bạn'}</strong></span>
              </div>
            </div>
            <div className="wallet-card-bottom-row">
              <span className="wallet-account-title">Tài khoản</span>
              <div className="wallet-id-pill">
                <span>ID: {wallet?.walletId || '---'}</span>
              </div>
            </div>
          </div>

          <div className="quick-actions-panel">
            <h3>Giao dịch nhanh</h3>
            <div className="actions-grid">
              <div className="action-item">
                <button className="action-btn" onClick={() => setModalType('topup')}><ArrowDownLeft size={24} weight="bold" /></button>
                <span className="action-label">Nạp tiền</span>
              </div>
              <div className="action-item">
                <button className="action-btn" onClick={() => setModalType('withdraw')}><ArrowUpRight size={24} weight="bold" /></button>
                <span className="action-label">Rút tiền</span>
              </div>
              <div className="action-item">
                <button className="action-btn" onClick={() => setActiveTab('transactions')}><ArrowsLeftRight size={24} weight="bold" /></button>
                <span className="action-label">Chuyển tiền</span>
              </div>
              <div className="action-item">
                <button className="action-btn" onClick={() => setModalType('qrscanner')}><QrCode size={24} weight="bold" /></button>
                <span className="action-label">Quét QR</span>
              </div>
              <div className="action-item">
                <button className="action-btn" onClick={() => setActiveTab('myqr')}><QrCode size={24} weight="bold" /></button>
                <span className="action-label">QR của tôi</span>
              </div>
              <div className="action-item">
                <button className="action-btn" onClick={() => setActiveTab('bank')}><Wallet size={24} weight="bold" /></button>
                <span className="action-label">Liên kết thẻ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><Wallet size={24} weight="fill" /></div>
            <div className="stat-info">
              <span>Tổng số dư</span>
              <strong>{(wallet?.balance || 0).toLocaleString()}đ</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red"><TrendDown size={24} weight="bold" /></div>
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

          <div className="stat-card">
            <div className="stat-icon green"><TrendUp size={24} weight="bold" /></div>
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

          <div className="stat-card">
            <div className="stat-icon orange"><Clock size={24} weight="bold" /></div>
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

          {/* KHỐI TÀI CHÍNH CÁ NHÂN CÓ TƯƠNG TÁC CLICK ĐỔI DỮ LIỆU */}
          <div className="chart-card finance-management-card">
            <div className="finance-card-header">
              <h3>Quản lý tài chính cá nhân</h3>
              <button className="detail-link-btn" onClick={() => setActiveTab('transactions')}>
                <span>Chi tiết</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>

            <div className="finance-card-content">
              {/* Bên trái: Thông tin thay đổi động theo `selectedMonth` */}
              <div className="finance-summary-side">
                <div className="month-selector">
                  <span>{activeFinancials.label}</span>
                  <Eye size={16} weight="regular" className="toggle-visibility-icon" />
                </div>

                <div className="finance-stat-item">
                  <div className="stat-legend-dot income-dot" />
                  <div className="stat-text-group">
                    <span className="stat-label">Tổng thu</span>
                    <strong className="stat-amount">{activeFinancials.income.toLocaleString()} VND</strong>
                  </div>
                </div>

                <div className="finance-stat-item">
                  <div className="stat-legend-dot expense-dot" />
                  <div className="stat-text-group">
                    <span className="stat-label">Tổng chi</span>
                    <strong className="stat-amount">{activeFinancials.expense.toLocaleString()} VND</strong>
                  </div>
                </div>

                <span className="update-timestamp">
                  Cập nhật đến ngày {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Bên phải: Cả 3 tháng đều là cụm 2 cột. Click để active thay đổi state */}
              <div className="finance-chart-side">

                {/* 2 tháng trước */}
                <div className={`finance-bar-group clickable-bar-group ${selectedMonth === mPrev2 ? 'active' : ''}`}
                     onClick={() => setSelectedMonth(mPrev2)}>
                  <div className="double-bars">
                    <div className="bar expense-bar" style={{ height: calcHeight(financialData[mPrev2].expense) }} />
                    <div className="bar income-bar" style={{ height: calcHeight(financialData[mPrev2].income) }} />
                  </div>
                  {selectedMonth === mPrev2 ? <span className="month-pill">T{mPrev2}</span> : <span className="month-label">T{mPrev2}</span>}
                </div>

                {/* 1 tháng trước */}
                <div className={`finance-bar-group clickable-bar-group ${selectedMonth === mPrev1 ? 'active' : ''}`}
                     onClick={() => setSelectedMonth(mPrev1)}>
                  <div className="double-bars">
                    <div className="bar expense-bar" style={{ height: calcHeight(financialData[mPrev1].expense) }} />
                    <div className="bar income-bar" style={{ height: calcHeight(financialData[mPrev1].income) }} />
                  </div>
                  {selectedMonth === mPrev1 ? <span className="month-pill">T{mPrev1}</span> : <span className="month-label">T{mPrev1}</span>}
                </div>

                {/* Tháng hiện tại */}
                <div className={`finance-bar-group clickable-bar-group ${selectedMonth === mCurrent ? 'active' : ''}`}
                     onClick={() => setSelectedMonth(mCurrent)}>
                  <div className="double-bars">
                    <div className="bar expense-bar" style={{ height: calcHeight(financialData[mCurrent].expense) }} />
                    <div className="bar income-bar" style={{ height: calcHeight(financialData[mCurrent].income) }} />
                  </div>
                  {selectedMonth === mCurrent ? <span className="month-pill">T{mCurrent}</span> : <span className="month-label">T{mCurrent}</span>}
                </div>

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
  );
}

export default OverviewPanel;