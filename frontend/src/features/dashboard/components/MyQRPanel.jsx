import { DownloadSimple } from '@phosphor-icons/react'

function MyQRPanel({ userProfile, wallet, handleDownloadQR }) {
  return (
    <div className="tab-panel">
      <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
        <div 
          className="profile-card" 
          style={{ 
            padding: '30px', 
            borderRadius: '24px', 
            boxShadow: '0 20px 40px rgba(0, 106, 255, 0.08)',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)' }}>QR Nhận tiền của tôi</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0 0 24px', textAlign: 'center', lineHeight: 1.4 }}>
            Đưa mã này cho người chuyển để nhận tiền nhanh liên ngân hàng 24/7 qua ví VT Pay.
          </p>

          <div 
            id="myqr-card-display"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #0c4a6e 100%)',
              borderRadius: '20px',
              padding: '24px',
              color: '#ffffff',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 15px 30px rgba(0, 106, 255, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', zIndex: 1 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>VT</div>
              <strong style={{ fontSize: '1.05rem', letterSpacing: '0.5px' }}>VT Pay Receive</strong>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', display: 'grid', placeItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1, width: '220px', height: '220px', margin: '0 auto 20px' }}>
              <img 
                src="/vtpay_qr_code.jpg" 
                alt="Mã QR Nhận tiền VT Pay" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, textAlign: 'center' }}>
              <strong style={{ fontSize: '1.15rem', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{userProfile.fullName}</strong>
              <span style={{ fontSize: '0.85rem', opacity: 0.85, fontFamily: 'monospace' }}>Ví VT Pay: {wallet.walletId}</span>
            </div>
          </div>

          <button
            className="auth-btn"
            style={{ width: '100%', minHeight: '46px', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            onClick={handleDownloadQR}
          >
            <DownloadSimple size={20} weight="bold" />
            Tải hình ảnh mã QR
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyQRPanel
