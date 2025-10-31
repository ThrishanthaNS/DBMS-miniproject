DROP VIEW IF EXISTS active_bookings_summary;
DROP VIEW IF EXISTS room_revenue_summary;
DROP VIEW IF EXISTS guest_payment_history;
DROP VIEW IF EXISTS maintenance_requests_summary;
DROP VIEW IF EXISTS room_occupancy_status;

DROP TRIGGER IF EXISTS after_booking_insert;
DROP TRIGGER IF EXISTS after_booking_update;
DROP TRIGGER IF EXISTS after_payment_insert;

CREATE VIEW active_bookings_summary AS
SELECT b.booking_id, b.check_in_date, g.full_name AS guest_name, r.room_number, r.monthly_rent
FROM Bookings b
JOIN Guests g ON b.guest_id = g.guest_id
JOIN Rooms r ON b.room_id = r.room_id
WHERE b.booking_status = 'Active';

CREATE VIEW room_revenue_summary AS
SELECT r.room_number, r.room_type, SUM(p.amount_paid) AS total_revenue
FROM Rooms r
LEFT JOIN Bookings b ON r.room_id = b.room_id
LEFT JOIN Payments p ON b.booking_id = p.booking_id
GROUP BY r.room_number, r.room_type;

CREATE VIEW guest_payment_history AS
SELECT g.full_name, g.phone_number, SUM(p.amount_paid) AS total_paid
FROM Guests g
LEFT JOIN Bookings b ON g.guest_id = b.guest_id
LEFT JOIN Payments p ON b.booking_id = p.booking_id
GROUP BY g.full_name, g.phone_number;

CREATE VIEW maintenance_requests_summary AS
SELECT m.request_id, m.issue_description, m.status, r.room_number
FROM MaintenanceRequests m
JOIN Rooms r ON m.room_id = r.room_id;

CREATE VIEW room_occupancy_status AS
SELECT r.room_number, r.room_type, r.occupancy_status, COUNT(b.booking_id) AS total_bookings
FROM Rooms r
LEFT JOIN Bookings b ON r.room_id = b.room_id
GROUP BY r.room_number, r.room_type, r.occupancy_status;

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
    IF NEW.booking_status = 'Completed' OR NEW.booking_status = 'Cancelled' THEN
        UPDATE Rooms SET occupancy_status = 'Available' WHERE room_id = NEW.room_id;
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
