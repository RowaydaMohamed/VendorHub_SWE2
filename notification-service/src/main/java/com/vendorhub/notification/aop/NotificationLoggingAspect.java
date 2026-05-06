package com.vendorhub.notification.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class NotificationLoggingAspect {

    @Pointcut("within(com.vendorhub.notification.service..*)")
    public void serviceLayer() {}

    @Around("serviceLayer()")
    public Object logServiceCall(ProceedingJoinPoint jp) throws Throwable {
        String method = jp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        log.info("[NOTIFICATION-SERVICE] >> {}", method);
        try {
            Object result = jp.proceed();
            log.info("[NOTIFICATION-SERVICE] << {} | {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("[NOTIFICATION-SERVICE] !! {} | {}: {}", method, ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }
}