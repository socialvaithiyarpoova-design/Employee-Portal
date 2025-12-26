CREATE TABLE `user_activity` (
  `lp_recid` INT NOT NULL AUTO_INCREMENT,
  `from_date` DATE NOT NULL,
  `to_date` DATE NOT NULL,
  `leave_type` VARCHAR(50) NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `from_time` TIME NOT NULL,
  `to_time` TIME NOT NULL,
  `Reason` TEXT NOT NULL,
  `user_status` ENUM('Approved', 'Declined', 'Pending') NOT NULL DEFAULT 'Pending',
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`lp_recid`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
