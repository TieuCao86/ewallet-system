// hooks/useKeyboardShortcuts.js
import { useEffect } from 'react'

export default function useKeyboardShortcuts(setActiveTab) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!e.altKey) return
            const tabMap = {
                '1': 'overview',
                '2': 'transactions',
                '3': 'myqr',
                '4': 'history',
                '5': 'bank',
                '6': 'kyc',
                '7': 'profile'
            }
            if (tabMap[e.key]) {
                e.preventDefault()
                setActiveTab(tabMap[e.key])
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [setActiveTab])
}