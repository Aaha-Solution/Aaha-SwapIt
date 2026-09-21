-- DealKart Database Schema
CREATE DATABASE IF NOT EXISTS `dealkart_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dealkart_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `location` VARCHAR(100) DEFAULT 'Chennai',
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Roles Table
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Permissions Table
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. User Roles Pivot
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Role Permissions Pivot
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Process Audit Requests
CREATE TABLE IF NOT EXISTS `process_audit_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_number` VARCHAR(50) NOT NULL UNIQUE,
  `department` VARCHAR(100) NOT NULL,
  `audit_type` VARCHAR(100) NOT NULL,
  `auditor_id` INT NULL,
  `status` ENUM('pending', 'in_progress', 'completed', 'rejected') DEFAULT 'pending',
  `scheduled_date` DATE NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`auditor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Process Audit Observations
CREATE TABLE IF NOT EXISTS `process_audit_observations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_id` INT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `severity` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `description` TEXT NOT NULL,
  `photo_url` VARCHAR(255) NULL,
  `status` ENUM('open', 'resolved') DEFAULT 'open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`request_id`) REFERENCES `process_audit_requests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Process Audit CAPAs
CREATE TABLE IF NOT EXISTS `process_audit_capas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `observation_id` INT NOT NULL,
  `root_cause` TEXT NOT NULL,
  `corrective_action` TEXT NOT NULL,
  `preventive_action` TEXT NOT NULL,
  `assigned_to` INT NULL,
  `target_date` DATE NULL,
  `completion_date` DATE NULL,
  `status` ENUM('open', 'in_progress', 'verified', 'closed') DEFAULT 'open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`observation_id`) REFERENCES `process_audit_observations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. IHLR Line Rejections
CREATE TABLE IF NOT EXISTS `ihlr_line_rejections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `part_number` VARCHAR(100) NOT NULL,
  `part_name` VARCHAR(150) NOT NULL,
  `line_name` VARCHAR(100) NOT NULL,
  `rejection_qty` INT NOT NULL DEFAULT 1,
  `reason` TEXT NOT NULL,
  `shift` VARCHAR(20) NOT NULL DEFAULT 'Shift A',
  `reported_by` INT NULL,
  `status` ENUM('reported', 'investigating', 'action_taken', 'closed') DEFAULT 'reported',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10. IHLR Scraps
CREATE TABLE IF NOT EXISTS `ihlr_scraps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `scrap_code` VARCHAR(50) NOT NULL UNIQUE,
  `part_number` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL,
  `cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 11. IHLR Root Causes
CREATE TABLE IF NOT EXISTS `ihlr_root_causes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rejection_id` INT NOT NULL,
  `five_why_analysis` JSON NULL,
  `fishbone_category` VARCHAR(100) NULL,
  `root_cause_detail` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rejection_id`) REFERENCES `ihlr_line_rejections`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Try Out Trial Runs
CREATE TABLE IF NOT EXISTS `tryout_trial_runs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `trial_code` VARCHAR(50) NOT NULL UNIQUE,
  `tool_mold_number` VARCHAR(100) NOT NULL,
  `component_name` VARCHAR(150) NOT NULL,
  `parameters` JSON NULL,
  `result` ENUM('pass', 'fail', 'conditional') DEFAULT 'conditional',
  `status` ENUM('scheduled', 'running', 'completed', 'aborted') DEFAULT 'scheduled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 13. Try Out Pilot Batches
CREATE TABLE IF NOT EXISTS `tryout_pilot_batches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pilot_code` VARCHAR(50) NOT NULL UNIQUE,
  `trial_run_id` INT NULL,
  `batch_size` INT NOT NULL,
  `production_line` VARCHAR(100) NOT NULL,
  `yield_percentage` DECIMAL(5,2) DEFAULT 0.00,
  `status` ENUM('planned', 'in_production', 'completed') DEFAULT 'planned',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`trial_run_id`) REFERENCES `tryout_trial_runs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 14. Try Out Sample Approvals
CREATE TABLE IF NOT EXISTS `tryout_sample_approvals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sample_code` VARCHAR(50) NOT NULL UNIQUE,
  `pilot_batch_id` INT NULL,
  `customer_or_dept` VARCHAR(150) NOT NULL,
  `inspection_result` ENUM('approved', 'rejected', 'rework_needed') DEFAULT 'approved',
  `approved_by` INT NULL,
  `remarks` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pilot_batch_id`) REFERENCES `tryout_pilot_batches`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 15. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
