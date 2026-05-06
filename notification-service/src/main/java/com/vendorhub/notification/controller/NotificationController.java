package com.vendorhub.notification.controller;

import com.vendorhub.notification.dto.NotificationDTOs.*;
import com.vendorhub.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** All notifications for the logged-in user */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(notificationService.getMyNotifications(Long.parseLong(userIdStr)));
    }

    /** Unread notifications only */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(Long.parseLong(userIdStr)));
    }

    /** Badge count for navbar bell */
    @GetMapping("/unread/count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(
                new UnreadCountResponse(notificationService.getUnreadCount(Long.parseLong(userIdStr))));
    }

    /** Mark one notification as read */
    @PatchMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markOneRead(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userIdStr) {
        notificationService.markOneRead(id, Long.parseLong(userIdStr));
        return ResponseEntity.ok(new MessageResponse("Notification marked as read"));
    }

    /** Mark all as read */
    @PatchMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllRead(
            @RequestHeader("X-User-Id") String userIdStr) {
        notificationService.markAllRead(Long.parseLong(userIdStr));
        return ResponseEntity.ok(new MessageResponse("All notifications marked as read"));
    }
}