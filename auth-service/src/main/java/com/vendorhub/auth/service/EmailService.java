package com.vendorhub.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.email.from}")
    private String fromEmail;

    @Async
    public void sendEmailVerification(String toEmail, String firstName, String token) {
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;
        String subject = "VendorHub — Verify Your Email";
        String body = String.format(
            "Hi %s,\n\n" +
            "Welcome to VendorHub! Please verify your email address by clicking the link below:\n\n" +
            "%s\n\n" +
            "This link expires in 24 hours.\n\n" +
            "If you did not create an account, please ignore this email.\n\n" +
            "— The VendorHub Team",
            firstName, verifyUrl
        );
        send(toEmail, subject, body);
    }

    @Async
    public void sendVendorApprovalNotification(String toEmail, String firstName, String businessName, boolean approved) {
        String subject = approved
            ? "VendorHub — Your Vendor Account Has Been Approved!"
            : "VendorHub — Vendor Application Update";

        String body = approved
            ? String.format(
                "Hi %s,\n\n" +
                "Great news! Your vendor account for \"%s\" has been approved by our admin team.\n\n" +
                "You can now log in and start adding your products to VendorHub.\n\n" +
                "Login here: %s/login\n\n" +
                "— The VendorHub Team",
                firstName, businessName, frontendUrl
              )
            : String.format(
                "Hi %s,\n\n" +
                "We regret to inform you that your vendor application for \"%s\" has not been approved at this time.\n\n" +
                "If you believe this is a mistake, please contact our support team.\n\n" +
                "— The VendorHub Team",
                firstName, businessName
              );

        send(toEmail, subject, body);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String firstName, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String subject = "VendorHub — Password Reset Request";
        String body = String.format(
            "Hi %s,\n\n" +
            "We received a request to reset your password. Click the link below to set a new password:\n\n" +
            "%s\n\n" +
            "This link expires in 1 hour.\n\n" +
            "If you did not request a password reset, please ignore this email.\n\n" +
            "— The VendorHub Team",
            firstName, resetUrl
        );
        send(toEmail, subject, body);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        String subject = "Welcome to VendorHub!";
        String body = String.format(
            "Hi %s,\n\n" +
            "Your email has been verified and your account is ready to use!\n\n" +
            "Start shopping at: %s\n\n" +
            "— The VendorHub Team",
            firstName, frontendUrl
        );
        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}