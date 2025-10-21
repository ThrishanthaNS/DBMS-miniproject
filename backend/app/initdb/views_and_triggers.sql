-- ====================================
-- VIEWS AND TRIGGERS FOR HOSTEL MANAGEMENT SYSTEM
-- ====================================

USE hostel_management_db;

DROP VIEW IF EXISTS active_bookings_summary;
DROP VIEW IF EXISTS room_revenue_summary;
DROP VIEW IF EXISTS guest_payment_history;
DROP VIEW IF EXISTS maintenance_requests_summary;
DROP VIEW IF EXISTS room_occupancy_status;

DROP TRIGGER IF EXISTS after_booking_insert;
DROP TRIGGER IF EXISTS after_booking_update;
DROP TRIGGER IF EXISTS after_payment_insert;

CREATE VIEW active_bookings_summary AS
SELECT 
    b.booking_id,
    b.check_in_date,
    b.check_out_date,
    g.guest_id,
    g.full_name AS guest_name,
    g.phone_number AS guest_phone,
    r.room_id,
    r.room_number,
    r.room_type,
    r.monthly_rent,
    b.created_at AS booking_date
FROM Bookings b
JOIN Guests g ON b.guest_id = g.guest_id
JOIN Rooms r ON b.room_id = r.room_id
WHERE b.booking_status = 'Active';

CREATE VIEW room_revenue_summary AS
SELECT 
    r.room_id,
    r.room_number,
    r.room_type,
    r.monthly_rent,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    SUM(p.amount_paid) AS total_revenue,
    AVG(p.amount_paid) AS avg_payment
FROM Rooms r
LEFT JOIN Bookings b ON r.room_id = b.room_id
LEFT JOIN Payments p ON b.booking_id = p.booking_id
GROUP BY r.room_id, r.room_number, r.room_type, r.monthly_rent
ORDER BY total_revenue DESC;

CREATE VIEW guest_payment_history AS
SELECT 
    g.guest_id,
    g.full_name,
    g.phone_number,
    g.email,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(p.payment_id) AS total_payments,
    SUM(p.amount_paid) AS total_paid,
    MAX(p.payment_date) AS last_payment_date
FROM Guests g
LEFT JOIN Bookings b ON g.guest_id = b.guest_id
LEFT JOIN Payments p ON b.booking_id = p.booking_id
GROUP BY g.guest_id, g.full_name, g.phone_number, g.email;

CREATE VIEW maintenance_requests_summary AS
SELECT 
    m.request_id,
    m.issue_description,
    m.reported_date,
    m.status,
    m.resolved_date,
    r.room_number,
    r.room_type,
    g.full_name AS reported_by,
    g.phone_number AS contact_number,
    DATEDIFF(IF(m.resolved_date IS NULL, CURDATE(), m.resolved_date), m.reported_date) AS days_open
FROM MaintenanceRequests m
JOIN Rooms r ON m.room_id = r.room_id
LEFT JOIN Guests g ON m.guest_id = g.guest_id
ORDER BY m.reported_date DESC;

CREATE VIEW room_occupancy_status AS
SELECT 
    r.room_id,
    r.room_number,
    r.room_type,
    r.monthly_rent,
    r.occupancy_status,
    COUNT(CASE WHEN b.booking_status = 'Active' THEN 1 END) AS active_bookings,
    COUNT(CASE WHEN b.booking_status = 'Completed' THEN 1 END) AS completed_bookings,
    COUNT(CASE WHEN b.booking_status = 'Cancelled' THEN 1 END) AS cancelled_bookings,
    COUNT(b.booking_id) AS total_bookings
FROM Rooms r
LEFT JOIN Bookings b ON r.room_id = b.room_id
GROUP BY r.room_id, r.room_number, r.room_type, r.monthly_rent, r.occupancy_status;

DELIMITER //
CREATE TRIGGER after_booking_insert
AFTER INSERT ON Bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'Active' THEN
        UPDATE Rooms 
        SET occupancy_status = 'Occupied' 
        WHERE room_id = NEW.room_id;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_booking_update
AFTER UPDATE ON Bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'Active' AND OLD.booking_status != 'Active' THEN
        UPDATE Rooms 
        SET occupancy_status = 'Occupied' 
        WHERE room_id = NEW.room_id;
    ELSIF (NEW.booking_status = 'Completed' OR NEW.booking_status = 'Cancelled') 
          AND OLD.booking_status = 'Active' THEN
        IF (SELECT COUNT(*) FROM Bookings 
            WHERE room_id = NEW.room_id 
            AND booking_status = 'Active' 
            AND booking_id != NEW.booking_id) = 0 THEN
            UPDATE Rooms 
            SET occupancy_status = 'Available' 
            WHERE room_id = NEW.room_id;
        END IF;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_payment_insert
AFTER INSERT ON Payments
FOR EACH ROW
BEGIN
    SET @last_payment_id = NEW.payment_id;
END//
DELIMITER ;

SHOW FULL TABLES WHERE Table_type = 'VIEW';
SHOW TRIGGERS;
