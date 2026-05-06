package com.vendorhub.auth.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    // Log all service method calls
    @Pointcut("within(com.vendorhub.auth.service..*)")
    public void serviceLayer() {}

    // Log all controller method calls
    @Pointcut("within(com.vendorhub.auth.controller..*)")
    public void controllerLayer() {}

    @Around("serviceLayer()")
    public Object logServiceCall(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        log.info("[SERVICE] >> {} | args: {}", methodName, Arrays.toString(joinPoint.getArgs()));
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long elapsed = System.currentTimeMillis() - start;
            log.info("[SERVICE] << {} | completed in {}ms", methodName, elapsed);
            return result;
        } catch (Exception e) {
            log.error("[SERVICE] !! {} | EXCEPTION: {}", methodName, e.getMessage());
            throw e;
        }
    }

    @AfterReturning(pointcut = "controllerLayer()", returning = "result")
    public void logControllerResponse(JoinPoint joinPoint, Object result) {
        log.info("[CONTROLLER] {} responded successfully", joinPoint.getSignature().toShortString());
    }

    @AfterThrowing(pointcut = "serviceLayer()", throwing = "ex")
    public void logException(JoinPoint joinPoint, Throwable ex) {
        log.error("[EXCEPTION] in {} -> {}: {}", joinPoint.getSignature().toShortString(),
                ex.getClass().getSimpleName(), ex.getMessage());
    }
}