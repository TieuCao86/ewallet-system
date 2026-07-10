import { User, Wallet, Warning } from '@phosphor-icons/react'
import TransactionHistoryTable from "../../components/TransactionHistoryTable.jsx";
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

                               transactions,          // Mảng allTransactions đã flatMap từ Component cha
                               filter,                // Kết quả trả về từ hook useTransactionFilter
                               isLoading,             // State load lần đầu từ React Query
                               isFetchingNextPage,    // State đang load trang tiếp theo từ React Query

                               formatCurrency,
                               formatNumberWithCommas,
                               handleExportCSV,

                               hasMore,               // Tương ứng với hasNextPage
                               onLoadMore             // Tương ứng với fetchNextPage
                           }) {

    // Đồng bộ hóa object filter: Tạo một object filter tổng hợp và hàm setFilter giả lập
    // để khớp hoàn toàn với cấu trúc mong đợi của TransactionHistoryTable mới.
    const unifiedFilter = {
        filteredTransactions: filter.filteredTransactions,
        search: filter.filterSearch,
        date: filter.filterDate,
        type: filter.filterType,
        status: filter.filterStatus
    };

    const setFilter = (updateFn) => {
        // Giả lập cơ chế cập nhật state từ functional update (prev => ({...prev, key: value}))
        const mockPrev = {
            search: filter.filterSearch,
            date: filter.filterDate,
            type: filter.filterType,
            status: filter.filterStatus
        };
        const nextState = updateFn(mockPrev);

        // Kích hoạt ngược lại các hàm set rời rạc của hook useTransactionFilter
        if (nextState.search !== mockPrev.search) filter.setFilterSearch(nextState.search);
        if (nextState.date !== mockPrev.date) filter.setFilterDate(nextState.date);
        if (nextState.type !== mockPrev.type) filter.setFilterType(nextState.type);
        if (nextState.status !== mockPrev.status) filter.setFilterStatus(nextState.status);
    };

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

            {/* Truyền cấu trúc filter đồng bộ xuống Table thành phần */}
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