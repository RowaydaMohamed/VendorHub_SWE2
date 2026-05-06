package com.vendorhub.gateway.filter;

import com.vendorhub.gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    /**
     * Paths accessible without any token.
     * Prefix-matched — any sub-path also matches.
     */
    private static final List<String> PUBLIC_PREFIXES = List.of(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/verify-email",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/products/public"
    );

    /**
     * Exact paths that are public only for GET (read-only public access).
     */
    private static final List<String> PUBLIC_GET_PATHS = List.of(
        "/api/categories"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path   = request.getPath().value();
        String method = request.getMethod() != null ? request.getMethod().name() : "GET";

        // Always allow CORS pre-flight
        if (HttpMethod.OPTIONS.name().equals(method)) {
            return chain.filter(exchange);
        }

        // Allow unconditionally public paths
        if (isPublic(path)) {
            return chain.filter(exchange);
        }

        // Allow GET on categories without auth (vendors/customers need the list)
        if (HttpMethod.GET.name().equals(method) && isPublicGet(path)) {
            return chain.filter(exchange);
        }

        // All other requests need a valid JWT
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("[GATEWAY] No token for {} {}", method, path);
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            log.warn("[GATEWAY] Invalid/expired token for {} {}", method, path);
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        Claims claims = jwtUtil.extractAllClaims(token);
        String role   = claims.get("role", String.class);
        String userId = claims.get("userId", String.class);
        String email  = claims.getSubject();

        // Role-based access
        if (!isAuthorized(path, method, role)) {
            log.warn("[GATEWAY] Forbidden: role={} {} {}", role, method, path);
            return reject(exchange, HttpStatus.FORBIDDEN);
        }

        // Propagate identity headers to downstream services
        ServerHttpRequest mutated = request.mutate()
            .header("X-User-Id",   userId != null ? userId : "")
            .header("X-User-Name", email  != null ? email  : "")
            .header("X-User-Role", role   != null ? role   : "")
            .build();

        return chain.filter(exchange.mutate().request(mutated).build());
    }

    private boolean isPublic(String path) {
        return PUBLIC_PREFIXES.stream().anyMatch(path::startsWith);
    }

    private boolean isPublicGet(String path) {
        return PUBLIC_GET_PATHS.stream().anyMatch(path::startsWith);
    }

    private boolean isAuthorized(String path, String method, String role) {
        if (role == null) return false;
        // Admin-only paths
        if (path.startsWith("/api/admin/")) {
            return "ROLE_ADMIN".equals(role);
        }
        // Vendor-only paths
        if (path.startsWith("/api/vendor/")) {
            return "ROLE_VENDOR".equals(role) || "ROLE_ADMIN".equals(role);
        }
        // Category POST (create) - admin only
        if (path.startsWith("/api/categories") && "POST".equals(method)) {
            return "ROLE_ADMIN".equals(role);
        }
        return true;
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }

    @Override
    public int getOrder() { return -1; }
}