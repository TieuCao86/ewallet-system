import './HistoryPanel.css';
import TransactionHistoryTable from "../../components/TransactionHistoryTable.jsx";

function HistoryPanel({
                          wallet,
                          transactions = [],
                          filter,                // Kết quả từ hook useTransactionFilter
                          isLoading,             // Thêm prop nhận trạng thái load lần đầu từ React Query
                          isFetchingNextPage,    // Thêm prop nhận trạng thái đang tải trang tiếp từ React Query
                          handleExportCSV,
                          formatCurrency,
                          hasMore = false,
                          onLoadMore
                      }) {

    // Bóc tách số liệu thống kê từ filter gốc
    const {
        totalIn,
        totalOut,
        totalTransactions
    } = filter;

    // Đồng bộ hóa object filter và hàm setFilter giả lập sang cấu trúc unified của Table mới
    const unifiedFilter = {
        filteredTransactions: filter.filteredTransactions,
        search: filter.filterSearch,
        date: filter.filterDate,
        type: filter.filterType,
        status: filter.filterStatus
    };

    const setFilter = (updateFn) => {
        const mockPrev = {
            search: filter.filterSearch,
            date: filter.filterDate,
            type: filter.filterType,
            status: filter.filterStatus
        };
        const nextState = updateFn(mockPrev);

        if (nextState.search !== mockPrev.search) filter.setFilterSearch(nextState.search);
        if (nextState.date !== mockPrev.date) filter.setFilterDate(nextState.date);
        if (nextState.type !== mockPrev.type) filter.setFilterType(nextState.type);
        if (nextState.status !== mockPrev.status) filter.setFilterStatus(nextState.status);
    };

    return (
        <div className="tab-panel">

            <div className="stats-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <span style={{ fontSize: "24px" }}>₫</span>
                    </div>
                    <div className="stat-info">
                        <span>Số dư hiện tại</span>
                        <strong>{wallet?.balance?.toLocaleString() || 0}đ</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <span style={{ fontSize: "24px" }}>↑</span>
                    </div>
                    <div className="stat-info">
                        <span>Tổng nhận (Lọc)</span>
                        <strong>{totalIn.toLocaleString()}đ</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon red">
                        <span style={{ fontSize: "24px" }}>↓</span>
                    </div>
                    <div className="stat-info">
                        <span>Tổng chi (Lọc)</span>
                        <strong>{totalOut.toLocaleString()}đ</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <span style={{ fontSize: "24px" }}>⏱</span>
                    </div>
                    <div className="stat-info">
                        <span>Số giao dịch (Lọc)</span>
                        <strong>{totalTransactions}</strong>
                    </div>
                </div>
            </div>

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
    );
}

export default HistoryPanel;