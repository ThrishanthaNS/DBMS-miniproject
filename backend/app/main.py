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

# Load environment variables from .env file
load_dotenv()

# --- Database Configuration ---
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'hostel_management_db')
}

# --- Database Connection ---
def get_db_connection():
    """Establishes and returns a database connection."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        # In a real app, you might want to handle this more gracefully
        raise HTTPException(status_code=500, detail="Database connection failed")

# --- Database Setup ---
def setup_database():
    """Ensures the database and all necessary tables are created."""
    db_name = DB_CONFIG['database']
    # Temporary config without a specific database to create it
    temp_config = DB_CONFIG.copy()
    temp_config.pop('database', None)

    try:
        # Connect to MySQL server to create the database
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

# --- FastAPI App Initialization ---
app = FastAPI(title="Hostel Management API")

# CORS Middleware for allowing frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], # Adjust for your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models (Data Schemas) ---

# Enums for validation
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

# Guest Models
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

# Room Models
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

# Booking Models
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

# Payment Models
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

# Maintenance Request Models
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


# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Hostel Management API"}

# --- Guest Endpoints ---

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

# --- Room Endpoints ---

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

# --- Booking Endpoints ---

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


# --- Payment Endpoints ---

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


# --- Maintenance Request Endpoints ---

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


# --- Startup Event ---
@app.on_event("startup")
def on_startup():
    """Function to run on application startup."""
    print("Application is starting up...")
    try:
        setup_database()
    except Exception as e:
        print(f"An error occurred during startup: {e}")
        # Depending on the severity, you might want to exit the application
        # import sys
        # sys.exit(1)
