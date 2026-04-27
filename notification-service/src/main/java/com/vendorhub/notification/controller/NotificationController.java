package com.vendorhub.notification.controller;

import com.vendorhub.notification.dto.NotificationDto;
import com.vendorhub.notification.dto.NotificationRequest;
import com.vendorhub.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getMyNotifications(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(notificationService.getMyNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(
            Map.of("count", notificationService.getUnreadCount(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id,
                                                       Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // Internal endpoint — called by other services to send notifications
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> send(
            @Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.createAndSend(request));
    }
}