package com.ewallet.security.filter;

import com.ewallet.security.jwt.JwtService;
import com.ewallet.security.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Log phục vụ debug khi gọi từ Frontend
        System.out.println("===== [VT Pay] JWT FILTER =====");
        System.out.println("Request URI: " + request.getRequestURI());

        Cookie[] cookies = request.getCookies();
        String token = null;
        String username = null;

        // 1. Trích xuất token từ danh sách Cookies
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    System.out.println("Found access_token in Cookie!");
                    break;
                }
            }
        }

        // 2. Trích xuất username từ JWT Token nhận được
        if (token != null) {
            try {
                username = jwtService.extractUsername(token);
            } catch (Exception e) {
                System.out.println("Token không hợp lệ hoặc đã hết hạn: " + e.getMessage());
            }
        }

        // 3. Tiến hành xác thực nếu có username và chưa tồn tại phiên đăng nhập trong SecurityContext
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Kiểm tra tính hợp lệ của token (Nếu hàm của bạn chỉ cần truyền token thì giữ nguyên,
            // còn nếu hàm yêu cầu truyền cả userDetails thì sửa thành: jwtService.isTokenValid(token, userDetails))
            if (jwtService.isTokenValid(token)) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("Xác thực thành công cho user: " + username);
            }
        }

        filterChain.doFilter(request, response);
    }
}