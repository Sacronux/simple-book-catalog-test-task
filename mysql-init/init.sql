-- Ensure the user exists and set the password
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
ALTER USER 'user'@'%' IDENTIFIED BY 'password';

-- Grant all privileges on all databases
GRANT ALL PRIVILEGES ON *.* TO 'user'@'%' WITH GRANT OPTION;

-- Make changes effective immediately
FLUSH PRIVILEGES;