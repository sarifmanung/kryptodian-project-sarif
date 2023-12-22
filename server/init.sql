DROP DATABASE IF EXISTS dcaweb_de;
CREATE DATABASE dcaweb_de CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use dcaweb_de;

CREATE TABLE `preassessment` (
    id int AUTO_INCREMENT,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    ip varchar(100),
    country varchar(100),
    reason varchar(255),
    teethtype varchar(100),
    name varchar(255),
    email varchar(150),
    phone varchar(100),
    message text,
    url text,

 
    PRIMARY KEY (id)
);

CREATE TABLE `preassessment_images` (
    id int AUTO_INCREMENT,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    preassessmentid int,
    fieldname varchar(150),
    originalname varchar(255),
    mimetype varchar(100),
    awskey varchar(150),
    awslocation varchar(255),


    PRIMARY KEY (id)
);


CREATE TABLE  `partner_apply`(
    id int AUTO_INCREMENT,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

name varchar(255),
clinic_name varchar(255),
email varchar(255),
contact_name varchar(255),
speciallty varchar(255),
preferred_contact_method varchar(255),
state varchar(255),
area varchar(255),
select_1 varchar(10), /* Do you have any experience in prescribing clear aligners? */
select_2 varchar (10),/* if No, are you open to prescribing clear aligners for your patients in future? */
year_experience int(100),
tell_us_why varchar(255),

PRIMARY KEY (id)

);

CREATE TABLE `referral` (
    id int AUTO_INCREMENT,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    name varchar(255),
    phone varchar(100),
    kolname varchar(255),

    PRIMARY KEY (id)
);

ALTER TABLE `referral`
ADD firstname varchar(255);

ALTER TABLE `referral`
ADD lastname varchar(255);

