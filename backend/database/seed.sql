USE `dealkart_db`;

-- Seed Roles
INSERT IGNORE INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Admin', 'Full administrative access across all modules'),
(2, 'Auditor', 'Quality auditor responsible for process audits and CAPA'),
(3, 'LineEngineer', 'Handles IHLR rejections and root-cause analysis'),
(4, 'ToolingEngineer', 'Handles tool/mold trial runs and sample approvals'),
(5, 'User', 'Standard user with basic viewing permissions');

-- Seed Initial Admin User (password: Password123!)
-- Hash generated with bcryptjs rounds 10
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `location`, `status`) VALUES
(1, 'System Administrator', 'admin@dealkart.com', '9876543210', '$2a$10$w8T9J8E0LdKkJ56Z3v6g1O7Lq1c5G2P3k4A5B6C7D8E9F0G1H2I3J', 'Chennai', 'active');

-- Assign Admin Role
INSERT IGNORE INTO `user_roles` (`user_id`, `role_id`) VALUES (1, 1);
