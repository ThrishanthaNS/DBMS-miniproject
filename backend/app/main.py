import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'hostel_management_db')
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        # In a real app, you might want to handle this more gracefully
        raise HTTPException(status_code=500, detail="Database connection failed")

def setup_database():
    db_name = DB_CONFIG['database']
    temp_config = DB_CONFIG.copy()
    temp_config.pop('database', None)

    try:
        conn = mysql.connector.connect(**temp_config)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
        cursor.close()
        conn.close()

        # Connect to the specific database to create tables
        conn = get_db_connection()
        cursor = conn.cursor()

        # SQL statements to create tables
        table_creation_queries = [
            """
            CREATE TABLE IF NOT EXISTS Guests (
                guest_id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                phone_number VARCHAR(15) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE,
                id_proof_type VARCHAR(50),
                id_proof_number VARCHAR(50) UNIQUE,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS Rooms (
                room_id INT AUTO_INCREMENT PRIMARY KEY,
                room_number VARCHAR(10) UNIQUE NOT NULL,
                room_type VARCHAR(50) NOT NULL,
                monthly_rent DECIMAL(10,2) NOT NULL,
                occupancy_status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS Bookings (
                booking_id INT AUTO_INCREMENT PRIMARY KEY,
                guest_id INT NOT NULL,
                room_id INT NOT NULL,
                check_in_date DATE NOT NULL,
                check_out_date DATE,
                booking_status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guest_id) REFERENCES Guests(guest_id) ON DELETE CASCADE,
                FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS Payments (
                payment_id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                amount_paid DECIMAL(10,2) NOT NULL,
                payment_date DATE NOT NULL,
                payment_method ENUM('Cash', 'UPI', 'Card', 'Bank Transfer') NOT NULL,
                remarks VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('Admin', 'Staff') DEFAULT 'Staff',
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS MaintenanceRequests (
                request_id INT AUTO_INCREMENT PRIMARY KEY,
                room_id INT NOT NULL,
                guest_id INT,
                issue_description TEXT NOT NULL,
                reported_date DATE NOT NULL DEFAULT (CURRENT_DATE),
                status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
                resolved_date DATE,
                FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
                FOREIGN KEY (guest_id) REFERENCES Guests(guest_id) ON DELETE SET NULL
            );
            """
        ]

        for query in table_creation_queries:
            cursor.execute(query)

        conn.commit()
        cursor.close()
        conn.close()
        print("Database and tables are set up successfully.")

    except Error as e:
        print(f"Failed to set up database: {e}")
        raise

app = FastAPI(title="Hostel Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RoomStatus(str, Enum):
    AVAILABLE = 'Available'
    OCCUPIED = 'Occupied'
    MAINTENANCE = 'Maintenance'

class BookingStatus(str, Enum):
    ACTIVE = 'Active'
    COMPLETED = 'Completed'
    CANCELLED = 'Cancelled'

class PaymentMethod(str, Enum):
    CASH = 'Cash'
    UPI = 'UPI'
    CARD = 'Card'
    BANK_TRANSFER = 'Bank Transfer'

class MaintenanceStatus(str, Enum):
    PENDING = 'Pending'
    IN_PROGRESS = 'In Progress'
    RESOLVED = 'Resolved'

class GuestBase(BaseModel):
    full_name: str
    phone_number: str
    email: Optional[str] = None
    id_proof_type: Optional[str] = None
    id_proof_number: Optional[str] = None
    address: Optional[str] = None

class GuestCreate(GuestBase):
    pass

class Guest(GuestBase):
    guest_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    room_number: str
    room_type: str
    monthly_rent: Decimal = Field(..., gt=0)
    occupancy_status: RoomStatus = RoomStatus.AVAILABLE

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    room_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    guest_id: int
    room_id: int
    check_in_date: date
    check_out_date: Optional[date] = None
    booking_status: BookingStatus = BookingStatus.ACTIVE

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    booking_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    booking_id: int
    amount_paid: Decimal = Field(..., gt=0)
    payment_date: date
    payment_method: PaymentMethod
    remarks: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    payment_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MaintenanceRequestBase(BaseModel):
    room_id: int
    guest_id: Optional[int] = None
    issue_description: str
    reported_date: date
    status: MaintenanceStatus = MaintenanceStatus.PENDING
    resolved_date: Optional[date] = None

class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass

class MaintenanceRequest(MaintenanceRequestBase):
    request_id: int

    class Config:
        from_attributes = True

@app.get("/")
def read_root():
    return {"message": "Welcome to the Hostel Management API"}

@app.get("/api/guests", response_model=List[Guest])
def get_all_guests(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Guests")
    guests = cursor.fetchall()
    cursor.close()
    conn.close()
    return guests

@app.post("/api/guests", response_model=Guest, status_code=201)
def create_guest(guest: GuestCreate, conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
        INSERT INTO Guests (full_name, phone_number, email, id_proof_type, id_proof_number, address)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            guest.full_name, guest.phone_number, guest.email,
            guest.id_proof_type, guest.id_proof_number, guest.address
        ))
        conn.commit()
        guest_id = cursor.lastrowid
        cursor.execute("SELECT * FROM Guests WHERE guest_id = %s", (guest_id,))
        new_guest = cursor.fetchone()
        return new_guest
    except mysql.connector.IntegrityError as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create guest. Check unique constraints: {e}")
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/guests/{guest_id}")
def delete_guest(guest_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Guests WHERE guest_id = %s", (guest_id,))
        guest = cursor.fetchone()
        if not guest:
            raise HTTPException(status_code=404, detail=f"Guest with id {guest_id} not found.")
        
        cursor.execute("SELECT COUNT(*) as count FROM Bookings WHERE guest_id = %s AND booking_status = 'Active'", (guest_id,))
        result = cursor.fetchone()
        if result['count'] > 0:
            raise HTTPException(status_code=400, detail="Cannot delete guest with active bookings.")
        
        cursor.execute("DELETE FROM Guests WHERE guest_id = %s", (guest_id,))
        conn.commit()
        return {"message": f"Guest {guest_id} deleted successfully"}
    finally:
        cursor.close()
        conn.close()

@app.get("/api/rooms", response_model=List[Room])
def get_all_rooms(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Rooms")
    rooms = cursor.fetchall()
    cursor.close()
    conn.close()
    return rooms

@app.post("/api/rooms", response_model=Room, status_code=201)
def create_room(room: RoomCreate, conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
        INSERT INTO Rooms (room_number, room_type, monthly_rent, occupancy_status)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (
            room.room_number, room.room_type, room.monthly_rent, room.occupancy_status.value
        ))
        conn.commit()
        room_id = cursor.lastrowid
        cursor.execute("SELECT * FROM Rooms WHERE room_id = %s", (room_id,))
        new_room = cursor.fetchone()
        return new_room
    except mysql.connector.IntegrityError as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create room. Room number may already exist: {e}")
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/rooms/{room_id}")
def delete_room(room_id: int, conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Rooms WHERE room_id = %s", (room_id,))
        room = cursor.fetchone()
        if not room:
            raise HTTPException(status_code=404, detail=f"Room with id {room_id} not found.")
        
        cursor.execute("SELECT COUNT(*) as count FROM Bookings WHERE room_id = %s AND booking_status = 'Active'", (room_id,))
        result = cursor.fetchone()
        if result['count'] > 0:
            raise HTTPException(status_code=400, detail="Cannot delete room with active bookings.")
        
        cursor.execute("DELETE FROM Rooms WHERE room_id = %s", (room_id,))
        conn.commit()
        return {"message": f"Room {room_id} deleted successfully"}
    finally:
        cursor.close()
        conn.close()

@app.get("/api/bookings", response_model=List[Booking])
def get_all_bookings(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Bookings")
    bookings = cursor.fetchall()
    cursor.close()
    conn.close()
    return bookings

@app.post("/api/bookings", response_model=Booking, status_code=201)
def create_booking(booking: BookingCreate, conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if room is available
        cursor.execute("SELECT occupancy_status FROM Rooms WHERE room_id = %s FOR UPDATE", (booking.room_id,))
        room = cursor.fetchone()
        if not room:
            raise HTTPException(status_code=404, detail=f"Room with id {booking.room_id} not found.")
        if room['occupancy_status'] != 'Available':
            raise HTTPException(status_code=409, detail=f"Room {booking.room_id} is not available.")
            
        # Create booking
        sql = """
        INSERT INTO Bookings (guest_id, room_id, check_in_date, check_out_date, booking_status)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            booking.guest_id, booking.room_id, booking.check_in_date,
            booking.check_out_date, booking.booking_status.value
        ))
        
        # Update room status to Occupied
        cursor.execute("UPDATE Rooms SET occupancy_status = 'Occupied' WHERE room_id = %s", (booking.room_id,))

        conn.commit()
        booking_id = cursor.lastrowid
        
        cursor.execute("SELECT * FROM Bookings WHERE booking_id = %s", (booking_id,))
        new_booking = cursor.fetchone()
        return new_booking

    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

@app.patch("/api/bookings/{booking_id}")
def update_booking_status(
    booking_id: int,
    booking_status: BookingStatus,
    conn=Depends(get_db_connection)
):
    """Update booking status and automatically update room occupancy status."""
    cursor = conn.cursor(dictionary=True)
    try:
        # Get the booking details
        cursor.execute("SELECT * FROM Bookings WHERE booking_id = %s", (booking_id,))
        booking = cursor.fetchone()
        if not booking:
            raise HTTPException(status_code=404, detail=f"Booking with id {booking_id} not found.")
        
        room_id = booking['room_id']
        old_status = booking['booking_status']
        
        # Update booking status
        cursor.execute(
            "UPDATE Bookings SET booking_status = %s WHERE booking_id = %s",
            (booking_status.value, booking_id)
        )
        
        # Update room occupancy based on new booking status
        if booking_status in ['Completed', 'Cancelled']:
            # Check if there are any other active bookings for this room
            cursor.execute(
                "SELECT COUNT(*) as count FROM Bookings WHERE room_id = %s AND booking_status = 'Active' AND booking_id != %s",
                (room_id, booking_id)
            )
            result = cursor.fetchone()
            
            # If no other active bookings, set room to Available
            if result['count'] == 0:
                cursor.execute(
                    "UPDATE Rooms SET occupancy_status = 'Available' WHERE room_id = %s",
                    (room_id,)
                )
        elif booking_status == 'Active':
            # Set room to Occupied when booking becomes active
            cursor.execute(
                "UPDATE Rooms SET occupancy_status = 'Occupied' WHERE room_id = %s",
                (room_id,)
            )
        
        conn.commit()
        
        # Fetch and return updated booking
        cursor.execute("SELECT * FROM Bookings WHERE booking_id = %s", (booking_id,))
        updated_booking = cursor.fetchone()
        return updated_booking
        
    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

@app.post("/api/bookings/sync-room-status")
def sync_room_occupancy_status(conn=Depends(get_db_connection)):
    """Synchronize room occupancy status based on active bookings."""
    cursor = conn.cursor(dictionary=True)
    try:
        # Get all rooms
        cursor.execute("SELECT room_id, occupancy_status FROM Rooms WHERE occupancy_status != 'Maintenance'")
        rooms = cursor.fetchall()
        
        updated_count = 0
        
        for room in rooms:
            room_id = room['room_id']
            current_status = room['occupancy_status']
            
            # Check if room has any active bookings
            cursor.execute(
                "SELECT COUNT(*) as count FROM Bookings WHERE room_id = %s AND booking_status = 'Active'",
                (room_id,)
            )
            result = cursor.fetchone()
            active_bookings = result['count']
            
            # Determine correct status
            correct_status = 'Occupied' if active_bookings > 0 else 'Available'
            
            # Update if status is incorrect
            if current_status != correct_status:
                cursor.execute(
                    "UPDATE Rooms SET occupancy_status = %s WHERE room_id = %s",
                    (correct_status, room_id)
                )
                updated_count += 1
        
        conn.commit()
        
        return {
            "message": "Room occupancy status synchronized successfully",
            "rooms_updated": updated_count
        }
        
    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

@app.get("/api/payments", response_model=List[Payment])
def get_all_payments(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Payments ORDER BY payment_date DESC")
    payments = cursor.fetchall()
    cursor.close()
    conn.close()
    return payments

@app.post("/api/payments", response_model=Payment, status_code=201)
def create_payment(payment: PaymentCreate, conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if booking exists
        cursor.execute("SELECT booking_id FROM Bookings WHERE booking_id = %s", (payment.booking_id,))
        booking = cursor.fetchone()
        if not booking:
            raise HTTPException(status_code=404, detail=f"Booking with id {payment.booking_id} not found.")
        
        # Create payment
        sql = """
        INSERT INTO Payments (booking_id, amount_paid, payment_date, payment_method, remarks)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            payment.booking_id, payment.amount_paid, payment.payment_date,
            payment.payment_method.value, payment.remarks
        ))
        
        conn.commit()
        payment_id = cursor.lastrowid
        
        cursor.execute("SELECT * FROM Payments WHERE payment_id = %s", (payment_id,))
        new_payment = cursor.fetchone()
        return new_payment

    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

@app.get("/api/maintenance", response_model=List[MaintenanceRequest])
def get_all_maintenance_requests(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM MaintenanceRequests ORDER BY reported_date DESC")
    requests = cursor.fetchall()
    cursor.close()
    conn.close()
    return requests

@app.post("/api/maintenance", response_model=MaintenanceRequest, status_code=201)
def create_maintenance_request(request: MaintenanceRequestCreate, conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if room exists
        cursor.execute("SELECT room_id FROM Rooms WHERE room_id = %s", (request.room_id,))
        room = cursor.fetchone()
        if not room:
            raise HTTPException(status_code=404, detail=f"Room with id {request.room_id} not found.")
        
        # Check if guest exists (if provided)
        if request.guest_id:
            cursor.execute("SELECT guest_id FROM Guests WHERE guest_id = %s", (request.guest_id,))
            guest = cursor.fetchone()
            if not guest:
                raise HTTPException(status_code=404, detail=f"Guest with id {request.guest_id} not found.")
        
        # Create maintenance request
        sql = """
        INSERT INTO MaintenanceRequests (room_id, guest_id, issue_description, reported_date, status, resolved_date)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            request.room_id, request.guest_id, request.issue_description,
            request.reported_date, request.status.value, request.resolved_date
        ))
        
        conn.commit()
        request_id = cursor.lastrowid
        
        cursor.execute("SELECT * FROM MaintenanceRequests WHERE request_id = %s", (request_id,))
        new_request = cursor.fetchone()
        return new_request

    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

@app.patch("/api/maintenance/{request_id}", response_model=MaintenanceRequest)
def update_maintenance_request(
    request_id: int,
    status: MaintenanceStatus,
    resolved_date: Optional[date] = None,
    conn=Depends(get_db_connection)
):
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if request exists
        cursor.execute("SELECT * FROM MaintenanceRequests WHERE request_id = %s", (request_id,))
        existing_request = cursor.fetchone()
        if not existing_request:
            raise HTTPException(status_code=404, detail=f"Maintenance request with id {request_id} not found.")
        
        # Update the request
        sql = """
        UPDATE MaintenanceRequests 
        SET status = %s, resolved_date = %s
        WHERE request_id = %s
        """
        cursor.execute(sql, (status.value, resolved_date, request_id))
        
        conn.commit()
        
        # Fetch and return the updated request
        cursor.execute("SELECT * FROM MaintenanceRequests WHERE request_id = %s", (request_id,))
        updated_request = cursor.fetchone()
        return updated_request

    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

@app.get("/api/analytics/single-rooms-per-week")
def get_single_rooms_booked_per_week(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
        SELECT COUNT(*) as single_room_bookings
        FROM Bookings b
        JOIN Rooms r ON b.room_id = r.room_id
        WHERE r.room_type LIKE '%Single%'
        AND (b.check_in_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            OR b.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))
        """
        cursor.execute(sql)
        result = cursor.fetchone()
        count = result['single_room_bookings'] if result else 0
        return {"single_room_bookings_last_week": count}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/analytics/monthly-bookings-income")
def get_monthly_bookings_and_income(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        sql_bookings = """
        SELECT COUNT(*) as total_bookings
        FROM Bookings
        WHERE check_in_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
        """
        cursor.execute(sql_bookings)
        bookings_result = cursor.fetchone()
        
        sql_income = """
        SELECT 
            SUM(amount_paid) as total_income,
            AVG(amount_paid) as avg_income
        FROM Payments
        WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
        """
        cursor.execute(sql_income)
        income_result = cursor.fetchone()
        
        total_bookings = bookings_result['total_bookings'] if bookings_result else 0
        total_income = float(income_result['total_income']) if income_result and income_result['total_income'] else 0
        avg_income = float(income_result['avg_income']) if income_result and income_result['avg_income'] else 0
        
        return {
            "total_bookings_last_month": total_bookings,
            "total_income_last_month": total_income,
            "avg_income_last_month": avg_income
        }
    finally:
        cursor.close()
        conn.close()


@app.get("/api/analytics/maintenance-by-room")
def get_maintenance_by_room(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
        SELECT 
            r.room_number,
            r.room_type,
            COUNT(m.request_id) as maintenance_count
        FROM Rooms r
        LEFT JOIN MaintenanceRequests m ON r.room_id = m.room_id
        GROUP BY r.room_id, r.room_number, r.room_type
        ORDER BY maintenance_count DESC
        """
        cursor.execute(sql)
        results = cursor.fetchall()
        return {"maintenance_by_room": results}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/analytics/guests-with-payments")
def get_guests_who_paid_by_room(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
        SELECT 
            r.room_number,
            r.room_type,
            g.full_name as guest_name,
            g.phone_number,
            SUM(p.amount_paid) as total_paid,
            COUNT(p.payment_id) as payment_count
        FROM Rooms r
        JOIN Bookings b ON r.room_id = b.room_id
        JOIN Guests g ON b.guest_id = g.guest_id
        JOIN Payments p ON b.booking_id = p.booking_id
        GROUP BY r.room_id, r.room_number, r.room_type, g.guest_id, g.full_name, g.phone_number
        ORDER BY r.room_number, total_paid DESC
        """
        cursor.execute(sql)
        results = cursor.fetchall()
        
        for row in results:
            if row.get('total_paid'):
                row['total_paid'] = float(row['total_paid'])
        
        return {"guests_with_payments": results}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/analytics/rooms-booked-by-guest")
def get_rooms_booked_by_guest(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
        SELECT 
            g.guest_id,
            g.full_name,
            g.phone_number,
            g.email,
            COUNT(DISTINCT b.room_id) as rooms_booked,
            COUNT(b.booking_id) as total_bookings
        FROM Guests g
        LEFT JOIN Bookings b ON g.guest_id = b.guest_id
        GROUP BY g.guest_id, g.full_name, g.phone_number, g.email
        HAVING COUNT(b.booking_id) > 0
        ORDER BY rooms_booked DESC, total_bookings DESC
        """
        cursor.execute(sql)
        results = cursor.fetchall()
        return {"rooms_by_guest": results}
    finally:
        cursor.close()
        conn.close()

@app.get("/api/views/active-bookings")
def get_active_bookings_view(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM active_bookings_summary")
        results = cursor.fetchall()
        
        # Convert Decimal to float for JSON serialization
        for row in results:
            if row.get('monthly_rent'):
                row['monthly_rent'] = float(row['monthly_rent'])
        
        return {"active_bookings": results}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/views/room-revenue")
def get_room_revenue_view(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM room_revenue_summary")
        results = cursor.fetchall()
        
        for row in results:
            if row.get('monthly_rent'):
                row['monthly_rent'] = float(row['monthly_rent'])
            if row.get('total_revenue'):
                row['total_revenue'] = float(row['total_revenue'])
            else:
                row['total_revenue'] = 0.0
            if row.get('avg_payment'):
                row['avg_payment'] = float(row['avg_payment'])
            else:
                row['avg_payment'] = 0.0
        
        return {"room_revenue": results}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/views/guest-payments")
def get_guest_payment_history_view(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM guest_payment_history")
        results = cursor.fetchall()
        
        for row in results:
            if row.get('total_paid'):
                row['total_paid'] = float(row['total_paid'])
            else:
                row['total_paid'] = 0.0
        
        return {"guest_payments": results}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/views/maintenance-summary")
def get_maintenance_summary_view(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM maintenance_requests_summary")
        results = cursor.fetchall()
        return {"maintenance_summary": results}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/views/room-occupancy")
def get_room_occupancy_view(conn=Depends(get_db_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM room_occupancy_status")
        results = cursor.fetchall()
        
        # Convert Decimal to float for JSON serialization
        for row in results:
            if row.get('monthly_rent'):
                row['monthly_rent'] = float(row['monthly_rent'])
        
        return {"room_occupancy": results}
    finally:
        cursor.close()
        conn.close()


@app.get("/api/triggers/info")
def get_triggers_info(conn=Depends(get_db_connection)):
    """Get information about database triggers."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SHOW TRIGGERS")
        triggers = cursor.fetchall()
        
        trigger_info = {
            "total_triggers": len(triggers),
            "triggers": [
                {
                    "name": t.get('Trigger'),
                    "event": t.get('Event'),
                    "table": t.get('Table'),
                    "timing": t.get('Timing'),
                    "statement": t.get('Statement')[:100] + "..." if len(t.get('Statement', '')) > 100 else t.get('Statement')
                }
                for t in triggers
            ],
            "description": {
                "after_booking_insert": "Automatically sets room to 'Occupied' when an active booking is created",
                "after_booking_update": "Updates room status when booking status changes (Completed/Cancelled → Available)",
                "after_payment_insert": "Logs payment insertions (demonstration trigger)"
            }
        }
        return trigger_info
    finally:
        cursor.close()
        conn.close()


@app.on_event("startup")
def on_startup():
    print("Application is starting up...")
    try:
        setup_database()
    except Exception as e:
        print(f"An error occurred during startup: {e}")
