import React, { useState, useMemo } from 'react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    QrCode,
    ArrowsLeftRight,
    Wallet,
    Sun,
    CloudSun,
    SunHorizon,
    Moon,
    Eye,
    ArrowRight
} from '@phosphor-icons/react';
import './OverviewPanel.css';

function OverviewPanel({
                           wallet,
                           userProfile,
                           marketingBanners,
                           financialHistory = null,
                           setModalType,
                           setActiveTab
                       }) {

    // --- 1. Hàm helper lấy lời chào thời gian thực ---
    const greeting = useMemo(() => {
        const hours = new Date().getHours();
        if (hours >= 5 && hours < 11) return { text: 'Chào buổi sáng', icon: <Sun size={22} weight="duotone" style={{ color: '#ffb703', filter: 'drop-shadow(0 2px 4px rgba(255, 183, 3, 0.3))' }} /> };
        if (hours >= 11 && hours < 14) return { text: 'Chào buổi trưa', icon: <CloudSun size={22} weight="duotone" style={{ color: '#fd9e02', filter: 'drop-shadow(0 2px 4px rgba(253, 158, 2, 0.3))' }} /> };
        if (hours >= 14 && hours < 18) return { text: 'Chào buổi chiều', icon: <SunHorizon size={22} weight="duotone" style={{ color: '#fb8500', filter: 'drop-shadow(0 2px 4px rgba(251, 133, 0, 0.3))' }} /> };
        return { text: 'Chào buổi tối', icon: <Moon size={22} weight="duotone" style={{ color: '#fef08a', filter: 'drop-shadow(0 2px 8px rgba(254, 240, 138, 0.4))' }} /> };
    }, []);

    // --- 2. Hàm điều hướng khi click vào Banner ---
    const handleBannerClick = (redirectUrl) => {
        if (!redirectUrl) return;
        if (redirectUrl.startsWith('http')) {
            window.open(redirectUrl, '_blank');
        } else {
            if (redirectUrl.includes('transfer')) setActiveTab('transactions');
            if (redirectUrl.includes('link-bank')) setActiveTab('bank');
        }
    };

    // --- 3. XỬ LÝ MỐC THỜI GIAN ĐỘNG & BINDING DỮ LIỆU ĐỘNG ---
    const currentMonth = new Date().getMonth() + 1;
    const mCurrent = currentMonth;
    const mPrev1 = ((currentMonth - 2 + 12) % 12) + 1;
    const mPrev2 = ((currentMonth - 3 + 12) % 12) + 1;

    const [selectedMonth, setSelectedMonth] = useState(mCurrent);

    // Bộ khung dự phòng (Fallback) nếu API thống kê chưa load xong dữ liệu
    const defaultData = useMemo(() => ({
        [mPrev2]: { label: `Tháng ${mPrev2}`, income: 0, expense: 0 },
        [mPrev1]: { label: `Tháng ${mPrev1}`, income: 0, expense: 0 },
        [mCurrent]: { label: `Tháng ${mCurrent}`, income: 0, expense: 0 }
    }), [mPrev2, mPrev1, mCurrent]);

    // Trộn dữ liệu thực tế nhận từ API vào bộ khung 3 tháng của biểu đồ
    const chartData = useMemo(() => {
        if (!financialHistory) return defaultData;
        return {
            [mPrev2]: financialHistory[mPrev2] || defaultData[mPrev2],
            [mPrev1]: financialHistory[mPrev1] || defaultData[mPrev1],
            [mCurrent]: financialHistory[mCurrent] || defaultData[mCurrent]
        };
    }, [financialHistory, defaultData, mPrev2, mPrev1, mCurrent]);

    const activeFinancials = chartData[selectedMonth];

    // Tìm giá trị cao nhất trong cả 3 tháng để làm mốc tính tỷ lệ chiều cao cột (%)
    const maxAmount = useMemo(() => {
        const allNumbers = Object.values(chartData).flatMap(d => [d.income, d.expense]);
        return Math.max(...allNumbers, 100000); // Đặt mốc sàn tối thiểu tránh lỗi chia cho 0
    }, [chartData]);

    // Hàm tính toán chiều cao cột động dựa trên dữ liệu thực tế
    const calcHeight = (val) => {
        if (!val || val === 0) return '8%'; // Giữ mức tối thiểu để không bị biến mất cột trên UI
        return `${Math.max((val / maxAmount) * 85, 8)}%`;
    };

    return (
        <div className="tab-panel">
            {/* LỚP 1: THÊ VÍ & GIAO DỊCH NHANH */}
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

            {/* LỚP 2: BANNER QUẢNG CÁO KHUYẾN MÃI */}
            <div className="dashboard-banners-container">
                <div className="banners-header">
                    <h3>Ưu đãi & Tiện ích nổi bật</h3>
                    <span className="banners-subtitle">Chương trình khuyến mãi dành riêng cho bạn</span>
                </div>

                <div className="marketing-banners-grid">
                    {marketingBanners.length > 0 ? (
                        marketingBanners.slice(0, 2).map((banner) => (
                            <div
                                key={banner.id}
                                className="marketing-banner-card"
                                onClick={() => handleBannerClick(banner.redirectUrl)}
                                style={{ cursor: banner.redirectUrl ? 'pointer' : 'default' }}
                            >
                                <div className="banner-image-wrapper">
                                    <img src={banner.imageUrl} alt={banner.title} title={banner.title} />
                                </div>
                                <div className="banner-info-overlay">
                                    <h4>{banner.title}</h4>
                                    {banner.redirectUrl && (
                                        <span className="banner-action-link">
                        Khám phá ngay <ArrowRight size={14} weight="bold" />
                      </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="marketing-banner-card placeholder-banner">
                                <div className="banner-placeholder-content">VT Pay Promotions 2026</div>
                            </div>
                            <div className="marketing-banner-card placeholder-banner">
                                <div className="banner-placeholder-content">Liên kết ngân hàng - Nhận ngàn quà tặng</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* LỚP 3: BIỂU ĐỒ TRỰC QUAN ĐỘNG */}
            <div className="charts-grid" style={{ marginTop: '24px' }}>
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

                <div className="chart-card finance-management-card">
                    <div className="finance-card-header">
                        <h3>Quản lý tài chính cá nhân</h3>
                        <button className="detail-link-btn" onClick={() => setActiveTab('transactions')}>
                            <span>Chi tiết</span>
                            <ArrowRight size={14} weight="bold" />
                        </button>
                    </div>

                    <div className="finance-card-content">
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

                        <div className="finance-chart-side">
                            {/* Cột tháng T-2 */}
                            <div className={`finance-bar-group clickable-bar-group ${selectedMonth === mPrev2 ? 'active' : ''}`}
                                 onClick={() => setSelectedMonth(mPrev2)}>
                                <div className="double-bars">
                                    <div className="bar expense-bar" style={{ height: calcHeight(chartData[mPrev2].expense) }} />
                                    <div className="bar income-bar" style={{ height: calcHeight(chartData[mPrev2].income) }} />
                                </div>
                                <span className={selectedMonth === mPrev2 ? "month-pill" : "month-label"}>T{mPrev2}</span>
                            </div>

                            {/* Cột tháng T-1 */}
                            <div className={`finance-bar-group clickable-bar-group ${selectedMonth === mPrev1 ? 'active' : ''}`}
                                 onClick={() => setSelectedMonth(mPrev1)}>
                                <div className="double-bars">
                                    <div className="bar expense-bar" style={{ height: calcHeight(chartData[mPrev1].expense) }} />
                                    <div className="bar income-bar" style={{ height: calcHeight(chartData[mPrev1].income) }} />
                                </div>
                                <span className={selectedMonth === mPrev1 ? "month-pill" : "month-label"}>T{mPrev1}</span>
                            </div>

                            {/* Cột tháng hiện tại */}
                            <div className={`finance-bar-group clickable-bar-group ${selectedMonth === mCurrent ? 'active' : ''}`}
                                 onClick={() => setSelectedMonth(mCurrent)}>
                                <div className="double-bars">
                                    <div className="bar expense-bar" style={{ height: calcHeight(chartData[mCurrent].expense) }} />
                                    <div className="bar income-bar" style={{ height: calcHeight(chartData[mCurrent].income) }} />
                                </div>
                                <span className={selectedMonth === mCurrent ? "month-pill" : "month-label"}>T{mCurrent}</span>
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