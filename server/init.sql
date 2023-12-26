DROP DATABASE IF EXISTS kryptodian_app;
CREATE DATABASE kryptodian_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use kryptodian_app;

-- Create User table
CREATE TABLE `User` (
  UserID INT PRIMARY KEY,
  Username VARCHAR(255) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL,

  -- Add UNIQUE constraint
  UNIQUE (Username),
  UNIQUE (Email)
);

-- Create Cryptocurrency table
CREATE TABLE `Cryptocurrency` (
  CryptoID INT PRIMARY KEY,
  Name VARCHAR(255) NOT NULL,
  LogoURL VARCHAR(255) NOT NULL,

  -- Add UNIQUE constraint
  UNIQUE (Name)
);

-- Create Portfolio table
CREATE TABLE `Portfolio` (
  PortfolioID INT PRIMARY KEY,
  UserID INT,
  CryptoID INT,
  Quantity DECIMAL(18, 2) NOT NULL,
  PurchasePrice DECIMAL(18, 2) NOT NULL,

  FOREIGN KEY (UserID) REFERENCES User(UserID),
  FOREIGN KEY (CryptoID) REFERENCES Cryptocurrency(CryptoID),

  -- Add additional constraints
  CHECK (Quantity >= 0),
  CHECK (PurchasePrice >= 0)
);
