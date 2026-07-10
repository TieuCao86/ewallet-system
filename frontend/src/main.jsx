import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from "./providers/AuthProvider.jsx";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // Mặc định giữ dữ liệu "tươi" trong 5 phút
            refetchOnWindowFocus: false, // Tắt tự động load lại khi click chuột ra ngoài app rồi quay lại
        },
    },
})

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </AuthProvider>
)