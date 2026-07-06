// hooks/useCountdown.js
import { useState, useEffect, useRef } from 'react'

export default function useCountdown(initialSeconds = 0, storageKey = null) {
    const [count, setCount] = useState(() => {
        if (storageKey) {
            const expiry = localStorage.getItem(storageKey)
            if (expiry) {
                const remaining = Math.ceil((parseInt(expiry, 10) - Date.now()) / 1000)
                return remaining > 0 ? remaining : 0
            }
        }
        return initialSeconds
    })

    useEffect(() => {
        if (count <= 0) {
            if (storageKey) localStorage.removeItem(storageKey)
            return
        }

        const timer = setInterval(() => {
            setCount(prev => (prev <= 1 ? 0 : prev - 1))
        }, 1000)

        return () => clearInterval(timer)
    }, [count, storageKey])

    const startCountdown = (seconds) => {
        if (storageKey) {
            const expiryTime = Date.now() + seconds * 1000
            localStorage.setItem(storageKey, expiryTime.toString())
        }
        setCount(seconds)
    }

    return [count, startCountdown]
}