package com.vendorhub.auth.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorApprovedEvent {
    private Long vendorId;
    private String email;
    private String firstName;
    private String businessName;
    private boolean approved;   // true = approved, false = rejected
    private LocalDateTime processedAt;
}