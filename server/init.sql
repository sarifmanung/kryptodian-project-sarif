DROP DATABASE IF EXISTS kryptodian_app;
CREATE DATABASE kryptodian_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use kryptodian_app;

-- Create User table
CREATE TABLE `Users` (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone varchar(100),

  -- Add UNIQUE constraint
  UNIQUE (username)
);

-- Create Cryptocurrency table
CREATE TABLE `Cryptocurrency` (
  crypto_id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(255) NOT NULL,
  LogoURL VARCHAR(255) NOT NULL,

  -- Add UNIQUE constraint
  UNIQUE (Name)
);

-- Create Portfolio table
CREATE TABLE `Portfolio` (
  `portfolio_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `crypto_id` INT,
  `quantity` DECIMAL(18, 2) NOT NULL,
  `purchase_price` DECIMAL(18, 2) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`),
  FOREIGN KEY (`crypto_id`) REFERENCES `Cryptocurrency`(`crypto_id`)
);

-- Create trigger for quantity constraint
DELIMITER //

CREATE TRIGGER check_portfolio_quantity
BEFORE INSERT ON Portfolio
FOR EACH ROW
BEGIN
   IF NEW.quantity < 0 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Quantity must be greater than or equal to 0';
   END IF;
END//

DELIMITER ;

-- Create trigger for purchase_price constraint
DELIMITER //

CREATE TRIGGER check_portfolio_purchase_price
BEFORE INSERT ON Portfolio
FOR EACH ROW
BEGIN
   IF NEW.purchase_price < 0 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Purchase price must be greater than or equal to 0';
   END IF;
END//

DELIMITER ;

