import React from 'react'
import { MagnifyingGlass, Check, X } from '@phosphor-icons/react'

export default function KycPanel({
  kycRequests,
  searchTerm,
  setSearchTerm,
  requestPinAuthorization,
  setZoomedImage,
  setRejectingKycId
}) {
  const filteredKyc = kycRequests.filter(k =>
    k.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.citizenId.includes(searchTerm)
  )

  return (
    <div>
      <div className="admin-action-bar">
        <div className="admin-search-wrapper">
          <MagnifyingGlass className="admin-search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm theo họ tên, CCCD..."
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
              <th>Yêu cầu</th>
              <th>Khách hàng</th>
              <th>Số CCCD</th>
              <th>Thời gian</th>
              <th>Hình ảnh giấy tờ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredKyc.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--muted)' }}>Không có yêu cầu xác thực KYC nào cần xử lý.</td>
              </tr>
            ) : (
              filteredKyc.map(k => (
                <tr key={k.kycId}>
                  <td><strong>#{k.kycId}</strong></td>
                  <td>
                    <strong>{k.fullName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>User ID: #{k.userId}</div>
                  </td>
                  <td>{k.citizenId}</td>
                  <td>{k.date}</td>
                  <td>
                    <div className="kyc-thumbnail-group">
                      <img
                        src={k.frontImage}
                        alt="Mặt trước"
                        className="kyc-thumb"
                        onClick={() => setZoomedImage({ src: k.frontImage, title: `CCCD Mặt trước - ${k.fullName}` })}
                      />
                      <img
                        src={k.backImage}
                        alt="Mặt sau"
                        className="kyc-thumb"
                        onClick={() => setZoomedImage({ src: k.backImage, title: `CCCD Mặt sau - ${k.fullName}` })}
                      />
                      <img
                        src={k.selfieImage}
                        alt="Selfie"
                        className="kyc-thumb"
                        onClick={() => setZoomedImage({ src: k.selfieImage, title: `Ảnh chân dung Selfie - ${k.fullName}` })}
                      />
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${k.status.toLowerCase()}`}>
                      {k.status === 'PENDING' ? 'Chờ duyệt' : (k.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối')}
                    </span>
                  </td>
                  <td>
                    {k.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="table-action-btn approve"
                          onClick={() => requestPinAuthorization('APPROVE_KYC', { kycId: k.kycId, userId: k.userId })}
                        >
                          <Check size={14} weight="bold" /> Duyệt
                        </button>
                        <button
                          className="table-action-btn reject"
                          onClick={() => setRejectingKycId({ kycId: k.kycId, userId: k.userId })}
                        >
                          <X size={14} weight="bold" /> Từ chối
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>Đã xử lý</span>
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
