DROP TABLE IF EXISTS users;

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile_number` VARCHAR(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `usertype_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile_number_UNIQUE` (`mobile_number`),
  KEY `usertype_id` (`usertype_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`usertype_id`) REFERENCES `usertype` (`usertype_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO users (name, email, mobile_number, password, usertype_id)
VALUES 
    ('Hariaran', 'hariharan@neuronestai.in', 8220262762, SHA2('password123', 256) , 1)