import React from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

export default function AuditLogsPanel({
  auditLogs,
  searchTerm,
  setSearchTerm
}) {
  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="admin-action-bar">
        <div className="admin-search-wrapper">
          <MagnifyingGlass className="admin-search-icon" size={18} />
          <input
            type="text"
            placeholder="Lọc hành động, tài khoản tác nhân..."
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
              <th>ID Log</th>
              <th>Hành động</th>
              <th>Tác nhân (Actor)</th>
              <th>Thời gian thực hiện</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--muted)' }}>Không tìm thấy ghi chép nhật ký nào.</td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.logId}>
                  <td><span style={{ fontFamily: 'monospace' }}>#{log.logId}</span></td>
                  <td><strong>{log.action}</strong></td>
                  <td>{log.actor}</td>
                  <td><span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{log.date}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
