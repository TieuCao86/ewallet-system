import React from 'react'
import { MagnifyingGlass, Lock, LockOpen } from '@phosphor-icons/react'

export default function WalletsPanel({
  wallets,
  users,
  searchTerm,
  setSearchTerm,
  requestPinAuthorization
}) {
  const filteredWallets = wallets.filter(w => {
    const owner = users.find(u => u.userId === w.userId)
    const nameMatch = owner ? owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) : false
    return w.walletId.toString().includes(searchTerm) || nameMatch
  })

  return (
    <div>
      <div className="admin-action-bar">
        <div className="admin-search-wrapper">
          <MagnifyingGlass className="admin-search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm theo ID ví, họ tên chủ ví..."
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Số Ví</th>
              <th>Chủ sở hữu</th>
              <th>Số dư khả dụng</th>
              <th>Loại tiền</th>
              <th>Trạng thái ví</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredWallets.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)' }}>Không tìm thấy ví nào.</td>
              </tr>
            ) : (
              filteredWallets.map(w => {
                const owner = users.find(u => u.userId === w.userId)
                return (
                  <tr key={w.walletId}>
                    <td><strong>{w.walletId}</strong></td>
                    <td>
                      <strong>{owner ? owner.fullName : 'Không rõ'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>ID: #{w.userId}</div>
                    </td>
                    <td><strong style={{ fontSize: '1rem' }}>{w.balance.toLocaleString()}đ</strong></td>
                    <td>VND</td>
                    <td>
                      <span className={`admin-badge ${w.status === 'ACTIVE' ? 'active' : 'frozen'}`}>
                        {w.status === 'ACTIVE' ? 'Hoạt động' : 'Đóng băng'}
                      </span>
                    </td>
                    <td>
                      {w.status === 'ACTIVE' ? (
                        <button
                          className="table-action-btn freeze"
                          onClick={() => requestPinAuthorization('FREEZE_UNFREEZE_WALLET', { walletId: w.walletId, status: w.status })}
                        >
                          <Lock size={14} /> Đóng băng ví
                        </button>
                      ) : (
                        <button
                          className="table-action-btn unfreeze"
                          onClick={() => requestPinAuthorization('FREEZE_UNFREEZE_WALLET', { walletId: w.walletId, status: w.status })}
                        >
                          <LockOpen size={14} /> Mở đóng băng
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
