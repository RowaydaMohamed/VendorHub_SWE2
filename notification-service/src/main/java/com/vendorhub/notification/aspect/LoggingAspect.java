package com.vendorhub.notification.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Before("execution(* com.vendorhub.notification.service.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        log.info("[AOP] Calling: {}.{}",
            joinPoint.getTarget().getClass().getSimpleName(),
            joinPoint.getSignature().getName());
    }

    @Around("execution(* com.vendorhub.notification.controller.*.*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long duration = System.currentTimeMillis() - start;
        log.info("[AOP] {}.{} executed in {}ms",
            joinPoint.getTarget().getClass().getSimpleName(),
            joinPoint.getSignature().getName(),
            duration);
        return result;
    }

    @AfterThrowing(
        pointcut = "execution(* com.vendorhub.notification.service..*(..)) || " +
                   "execution(* com.vendorhub.notification.controller..*(..))",
        throwing  = "ex"
    )
    public void logException(JoinPoint joinPoint, Exception ex) {
        log.error("[AOP] Exception in {}.{}: {}",
            joinPoint.getTarget().getClass().getSimpleName(),
            joinPoint.getSignature().getName(),
            ex.getMessage());
    }
}