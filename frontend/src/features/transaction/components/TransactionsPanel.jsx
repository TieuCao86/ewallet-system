import { useState } from 'react'
import { User, Wallet, Warning, CaretLeft, CaretRight } from '@phosphor-icons/react'
import TransactionHistoryTable from "./TransactionHistoryTable.jsx";
import FormInput from '../../../components/ui/FormInput.jsx'

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
                               limitPerTransaction = 50000000,
                               limitPerDay = 100000000,

                               transactions,
                               filter,
                               isLoading,
                               isFetchingNextPage,

                               formatCurrency,
                               formatNumberWithCommas,
                               handleExportCSV,

                               hasMore,
                               onLoadMore
                           }) {

    // State quản lý nguồn tiền được chọn (Mặc định chọn Ví VT Pay)
    const [selectedSource, setSelectedSource] = useState('vtp_wallet');

    // Giả lập danh sách tài khoản ngân hàng liên kết giống trong ảnh mockup
    const sourceAccounts = [
        { id: 'vtp_wallet', type: 'wallet', name: 'Ví VT Pay', detail: `${(wallet?.balance || 95000).toLocaleString()}đ`, isSelected: selectedSource === 'vtp_wallet' },
        { id: 'vcb', type: 'bank', name: 'NHTM Vietcombank', detail: '••••2233', icon: 'https://img.mservice.com.vn/app/img/payment/vietcombank.png', isSelected: selectedSource === 'vcb' },
        { id: 'agribank', type: 'bank', name: 'Agribank', detail: '••••95.000đ', icon: 'https://img.mservice.com.vn/app/img/payment/agribank.png', isSelected: selectedSource === 'agribank' },
        { id: 'techcombank', type: 'bank', name: 'Ngân hàng Techcombank', detail: '••••95.000đ', icon: 'https://img.mservice.com.vn/app/img/payment/techcombank.png', isSelected: selectedSource === 'techcombank' },
        { id: 'vpbank', type: 'bank', name: 'VPBank', detail: '••••95.000đ', icon: 'https://img.mservice.com.vn/app/img/payment/vpbank.png', isSelected: selectedSource === 'vpbank' },
    ];

    // Đồng bộ hóa object filter
    const unifiedFilter = {
        filteredTransactions: filter?.filteredTransactions || [],
        search: filter?.filterSearch || "",
        date: filter?.filterDate || "ALL",
        type: filter?.filterType || "ALL",
        status: filter?.filterStatus || "ALL"
    };

    const setFilter = (updateFn) => {
        const mockPrev = {
            search: filter?.filterSearch || "",
            date: filter?.filterDate || "ALL",
            type: filter?.filterType || "ALL",
            status: filter?.filterStatus || "ALL"
        };
        const nextState = updateFn(mockPrev);

        if (filter) {
            if (nextState.search !== mockPrev.search) filter.setFilterSearch(nextState.search);
            if (nextState.date !== mockPrev.date) filter.setFilterDate(nextState.date);
            if (nextState.type !== mockPrev.type) filter.setFilterType(nextState.type);
            if (nextState.status !== mockPrev.status) filter.setFilterStatus(nextState.status);
        }
    };

    // Hàm scroll danh sách ngân hàng sang phải
    const scrollSourcesRight = () => {
        const container = document.getElementById('source-accounts-container');
        if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
    };

    // Định nghĩa bảng Style đồng bộ chuẩn UI
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            fontFamily: 'Inter, sans-serif'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            alignItems: 'stretch'
        },
        card: {
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        },
        cardHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        },
        cardTitle: {
            margin: 0,
            fontSize: '1.15rem',
            fontWeight: '650',
            color: '#111827'
        },
        balanceText: {
            fontSize: '0.88rem',
            color: '#4B5563',
            fontWeight: '550'
        },
        balanceVal: {
            color: '#0F4C81'
        },
        rowInputs: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginTop: '16px'
        },
        customTextarea: {
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #D1D5DB',
            borderRadius: '12px',
            fontSize: '0.95rem',
            backgroundColor: '#FFFFFF',
            outline: 'none',
            minHeight: '44px',
            height: '44px',
            resize: 'none'
        },
        submitBtn: {
            width: '100%',
            backgroundColor: '#0F4C81',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'background-color 0.15s ease'
        },
        limitDescription: {
            color: '#6B7280',
            fontSize: '0.85rem',
            margin: '0 0 20px',
            lineHeight: '1.5'
        },
        limitRow: {
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F3F4F6',
            paddingBottom: '10px',
            marginBottom: '10px',
            fontSize: '0.9rem',
            color: '#374151'
        },
        sourceSection: {
            position: 'relative',
            marginTop: '8px',
            marginBottom: '8px'
        },
        sourceContainer: {
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none', // Ẩn scrollbar trên Firefox
            msOverflowStyle: 'none' // Ẩn scrollbar trên IE
        },
        accountCard: (isSelected) => ({
            flex: '0 0 auto',
            width: '240px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
            border: isSelected ? '2px solid #0F4C81' : '1px solid #E5E7EB',
            borderRadius: '14px',
            cursor: 'pointer',
            textAlign: 'left',
            position: 'relative',
            transition: 'all 0.2s ease'
        }),
        iconWrapper: (isSelected) => ({
            width: '40px',
            height: '40px',
            backgroundColor: isSelected ? '#D1E8FF' : '#F3F4F6',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }),
        checkBadge: {
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '16px',
            height: '16px',
            backgroundColor: '#0F4C81',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '9px'
        },
        scrollBtn: {
            position: 'absolute',
            right: '-16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            zIndex: 2
        }
    };

    return (
        <div style={styles.container}>
            {/* Khối Grid phía trên gồm: Form điền và Hạn mức giao dịch */}
            <div style={styles.grid} className="transfer-grid-override">

                {/* 1. Form Chuyển tiền nhanh */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Chuyển tiền nhanh</h3>
                        <span style={styles.balanceText}>
                            Số dư khả dụng: <strong style={styles.balanceVal}>{(wallet?.balance || 95000).toLocaleString()}đ</strong>
                        </span>
                    </div>

                    <form onSubmit={handleTransfer}>
                        {transferError && (
                            <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                                <Warning size={16} /> {transferError}
                            </div>
                        )}

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

                        {/* Hàng ngang chứa: Số tiền chuyển và Lời nhắn */}
                        <div style={styles.rowInputs}>
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

                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                <label className="input-label" htmlFor="transNote" style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '6px', color: 'var(--text)' }}>Lời nhắn</label>
                                <textarea
                                    style={styles.customTextarea}
                                    id="transNote"
                                    placeholder="Lời nhắn"
                                    value={transferNote}
                                    onChange={(e) => setTransferNote(e.target.value)}
                                    disabled={transferLoading}
                                />
                            </div>
                        </div>

                        <button style={styles.submitBtn} type="submit" disabled={transferLoading}>
                            {transferLoading ? <div className="btn-spinner" /> : 'Chuyển tiền'}
                        </button>
                    </form>
                </div>

                {/* 2. Khối Hạn mức giao dịch */}
                <div style={styles.card}>
                    <h3 style={{ ...styles.cardTitle, marginBottom: '8px' }}>Hạn mức giao dịch</h3>
                    <p style={styles.limitDescription}>
                        Tài khoản của bạn đã được xác thực KYC thành công. Hạn mức giao dịch hiện tại của bạn là:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
                        <div style={styles.limitRow}>
                            <span>Hạn mức tối đa/giao dịch:</span>
                            <strong style={{ color: '#111827' }}>{(limitPerTransaction || 50000000).toLocaleString()}đ</strong>
                        </div>
                        <div style={styles.limitRow}>
                            <span>Hạn mức tối đa/ngày:</span>
                            <strong style={{ color: '#111827' }}>{(limitPerDay || 100000000).toLocaleString()}đ</strong>
                        </div>
                        <div style={{ ...styles.limitRow, borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                            <span>Phí chuyển tiền nội bộ:</span>
                            <strong style={{ color: '#22C55E' }}>Miễn phí 100%</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Khối Slider tài khoản/nguồn tiền liên kết nằm ngang ở giữa */}
            <div style={styles.sourceSection}>
                <div id="source-accounts-container" style={styles.sourceContainer} className="hide-scrollbar">
                    {sourceAccounts.map((acc) => (
                        <button
                            type="button"
                            key={acc.id}
                            style={styles.accountCard(acc.isSelected)}
                            onClick={() => setSelectedSource(acc.id)}
                        >
                            <div style={styles.iconWrapper(acc.isSelected)}>
                                {acc.type === 'wallet' ? (
                                    <Wallet size={20} color={acc.isSelected ? '#0F4C81' : '#6B7280'} weight="bold" />
                                ) : (
                                    <img src={acc.icon} alt={acc.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1F2937' }}>{acc.name}</span>
                                <span style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>{acc.detail}</span>
                            </div>
                            {acc.isSelected && (
                                <div style={styles.checkBadge}>
                                    ✓
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                {/* Nút mũi tên cuộn nhanh danh sách sang phải */}
                <button type="button" style={styles.scrollBtn} onClick={scrollSourcesRight}>
                    <CaretRight size={16} weight="bold" color="#6B7280" />
                </button>
            </div>

            {/* Bảng Danh bạ / Lịch sử người nhận phía bên dưới cùng */}
            <TransactionHistoryTable
                transactions={unifiedFilter.filteredTransactions}
                filter={unifiedFilter}
                setFilter={setFilter}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                formatCurrency={formatCurrency}
                handleExportCSV={handleExportCSV}
                hasMore={hasMore}
                onLoadMore={onLoadMore}
            />
        </div>
    )
}

export default TransactionsPanel;