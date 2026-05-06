package com.vendorhub.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service")
public interface ProductServiceClient {

    @PostMapping("/api/admin/products/internal/{id}/reduce-stock")
    void reduceStock(@PathVariable Long id, @RequestParam int quantity);
}