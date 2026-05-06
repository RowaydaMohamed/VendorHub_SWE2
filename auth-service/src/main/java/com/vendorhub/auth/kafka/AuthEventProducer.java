package com.vendorhub.auth.kafka;

import com.vendorhub.auth.event.UserRegisteredEvent;
import com.vendorhub.auth.event.VendorApprovedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthEventProducer {

    private static final String USER_REGISTERED_TOPIC = "user-registered";
    private static final String VENDOR_APPROVED_TOPIC = "vendor-approved";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRegistered(UserRegisteredEvent event) {
        log.info("Publishing UserRegistered event for: {}", event.getEmail());
        kafkaTemplate.send(USER_REGISTERED_TOPIC, event.getUserId().toString(), event);
    }

    public void publishVendorApproved(VendorApprovedEvent event) {
        log.info("Publishing VendorApproved event for vendor: {}", event.getVendorId());
        kafkaTemplate.send(VENDOR_APPROVED_TOPIC, event.getVendorId().toString(), event);
    }
}