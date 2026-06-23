import './App.css'

const features = [
  {
    title: 'Chuyển tiền tức thì',
    body: 'Gửi tiền bằng số điện thoại, mã QR hoặc danh bạ nội bộ trong vài giây.',
    stat: '24/7',
    art: 'transfer',
  },
  {
    title: 'Quản lý chi tiêu',
    body: 'Tự động gom giao dịch thành nhóm để bạn thấy dòng tiền mỗi ngày.',
    stat: '6 nhóm',
    art: 'spending',
  },
  {
    title: 'Thanh toán QR',
    body: 'Quét QR tại cửa hàng, nhà hàng, dịch vụ online và nhận biên lai ngay.',
    stat: '1 chạm',
    art: 'qr',
  },
  {
    title: 'Bảo mật nhiều lớp',
    body: 'PIN, sinh trắc học, cảnh báo giao dịch lạ và khóa ví khẩn cấp.',
    stat: 'AES',
    art: 'secure',
  },
]

const steps = [
  { label: 'Nạp tiền', art: 'wallet' },
  { label: 'Quét QR', art: 'scan' },
  { label: 'Xác nhận', art: 'confirm' },
  { label: 'Nhận biên lai', art: 'receipt' },
]

const securityItems = [
  {
    title: 'Sinh trắc học',
    body: 'Xác thực bằng khuôn mặt hoặc vân tay.',
    art: 'biometric',
  },
  {
    title: 'Cảnh báo realtime',
    body: 'Thông báo đẩy khi có thay đổi số dư.',
    art: 'alert',
  },
  {
    title: 'Khóa ví khẩn cấp',
    body: 'Chặn giao dịch mới chỉ trong một thao tác.',
    art: 'lock',
  },
]

function SvgArt({ type }) {
  return (
    <svg className={`svg-art svg-art-${type}`} viewBox="0 0 120 120" role="img" aria-label="">
      <defs>
        <linearGradient id={`grad-${type}`} x1="18" y1="18" x2="104" y2="104">
          <stop stopColor="#006aff" />
          <stop offset="1" stopColor="#27c8ff" />
        </linearGradient>
      </defs>
      <rect className="svg-tile" x="10" y="10" width="100" height="100" rx="28" />
      {type === 'transfer' && (
        <>
          <path className="svg-line" d="M34 45h44" />
          <path className="svg-line" d="M68 35l12 10-12 10" />
          <path className="svg-line" d="M86 75H42" />
          <path className="svg-line" d="M52 65 40 75l12 10" />
          <circle className="svg-dot" cx="30" cy="45" r="6" />
          <circle className="svg-dot" cx="90" cy="75" r="6" />
        </>
      )}
      {type === 'spending' && (
        <>
          <path className="svg-line" d="M34 80V58" />
          <path className="svg-line" d="M54 80V42" />
          <path className="svg-line" d="M74 80V52" />
          <path className="svg-line" d="M94 80V30" />
          <path className="svg-line" d="M28 84h72" />
          <circle className="svg-dot" cx="94" cy="30" r="6" />
        </>
      )}
      {type === 'qr' || type === 'scan' ? (
        <>
          <path className="svg-line" d="M32 32h22v22H32zM66 32h22v22H66zM32 66h22v22H32z" />
          <path className="svg-line" d="M66 68h8v8h14v12H66z" />
          <path className="svg-line" d="M24 60h72" />
        </>
      ) : null}
      {type === 'secure' && (
        <>
          <path className="svg-fill" d="M60 25 90 38v20c0 20-12 34-30 42-18-8-30-22-30-42V38l30-13Z" />
          <path className="svg-cut" d="m48 60 8 8 18-20" />
        </>
      )}
      {type === 'wallet' && (
        <>
          <path className="svg-fill" d="M28 42h60a10 10 0 0 1 10 10v34H28a10 10 0 0 1-10-10V52a10 10 0 0 1 10-10Z" />
          <path className="svg-line svg-light" d="M76 62h22v18H76a9 9 0 0 1 0-18Z" />
          <circle className="svg-dot svg-dot-light" cx="82" cy="71" r="4" />
        </>
      )}
      {type === 'confirm' && (
        <>
          <circle className="svg-fill" cx="60" cy="60" r="34" />
          <path className="svg-cut" d="m43 60 12 12 25-28" />
        </>
      )}
      {type === 'receipt' && (
        <>
          <path className="svg-fill" d="M36 26h48v68l-8-5-8 5-8-5-8 5-8-5-8 5V26Z" />
          <path className="svg-line svg-light" d="M48 46h24M48 60h24M48 74h16" />
        </>
      )}
      {type === 'biometric' && (
        <>
          <path className="svg-line" d="M42 68c0-18 8-28 20-28s20 10 20 28" />
          <path className="svg-line" d="M52 74c0-16 4-24 10-24s10 8 10 24" />
          <path className="svg-line" d="M62 56v28" />
          <circle className="svg-dot" cx="62" cy="36" r="5" />
        </>
      )}
      {type === 'alert' && (
        <>
          <path className="svg-fill" d="M60 24 96 88H24L60 24Z" />
          <path className="svg-cut" d="M60 48v18" />
          <circle className="svg-dot svg-dot-light" cx="60" cy="78" r="4" />
        </>
      )}
      {type === 'lock' && (
        <>
          <rect className="svg-fill" x="32" y="52" width="56" height="42" rx="14" />
          <path className="svg-line" d="M44 52V42a16 16 0 0 1 32 0v10" />
          <path className="svg-cut" d="M60 68v12" />
        </>
      )}
    </svg>
  )
}

function App() {
  return (
    <main className="site-shell">
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="VT Pay home">
          <img src="/VTPayLogo-Transparent.png" alt="" />
        </a>
        <div className="nav-links">
          <a href="#features">Tính năng</a>
          <a href="#security">Bảo mật</a>
          <a href="#download">Tải app</a>
        </div>
        <a className="nav-cta" href="#download">Mở tài khoản</a>
      </nav>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Pay Smart. Live Easy.</p>
          <h1>Ví điện tử cho mỗi ngày.</h1>
          <p className="hero-text">
            VT Pay gom chuyển tiền, thanh toán QR, theo dõi chi tiêu và bảo mật
            trong một trải nghiệm nhanh, rõ, dễ tin.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#download">Tải VT Pay</a>
            <a className="secondary-button" href="#features">Xem tính năng</a>
          </div>
        </div>

        <div className="hero-visual" aria-label="VT Pay mobile wallet preview">
          <div className="phone">
            <div className="phone-top">
              <span>VT Pay</span>
              <strong>42.800.000đ</strong>
            </div>
            <div className="quick-row">
              <span>Gửi</span>
              <span>QR</span>
              <span>Nạp</span>
            </div>
            <div className="card-balance">
              <span>Hôm nay</span>
              <strong>+1.240.000đ</strong>
              <small>5 giao dịch đã xác thực</small>
            </div>
            <div className="transaction-list">
              <div><span>Coffee Lab</span><strong>-48.000đ</strong></div>
              <div><span>Hoàng Anh</span><strong>+500.000đ</strong></div>
              <div><span>Tiền điện</span><strong>-320.000đ</strong></div>
            </div>
          </div>
          <div className="qr-card">
            <span>Quét để trả</span>
            <div className="qr-grid" aria-hidden="true">
              {Array.from({ length: 25 }).map((_, index) => (
                <i key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="VT Pay highlights">
        <div><strong>0đ</strong><span>phí chuyển tiền nội bộ</span></div>
        <div><strong>3s</strong><span>xử lý giao dịch trung bình</span></div>
        <div><strong>99.9%</strong><span>sẵn sàng cho thanh toán hằng ngày</span></div>
      </section>

      <section className="feature-section" id="features">
        <div className="section-heading">
          <p className="eyebrow">Tài chính trong tầm tay</p>
          <h2>Một ứng dụng cho tiền vào, tiền ra và sự yên tâm.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className={`feature-card feature-${index + 1}`} key={feature.title}>
              <div className="card-topline">
                <span>{feature.stat}</span>
                <SvgArt type={feature.art} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flow-section">
        <div className="flow-panel">
          <h2>Thanh toán nhanh mà vẫn có cảm giác kiểm soát.</h2>
          <p>
            Mỗi bước được thiết kế ngắn gọn, trạng thái rõ ràng và có xác nhận
            trước khi tiền rời khỏi ví.
          </p>
        </div>
        <div className="steps" aria-label="Payment flow">
          {steps.map((step, index) => (
            <div className="step" key={step.label}>
              <SvgArt type={step.art} />
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step.label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="security-section" id="security">
        <div className="security-copy">
          <p className="eyebrow">Bảo mật mặc định</p>
          <h2>Khi có dấu hiệu bất thường, ví dừng lại trước bạn.</h2>
          <p>
            VT Pay đánh dấu giao dịch lạ, giới hạn rút tiền theo ngưỡng và cho
            phép khóa ví ngay trên thiết bị đăng nhập.
          </p>
        </div>
        <div className="security-list">
          {securityItems.map((item) => (
            <div key={item.title}>
              <SvgArt type={item.art} />
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="download-section" id="download">
        <div>
          <h2>Sẵn sàng để VT Pay đi cùng bạn mỗi ngày?</h2>
          <p>Tải app, tạo ví và bắt đầu thanh toán thông minh hơn.</p>
        </div>
        <a className="primary-button" href="mailto:hello@vtpay.local">Đăng ký trải nghiệm</a>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <a className="brand" href="#top" aria-label="VT Pay home">
            <img src="/VTPayLogo-Transparent.png" alt="" />
            <span>VT Pay</span>
          </a>
          <p>Ví điện tử giúp bạn thanh toán, chuyển tiền và theo dõi chi tiêu rõ ràng hơn mỗi ngày.</p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Sản phẩm</strong>
            <a href="#features">Tính năng</a>
            <a href="#security">Bảo mật</a>
            <a href="#download">Tải ứng dụng</a>
          </div>
          <div>
            <strong>Hỗ trợ</strong>
            <a href="mailto:hello@vtpay.local">Liên hệ</a>
            <a href="#top">Trung tâm trợ giúp</a>
            <a href="#top">Câu hỏi thường gặp</a>
          </div>
          <div>
            <strong>Pháp lý</strong>
            <a href="#top">Điều khoản</a>
            <a href="#top">Quyền riêng tư</a>
            <a href="#top">Biểu phí</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 VT Pay. All rights reserved.</span>
          <span>Pay Smart. Live Easy.</span>
        </div>
      </footer>
    </main>
  )
}

export default App
