// hooks/useFetchWalletData.js
import { useState, useEffect } from 'react'

export function useFetchWalletData() {
    const [userProfile, setUserProfile] = useState(null)
    const [wallet, setWallet] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [isLive, setIsLive] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Profile
                const profileRes = await fetch('/api/users/profile')
                const resProfileData = await profileRes.json()
                if (profileRes.ok && resProfileData.success && resProfileData.data) {
                    const dbUser = resProfileData.data
                    setUserProfile({
                        fullName: dbUser.fullName,
                        email: dbUser.email,
                        phone: dbUser.phone || 'Chưa cập nhật',
                        citizenId: dbUser.citizenId || 'Chưa xác thực',
                        kycStatus: dbUser.kycStatus || 'PENDING',
                        status: dbUser.status || 'ACTIVE',
                        dob: dbUser.dob || '',
                        gender: dbUser.gender || '',
                        address: dbUser.address || '',
                        vipLevel: dbUser.role === 'ADMIN' ? 'Administrator' : 'Member'
                    })
                    setIsLive(true)
                }

                // 2. Fetch Wallet
                const walletRes = await fetch('/api/wallets/balance')
                const resWalletData = await walletRes.json()
                if (walletRes.ok && resWalletData.success && resWalletData.data) {
                    setWallet({
                        balance: resWalletData.data.balance || 0,
                        walletId: resWalletData.data.walletNumber || 'Chưa cấu hình',
                        currency: 'đ'
                    })
                }

                // 3. Fetch Transactions
                const transRes = await fetch('/api/transactions/history')
                const resTransData = await transRes.json()
                if (transRes.ok && resTransData.success && Array.isArray(resTransData.data)) {
                    setTransactions(
                        resTransData.data.map(t => ({
                            id: t.transactionCode,
                            recipient: t.otherPartyName,
                            amount: Number(t.amount),
                            fee: Number(t.fee ?? 0),
                            type: t.type,
                            status: t.status,
                            direction: t.direction,
                            description: t.description,
                            date: t.createdAt ? t.createdAt.replace('T', ' ').substring(0, 19) : ''
                        }))
                    )
                }
            } catch (err) {
                console.error('Lỗi nạp dữ liệu từ Backend:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return { userProfile, setUserProfile, wallet, setWallet, transactions, setTransactions, loading, isLive }
}