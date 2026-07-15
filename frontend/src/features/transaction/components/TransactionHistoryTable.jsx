import { useCallback } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import "./HistoryPanel.css";

function TransactionHistoryTable({
                                     transactions = [], // Mảng phẳng flatMap từ React Query truyền xuống
                                     filter,            // State filter từ cha
                                     setFilter,         // Hàm cập nhật filter từ cha
                                     formatCurrency,
                                     handleExportCSV,
                                     hasMore = false,   // Tương ứng với hasNextPage
                                     onLoadMore,        // Tương ứng với fetchNextPage
                                     isLoading,         // Trạng thái load lần đầu của React Query
                                     isFetchingNextPage // Trạng thái đang cuộn để tải thêm
                                 }) {

    // Kế thừa cơ chế cuộn mượt mà của React Query (Không cần useRef khóa dòng nữa)
    const handleScroll = useCallback((e) => {
        if (isFetchingNextPage || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        // Cuộn gần tới đáy (cách 80px) thì tự gọi trang tiếp theo
        if (scrollHeight - scrollTop - clientHeight < 80) {
            onLoadMore();
        }
    }, [hasMore, isFetchingNextPage, onLoadMore]);

    return (
        <div className="recent-transactions-card">
            <div className="section-header" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "stretch" }}>
                <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <h2 style={{ margin: 0 }}>Lịch sử giao dịch ví</h2>
                    <button className="auth-btn" style={{ minHeight: "38px", padding: "0 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }} onClick={handleExportCSV}>
                        <DownloadSimple size={18} weight="bold" />
                        Xuất file CSV
                    </button>
                </div>

                {/* Các ô filter giữ nguyên, chỉ thay onChange bằng hàm setFilter tổng từ component cha */}
                <div className="filters-row" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                    <input
                        type="text"
                        className="filter-search-input"
                        placeholder="Tìm theo mã GD, người nhận, số tiền..."
                        value={filter.search}
                        onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                    />
                    <select className="filter-select" value={filter.date} onChange={(e) => setFilter(prev => ({ ...prev, date: e.target.value }))}>
                        <option value="ALL">Tất cả thời gian</option>
                        <option value="TODAY">Hôm nay</option>
                        <option value="WEEK">7 ngày gần đây</option>
                        <option value="MONTH">Tháng này</option>
                    </select>
                    <select className="filter-select" value={filter.type} onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}>
                        <option value="ALL">Mọi loại giao dịch</option>
                        <option value="TRANSFER">Chuyển khoản</option>
                        <option value="TOP_UP">Nạp tiền</option>
                        <option value="WITHDRAW">Rút tiền</option>
                    </select>
                    <select className="filter-select" value={filter.status} onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}>
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="SUCCESS">Thành công</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="FAILED">Thất bại</option>
                    </select>
                </div>
            </div>

            <div className="transaction-table-wrapper" onScroll={handleScroll} style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table className="transaction-table" style={{ width: "100%", margin: 0 }}>
                    <thead>
                    <tr>
                        <th style={{ width: "15%" }}>Mã GD</th>
                        <th style={{ width: "30%" }}>Người nhận / Nguồn</th>
                        <th style={{ width: "15%" }}>Loại</th>
                        <th style={{ width: "15%" }}>Thời gian</th>
                        <th style={{ width: "13%" }}>Trạng thái</th>
                        <th style={{ width: "12%" }}>Số tiền</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Sửa logic hiển thị loading dựa trên state chuẩn của React Query */}
                    {isLoading ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "30px" }}>
                                <div className="btn-spinner" style={{ width: "16px", height: "16px", display: "inline-block", marginRight: "8px" }} />
                                Đang tải lịch sử giao dịch...
                            </td>
                        </tr>
                    ) : transactions.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="no-data-row" style={{ textAlign: "center", padding: "30px" }}>
                                Không có giao dịch nào phù hợp.
                            </td>
                        </tr>
                    ) : (
                        transactions.map(tx => (
                            <tr key={tx.id}>
                                <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{tx.id}</td>
                                <td>
                                    <div className="recipient-cell">
                                        <div className="recipient-avatar">{(tx.recipient || "?").charAt(0).toUpperCase()}</div>
                                        <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{tx.recipient || "Hệ thống"}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                        {tx.type === "TRANSFER" && "Chuyển tiền"}
                                        {tx.type === "TOP_UP" && "Nạp ví"}
                                        {tx.type === "WITHDRAW" && "Rút ví"}
                                        {tx.type === "PAYMENT" && "Thanh toán"}
                                        {tx.type === "REFUND" && "Hoàn tiền"}
                                    </span>
                                </td>
                                <td>{tx.date}</td>
                                <td>
                                    <span className={`status-badge ${tx.status === "SUCCESS" ? "success" : tx.status === "PENDING" ? "pending" : "failed"}`}>
                                        {tx.status === "SUCCESS" && "Thành công"}
                                        {tx.status === "PENDING" && "Chờ xử lý"}
                                        {tx.status === "FAILED" && "Thất bại"}
                                        {tx.status === "CANCELLED" && "Đã hủy"}
                                    </span>
                                </td>
                                <td>
                                    <span className={`transaction-amount ${tx.direction === "IN" ? "positive" : "negative"}`}>
                                        {tx.direction === "IN" ? "+" : "-"}
                                        {formatCurrency(tx.amount)}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Loading hiển thị khi ĐANG CUỘN tải thêm dữ liệu */}
            {isFetchingNextPage && (
                <div style={{ textAlign: "center", padding: "16px 0", fontSize: "0.85rem" }}>
                    <div className="btn-spinner" style={{ width: "14px", height: "14px", display: "inline-block", marginRight: "8px", verticalAlign: "middle" }} />
                    Đang tải thêm giao dịch...
                </div>
            )}
        </div>
    );
}

export default TransactionHistoryTable;