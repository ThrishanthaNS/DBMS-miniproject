# Quick Test Guide for Payment Integration

## Prerequisites
1. ✅ Backend running on http://localhost:8000
2. ✅ Frontend running on http://localhost:3000
3. ✅ MySQL database connected and tables created

## Step-by-Step Testing

### Step 1: Verify Backend Endpoints
Open your browser and check:
- http://localhost:8000/api/payments (should return [] if no payments exist)
- http://localhost:8000/docs (FastAPI Swagger docs - you should see the payment endpoints)

### Step 2: Prepare Test Data
Before recording a payment, you need:

1. **Create a Guest:**
   - Go to "👥 Guests" tab
   - Click "+ Add New Guest"
   - Fill in: Name, Phone Number
   - Submit

2. **Create a Room:**
   - Go to "🏠 Rooms" tab
   - Click "+ Add New Room"
   - Fill in: Room Number (e.g., "101"), Type (e.g., "Single"), Monthly Rent (e.g., "5000")
   - Submit

3. **Create a Booking:**
   - Go to "📋 Bookings" tab
   - Click "+ Create New Booking"
   - Select the guest and room you just created
   - Set check-in date
   - Submit

### Step 3: Record a Payment

1. Go to "💰 Payments" tab
2. Click "+ Record Payment"
3. Select the booking from dropdown (should show: "Booking #X - [Guest Name] - Room [Room Number]")
4. Enter amount (e.g., 5000)
5. Select payment date (default is today)
6. Choose payment method (Cash/UPI/Card/Bank Transfer)
7. Add remarks (optional, e.g., "First month rent")
8. Click "Record Payment"

### Step 4: Verify Payment

You should see:
- Success alert: "Payment recorded successfully!"
- Payment appears in the table below
- Statistics cards update:
  - Total Payments count increases
  - Total Amount shows the sum
  - This Month count increases

### Step 5: Check Database (Optional)

Run this SQL query in your MySQL database:
```sql
SELECT * FROM Payments;
```

You should see your payment record with:
- payment_id
- booking_id
- amount_paid
- payment_date
- payment_method
- remarks
- created_at

## Expected Results

### Payment Table Columns:
1. Payment ID - Auto-generated
2. Booking Info - Shows "Guest Name - Room Number"
3. Amount Paid - Shows ₹ formatted amount
4. Payment Date - Date when payment was made
5. Payment Method - Badge showing Cash/UPI/Card/Bank Transfer
6. Remarks - Your notes (or "-" if empty)
7. Recorded At - Timestamp when record was created

### Statistics Cards:
- **Total Payments**: Count of all payments
- **Total Amount**: Sum of all amount_paid values
- **This Month**: Count of payments in current month

## Troubleshooting

### If you get errors:

1. **"Failed to fetch data"**
   - Check if backend is running
   - Check browser console for CORS errors
   - Verify database connection

2. **"Booking with id X not found"**
   - Make sure you created a booking first
   - Check that the booking status is "Active"

3. **"Failed to create payment"**
   - Check that all required fields are filled
   - Verify amount is greater than 0
   - Check backend terminal for error messages

4. **Empty dropdown for bookings**
   - You need to create at least one active booking first
   - Go to Bookings tab and create a booking

## API Testing (Alternative Method)

You can also test using curl or Postman:

```bash
# Get all payments
curl http://localhost:8000/api/payments

# Create a payment
curl -X POST http://localhost:8000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 1,
    "amount_paid": 5000.00,
    "payment_date": "2025-10-16",
    "payment_method": "UPI",
    "remarks": "Test payment"
  }'
```

## Success Indicators

✅ Payment form opens and shows active bookings
✅ Payment is recorded without errors
✅ Payment appears in the table immediately
✅ Statistics update correctly
✅ Booking info shows guest and room details
✅ Payment method badge is colored correctly

## Next Actions

Once payments are working, you can:
1. Record multiple payments for different bookings
2. Test different payment methods
3. View payment history over time
4. Calculate total revenue
5. Track payments per guest or room
