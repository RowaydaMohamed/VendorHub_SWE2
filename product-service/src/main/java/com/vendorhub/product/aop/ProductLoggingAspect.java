package com.vendorhub.product.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class ProductLoggingAspect {

    @Pointcut("within(com.vendorhub.product.service..*)")
    public void serviceLayer() {}

    @Around("serviceLayer()")
    public Object logServiceCall(ProceedingJoinPoint jp) throws Throwable {
        String method = jp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        log.info("[PRODUCT-SERVICE] >> {}", method);
        try {
            Object result = jp.proceed();
            log.info("[PRODUCT-SERVICE] << {} | {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("[PRODUCT-SERVICE] !! {} | {}: {}", method, ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }
}