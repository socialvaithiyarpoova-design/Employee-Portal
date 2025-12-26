/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 13/05/2025
 DESC: It is used save the employee data
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_SaveEmpDetails`;

CREATE PROCEDURE `SP_SaveEmpDetails`(
    IN p_emp_id VARCHAR(50),
    IN p_emp_name VARCHAR(100),
    IN p_designation VARCHAR(100),
    IN p_mobile_number VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_date_of_joining DATE,
    IN p_date_of_birth DATE,
    IN p_wed_date DATE,
    IN p_salary DECIMAL(20,2),
    IN p_incentive_percentage DECIMAL(5,2),
    IN p_address TEXT,
    IN p_created_by VARCHAR(50),
    IN p_image_url TEXT,
    IN p_des_id INT(11),
    IN p_start_time VARCHAR(20),
    IN p_end_time VARCHAR(20),
    IN p_branch_rceid INT(11)

)
BEGIN
     DECLARE v_new_user_id INT;
     INSERT INTO users (
        emp_id, name, designation, mobile_number, email,
        date_of_joining,date_of_birth,wed_date, salary, incentive_percentage, address, created_by , image_url, password , usertype_id , start_work_time , end_work_time,branch_rceid
    )
    VALUES (
        p_emp_id, p_emp_name, p_designation, p_mobile_number, p_email,
        p_date_of_joining,p_date_of_birth,p_wed_date, p_salary, p_incentive_percentage, p_address, p_created_by , p_image_url , SHA2(p_mobile_number, 256) , p_des_id ,
        p_start_time, p_end_time,p_branch_rceid
    );

   
   SET v_new_user_id = LAST_INSERT_ID();
   SELECT
        'users' AS table_name,
        'INSERT' AS method,
        v_new_user_id AS id,
        'user_id' AS id_column_name;

END//

DELIMITER ;

