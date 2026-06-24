import { Wallet, ArrowsLeftRight, ShieldCheck, User, SignOut, CreditCard } from '@phosphor-icons/react'
import '../pages/Dashboard.css' // Import style dependencies

function Sidebar({ activeTab, setActiveTab, onLogout }) {
  return (
    <aside className="dashboard-sidebar">
      <div>
        <div className="sidebar-brand">
          <img src="/VTPayLogo-Transparent.png" alt="VT Pay Logo" />
          <span>VT Pay</span>
        </div>

        <nav className="sidebar-menu">
          <div className="sidebar-category">01 / Tài chính</div>
          <button
            className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Wallet size={20} />
            <span>Tổng quan ví</span>
            <span className="sidebar-shortcut">⌘1</span>
          </button>
          <button
            className={`sidebar-item ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <ArrowsLeftRight size={20} />
            <span>Chuyển & Nhận</span>
            <span className="sidebar-shortcut">⌘2</span>
          </button>
          <button
            className={`sidebar-item ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            <CreditCard size={20} />
            <span>Liên kết ngân hàng</span>
            <span className="sidebar-shortcut">⌘3</span>
          </button>

          <div className="sidebar-category">02 / Xác thực</div>
          <button
            className={`sidebar-item ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => setActiveTab('kyc')}
          >
            <ShieldCheck size={20} />
            <span>Xác thực KYC</span>
            <span className="sidebar-shortcut">⌘4</span>
          </button>

          <div className="sidebar-category">03 / Hệ thống</div>
          <button
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            <span>Bảo mật & Cá nhân</span>
            <span className="sidebar-shortcut">⌘5</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={onLogout}>
          <SignOut size={20} />
          <span>Đăng xuất ví</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
