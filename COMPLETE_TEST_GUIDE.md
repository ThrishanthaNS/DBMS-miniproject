# Complete System Test Guide

## Prerequisites
✅ Backend running on http://localhost:8000
✅ Frontend running on http://localhost:3000
✅ MySQL database connected with all tables created

## Full System Test Workflow

### Phase 1: Setup Base Data

#### 1.1 Create Guests
Navigate to **👥 Guests** tab:
1. Click "+ Add New Guest"
2. Fill in:
   - Full Name: "John Doe"
   - Phone: "9876543210"
   - Email: "john@example.com"
   - ID Proof: "Aadhar"
   - ID Number: "1234-5678-9012"
   - Address: "123 Main St"
3. Click "Add Guest"
4. Repeat for 2-3 more guests

**Expected**: Guest appears in the table with all details

#### 1.2 Create Rooms
Navigate to **🏠 Rooms** tab:
1. Click "+ Add New Room"
2. Fill in:
   - Room Number: "101"
   - Type: "Single"
   - Monthly Rent: "5000"
   - Status: "Available"
3. Click "Add Room"
4. Create more rooms:
   - 102 - Double - 7000
   - 103 - Triple - 9000
   - 201 - Deluxe - 12000

**Expected**: 
- Rooms appear in table
- Stats show 4 Available, 0 Occupied, 4 Total

### Phase 2: Booking Management

#### 2.1 Create a Booking
Navigate to **📋 Bookings** tab:
1. Click "+ Create New Booking"
2. Select:
   - Guest: "John Doe"
   - Room: "101 - Single (₹5,000)"
   - Check-in: Today's date
   - Check-out: (leave empty or future date)
   - Status: "Active"
3. Click "Create Booking"

**Expected**:
- Success message
- Booking appears in table
- Room 101 status changes to "Occupied"
- Available rooms count decreases by 1

#### 2.2 Create Multiple Bookings
Repeat for 1-2 more guest-room combinations

**Expected**:
- Multiple active bookings visible
- Corresponding rooms show "Occupied"
- Statistics update correctly

### Phase 3: Payment Management

#### 3.1 Record a Payment
Navigate to **💰 Payments** tab:
1. Click "+ Record Payment"
2. Fill in:
   - Booking: Select "Booking #1 - John Doe - Room 101"
   - Amount: "5000"
   - Payment Date: Today
   - Payment Method: "UPI"
   - Remarks: "First month rent"
3. Click "Record Payment"

**Expected**:
- Success message
- Payment appears in table
- Total Payments: 1
- Total Amount: ₹5,000
- This Month: 1

#### 3.2 Record More Payments
Test different payment methods:
- Record payment with "Cash"
- Record payment with "Card"
- Record payment with "Bank Transfer"

**Expected**:
- All payments listed
- Different payment method badges
- Total amount increases
- Booking info shows correctly

### Phase 4: Maintenance Requests

#### 4.1 Create Maintenance Request
Navigate to **🔧 Maintenance** tab:
1. Click "+ Create Request"
2. Fill in:
   - Room: "101 - Single"
   - Guest: "John Doe" (optional)
   - Issue: "Air conditioner not cooling properly"
   - Reported Date: Today
   - Status: "Pending"
3. Click "Create Request"

**Expected**:
- Success message
- Request appears in table
- Pending count increases
- Yellow "Pending" badge shows

#### 4.2 Update Request Status
1. Find the request in the table
2. Click "Start" button

**Expected**:
- Status changes to "In Progress"
- Blue badge appears
- In Progress count increases
- Pending count decreases

3. Click "Resolve" button

**Expected**:
- Status changes to "Resolved"
- Green badge appears
- Resolved date shows today's date
- Action buttons disappear
- Resolved count increases

#### 4.3 Create Various Requests
Test different scenarios:
- Request without guest assigned
- Request for different rooms
- Create with different initial statuses

### Phase 5: Dashboard Overview

Navigate to **📊 Dashboard** tab:

**Expected to see**:
- Total Guests count
- Total Rooms and Available rooms
- Active Bookings count
- Occupancy Rate percentage
- All statistics match data entered

### Phase 6: Data Verification

#### 6.1 Cross-Reference Data
1. Check that booking shows correct guest and room
2. Verify payment shows correct booking info
3. Confirm maintenance shows correct room and guest
4. Verify room status changes with bookings

#### 6.2 Database Check (Optional)
Run SQL queries to verify:
```sql
SELECT * FROM Guests;
SELECT * FROM Rooms;
SELECT * FROM Bookings;
SELECT * FROM Payments;
SELECT * FROM MaintenanceRequests;
```

## Complete Test Checklist

### Guests Module
- [ ] Create guest with all fields
- [ ] Create guest with minimal fields (name + phone)
- [ ] View guests in table
- [ ] Verify guest count

### Rooms Module
- [ ] Create room (all types: Single, Double, Triple, Deluxe)
- [ ] View rooms with status badges
- [ ] Check status stats (Available, Occupied, Maintenance)
- [ ] Verify room count

### Bookings Module
- [ ] Create booking for available room
- [ ] Verify room status changes to Occupied
- [ ] View booking with guest and room info
- [ ] Check available rooms decreases
- [ ] Verify active bookings count

### Payments Module
- [ ] Record payment for active booking
- [ ] Test all payment methods (Cash, UPI, Card, Bank Transfer)
- [ ] View payment history
- [ ] Verify total amount calculation
- [ ] Check monthly payments count
- [ ] Confirm booking info display

### Maintenance Module
- [ ] Create request with guest
- [ ] Create request without guest
- [ ] Update status: Pending → In Progress
- [ ] Update status: In Progress → Resolved
- [ ] Verify resolved date set automatically
- [ ] Check status statistics (Pending, In Progress, Resolved)
- [ ] Verify action buttons appear/disappear correctly

### Dashboard Module
- [ ] View all statistics
- [ ] Verify counts match data
- [ ] Check occupancy rate calculation
- [ ] Review quick actions section

## Performance Tests

### Load Testing
1. Create 10+ guests
2. Create 20+ rooms
3. Create 15+ bookings
4. Record 30+ payments
5. Create 25+ maintenance requests

**Expected**: UI remains responsive, data loads quickly

### Navigation Testing
1. Switch between all tabs rapidly
2. Verify no data loss
3. Check loading states
4. Confirm error handling

## Edge Cases to Test

### Data Validation
- [ ] Try creating guest with duplicate phone number
- [ ] Try creating room with duplicate room number
- [ ] Try creating booking for occupied room
- [ ] Try recording payment for non-existent booking
- [ ] Try creating maintenance for non-existent room

### Form Validation
- [ ] Submit forms with empty required fields
- [ ] Enter negative amounts
- [ ] Enter invalid dates
- [ ] Test with special characters

### Status Transitions
- [ ] Book room → Check status = Occupied
- [ ] Cancel booking → (manual test if implemented)
- [ ] Maintenance status workflow

## Expected API Responses

### Success Cases
- Status 200: GET requests return data
- Status 201: POST requests create records
- Status 200: PATCH requests update records

### Error Cases
- Status 400: Bad request (invalid data)
- Status 404: Resource not found
- Status 409: Conflict (room not available)

## Browser Testing

Test in different browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

### Mobile Responsive Testing
- [ ] Test on mobile screen size (resize browser)
- [ ] Verify navigation menu adapts
- [ ] Check table scrolling
- [ ] Verify forms are usable

## Troubleshooting Common Issues

### "Failed to fetch data"
- ✅ Check backend is running on port 8000
- ✅ Check database connection
- ✅ View browser console for errors

### "Room not available"
- ✅ Verify room status is "Available"
- ✅ Check no active booking exists for that room

### "Booking not found"
- ✅ Ensure booking exists and is Active
- ✅ Check booking ID is correct

### Empty dropdown lists
- ✅ Create required data first (guests/rooms/bookings)
- ✅ Refresh the page

## Success Criteria

✅ All modules load without errors
✅ Data persists in database
✅ Statistics update in real-time
✅ Status changes reflect immediately
✅ Forms validate input correctly
✅ Error messages are clear and helpful
✅ UI is responsive and user-friendly
✅ Navigation works smoothly
✅ Data relationships are maintained (guest-booking-payment)

## Final Verification

After completing all tests:
1. Navigate through all tabs
2. Verify data consistency
3. Check all statistics are correct
4. Confirm UI looks professional
5. Test a complete workflow: Guest → Room → Booking → Payment → Maintenance

**If all checks pass**: System is ready for production use! 🎉
