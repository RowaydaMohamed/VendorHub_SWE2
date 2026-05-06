package com.vendorhub.order.kafka;

import com.vendorhub.order.event.OrderPlacedEvent;
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
public class OrderEventProducer {

    private static final String ORDER_PLACED_TOPIC = "order-placed";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderPlaced(OrderPlacedEvent event) {
        log.info("Publishing OrderPlaced event: orderNumber={}", event.getOrderNumber());
        kafkaTemplate.send(ORDER_PLACED_TOPIC, event.getOrderNumber(), event);
    }
}

@Configuration
class OrderKafkaTopicConfig {
    @Bean
    public NewTopic orderPlacedTopic() {
        return TopicBuilder.name("order-placed").partitions(3).replicas(1).build();
    }
}