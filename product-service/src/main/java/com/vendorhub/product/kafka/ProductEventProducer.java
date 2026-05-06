package com.vendorhub.product.kafka;

import com.vendorhub.product.event.ProductEvents.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductEventProducer {

    private static final String PRODUCT_APPROVED_TOPIC = "product-approved";
    private static final String PRODUCT_OUT_OF_STOCK_TOPIC = "product-out-of-stock";
    private static final String STOCK_UPDATED_TOPIC = "stock-updated";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishProductApproved(ProductApprovedEvent event) {
        log.info("Publishing ProductApproved event: productId={}", event.getProductId());
        kafkaTemplate.send(PRODUCT_APPROVED_TOPIC, event.getProductId().toString(), event);
    }

    public void publishProductOutOfStock(ProductOutOfStockEvent event) {
        log.warn("Publishing ProductOutOfStock event: productId={}", event.getProductId());
        kafkaTemplate.send(PRODUCT_OUT_OF_STOCK_TOPIC, event.getProductId().toString(), event);
    }

    public void publishStockUpdated(StockUpdatedEvent event) {
        kafkaTemplate.send(STOCK_UPDATED_TOPIC, event.getProductId().toString(), event);
    }
}

@Configuration
class ProductKafkaTopicConfig {

    @Bean
    public NewTopic productApprovedTopic() {
        return TopicBuilder.name("product-approved").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic productOutOfStockTopic() {
        return TopicBuilder.name("product-out-of-stock").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic stockUpdatedTopic() {
        return TopicBuilder.name("stock-updated").partitions(3).replicas(1).build();
    }
}