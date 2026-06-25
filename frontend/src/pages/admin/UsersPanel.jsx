import React from 'react'
import { MagnifyingGlass, Lock, LockOpen } from '@phosphor-icons/react'

export default function UsersPanel({
  users,
  searchTerm,
  setSearchTerm,
  requestPinAuthorization
}) {
  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  )

  return (
    <div>
      <div className="admin-action-bar">
        <div className="admin-search-wrapper">
          <MagnifyingGlass className="admin-search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
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
              <th>User ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>KYC Status</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--muted)' }}>Không tìm thấy người dùng nào.</td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.userId}>
                  <td><strong>#{u.userId}</strong></td>
                  <td><strong>{u.fullName}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span className={`admin-badge ${u.kycStatus.toLowerCase()}`}>
                      {u.kycStatus === 'APPROVED' && 'Đã duyệt'}
                      {u.kycStatus === 'PENDING' && 'Chờ duyệt'}
                      {u.kycStatus === 'REJECTED' && 'Từ chối'}
                      {u.kycStatus === 'NONE' && 'Chưa gửi'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${u.status.toLowerCase()}`}>
                      {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đang khóa'}
                    </span>
                  </td>
                  <td>
                    {u.status === 'ACTIVE' ? (
                      <button
                        className="table-action-btn lock"
                        onClick={() => requestPinAuthorization('LOCK_UNLOCK_USER', { userId: u.userId, status: u.status })}
                      >
                        <Lock size={14} /> Khóa tài khoản
                      </button>
                    ) : (
                      <button
                        className="table-action-btn unlock"
                        onClick={() => requestPinAuthorization('LOCK_UNLOCK_USER', { userId: u.userId, status: u.status })}
                      >
                        <LockOpen size={14} /> Mở khóa
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
