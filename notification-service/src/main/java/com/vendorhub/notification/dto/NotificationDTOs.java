package com.vendorhub.notification.dto;

import com.vendorhub.notification.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;

public class NotificationDTOs {

    @Data
    public static class NotificationResponse {
        private Long id;
        private Long recipientId;
        private String type;
        private String title;
        private String message;
        private Long referenceId;
        private String referenceType;
        private Boolean isRead;
        private LocalDateTime createdAt;

        public static NotificationResponse from(Notification n) {
            NotificationResponse r = new NotificationResponse();
            r.setId(n.getId());
            r.setRecipientId(n.getRecipientId());
            r.setType(n.getType().name());
            r.setTitle(n.getTitle());
            r.setMessage(n.getMessage());
            r.setReferenceId(n.getReferenceId());
            r.setReferenceType(n.getReferenceType());
            r.setIsRead(n.getIsRead());
            r.setCreatedAt(n.getCreatedAt());
            return r;
        }
    }

    @Data
    public static class UnreadCountResponse {
        private long count;
        public UnreadCountResponse(long count) { this.count = count; }
    }

    @Data
    public static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
    }
}