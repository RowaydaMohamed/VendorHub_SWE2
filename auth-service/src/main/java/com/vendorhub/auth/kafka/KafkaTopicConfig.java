package com.vendorhub.auth.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic userRegisteredTopic() {
        return TopicBuilder.name("user-registered")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic vendorApprovedTopic() {
        return TopicBuilder.name("vendor-approved")
                .partitions(3)
                .replicas(1)
                .build();
    }
}