import { CheckCircle, Clock, Warning, UploadSimple } from '@phosphor-icons/react'

function KycPanel({ userProfile, kycFiles, triggerKycUpload, handleKycSubmit }) {
  return (
    <div className="tab-panel">
      <div className="kyc-card">
        {userProfile.kycStatus === 'APPROVED' && (
          <div className="kyc-status-banner approved">
            <div className="kyc-banner-icon">
              <CheckCircle size={28} weight="fill" />
            </div>
            <div className="kyc-banner-content">
              <h4>Tài khoản ví đã KYC thành công</h4>
              <p>
                Thông tin của bạn đã được bộ phận thẩm định phê duyệt thành công. Hạn mức giao dịch tài khoản của bạn đã được nâng lên tối đa.
              </p>
            </div>
          </div>
        )}

        {userProfile.kycStatus === 'PENDING' && (
          <div className="kyc-status-banner pending">
            <div className="kyc-banner-icon">
              <Clock size={28} weight="bold" />
            </div>
            <div className="kyc-banner-content">
              <h4>Hồ sơ KYC đang chờ duyệt</h4>
              <p>
                Yêu cầu xác thực tài khoản của bạn đang được bộ phận quản trị viên VT Pay kiểm tra. Thời gian phản hồi thông thường trong vòng 24 giờ.
              </p>
            </div>
          </div>
        )}

        {userProfile.kycStatus === 'REJECTED' && (
          <div className="kyc-status-banner rejected">
            <div className="kyc-banner-icon">
              <Warning size={28} weight="fill" />
            </div>
            <div className="kyc-banner-content">
              <h4>Yêu cầu KYC bị từ chối</h4>
              <p>
                Hình ảnh tài liệu nhận dạng của bạn không đạt yêu cầu (mờ, mất góc hoặc không rõ mặt). Vui lòng tải lên và gửi lại hồ sơ ảnh mới.
              </p>
            </div>
          </div>
        )}

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--ink)' }}>Tải tài liệu xác thực (Simulated upload)</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 24px' }}>
          Vui lòng tải lên ảnh chụp hai mặt của Căn cước công dân và một tấm ảnh chụp chân dung chân thực của bạn.
        </p>

        <div className="upload-zone-container">
          <div className="upload-card" onClick={() => triggerKycUpload('front')}>
            {kycFiles.front ? (
              <img className="upload-preview" src={kycFiles.front} alt="Mặt trước CCCD" />
            ) : (
              <>
                <UploadSimple size={32} />
                <span>Mặt trước CCCD</span>
                <small>Định dạng JPG, PNG tối đa 5MB</small>
              </>
            )}
          </div>

          <div className="upload-card" onClick={() => triggerKycUpload('back')}>
            {kycFiles.back ? (
              <img className="upload-preview" src={kycFiles.back} alt="Mặt sau CCCD" />
            ) : (
              <>
                <UploadSimple size={32} />
                <span>Mặt sau CCCD</span>
                <small>Yêu cầu ảnh chụp rõ nét, không lóa sáng</small>
              </>
            )}
          </div>

          <div className="upload-card" onClick={() => triggerKycUpload('selfie')}>
            {kycFiles.selfie ? (
              <img className="upload-preview" src={kycFiles.selfie} alt="Selfie chân dung" />
            ) : (
              <>
                <UploadSimple size={32} />
                <span>Ảnh chân dung (Selfie)</span>
                <small>Nhìn thẳng gương mặt, không đeo kính râm</small>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="auth-btn"
            style={{ maxWidth: '240px' }}
            onClick={handleKycSubmit}
            disabled={userProfile.kycStatus === 'PENDING' || userProfile.kycStatus === 'APPROVED'}
          >
            Gửi yêu cầu phê duyệt KYC
          </button>
        </div>
      </div>
    </div>
  )
}

export default KycPanel
