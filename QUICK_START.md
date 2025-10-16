# 🚀 Quick Start Guide - Hostel Management System

## ⚡ 5-Minute Setup

### 1. Start Backend (Terminal 1)
```bash
cd backend
python -m uvicorn app.main:app --reload
```
✅ Backend: http://localhost:8000

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```
✅ Frontend: http://localhost:3000

---

## 📋 Quick Test (2 Minutes)

### Step 1: Add a Guest (30 sec)
1. Go to **👥 Guests**
2. Click **"+ Add New Guest"**
3. Enter: Name = "Test User", Phone = "9999999999"
4. Submit

### Step 2: Add a Room (30 sec)
1. Go to **🏠 Rooms**
2. Click **"+ Add New Room"**
3. Enter: Room = "101", Type = "Single", Rent = "5000"
4. Submit

### Step 3: Create Booking (30 sec)
1. Go to **📋 Bookings**
2. Click **"+ Create New Booking"**
3. Select your guest and room
4. Set check-in date
5. Submit

### Step 4: Record Payment (30 sec)
1. Go to **💰 Payments**
2. Click **"+ Record Payment"**
3. Select the booking
4. Enter amount: 5000
5. Choose payment method: UPI
6. Submit

### Step 5: Create Maintenance (30 sec)
1. Go to **🔧 Maintenance**
2. Click **"+ Create Request"**
3. Select room 101
4. Issue: "Test maintenance"
5. Submit
6. Click **"Start"** button
7. Click **"Resolve"** button

---

## 🎯 All Features at a Glance

| Module | Create | View | Update | Special Features |
|--------|--------|------|--------|------------------|
| **Guests** | ✅ | ✅ | - | Unique phone/email validation |
| **Rooms** | ✅ | ✅ | - | Status badges, Statistics |
| **Bookings** | ✅ | ✅ | - | Auto room status update |
| **Payments** | ✅ | ✅ | - | Multiple payment methods, Total amount |
| **Maintenance** | ✅ | ✅ | ✅ | Status workflow, Action buttons |
| **Dashboard** | - | ✅ | - | Overview statistics, Occupancy rate |

---

## 🔗 API Endpoints Cheat Sheet

```
GET    /api/guests                          # All guests
POST   /api/guests                          # Create guest

GET    /api/rooms                           # All rooms
POST   /api/rooms                           # Create room

GET    /api/bookings                        # All bookings
POST   /api/bookings                        # Create booking

GET    /api/payments                        # All payments
POST   /api/payments                        # Create payment

GET    /api/maintenance                     # All maintenance requests
POST   /api/maintenance                     # Create request
PATCH  /api/maintenance/{id}?status=...     # Update status
```

**Swagger Docs**: http://localhost:8000/docs

---

## 🎨 UI Navigation

```
🏨 Hostel Management
├── 📊 Dashboard        → Overview & Statistics
├── 👥 Guests          → Guest Management
├── 🏠 Rooms           → Room Management
├── 📋 Bookings        → Booking Management
├── 💰 Payments        → Payment Tracking
└── 🔧 Maintenance     → Maintenance Requests
```

---

## 🔍 Status Colors

| Color | Meaning |
|-------|---------|
| 🟢 Green | Available, Active, Resolved, Completed |
| 🟡 Yellow | Pending, Maintenance |
| 🔵 Blue | Occupied, In Progress |
| 🔴 Red | Cancelled |

---

## 💡 Quick Tips

### Creating Data
- **Always create guests and rooms first** before bookings
- Use **realistic data** for better testing
- Check **statistics update** after each action

### Status Updates
- **Bookings**: Set room to Occupied
- **Maintenance**: Pending → In Progress → Resolved
- **Payments**: Track by booking

### Validation
- Phone and email must be **unique**
- Room numbers must be **unique**
- Amount must be **greater than 0**
- Can't book **occupied rooms**

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend not starting | Check MySQL is running, verify connection |
| Frontend not loading | Run `npm install`, check port 3000 is free |
| CORS errors | Verify backend allows http://localhost:3000 |
| Empty dropdowns | Create required data first (guests/rooms) |
| "Room not available" | Room must have status "Available" |

---

## 📱 Mobile Testing

1. Open http://localhost:3000 on phone (same network)
2. Or resize browser window to mobile size
3. Navigation should adapt to mobile view

---

## 🎓 Demo Script (5 Minutes)

**Minute 1: Dashboard**
- Show overview statistics
- Explain each card

**Minute 2: Data Entry**
- Create 1 guest
- Create 1 room
- Show validation

**Minute 3: Booking Flow**
- Create booking
- Show room status change
- Demonstrate active bookings

**Minute 4: Payments**
- Record payment
- Show different methods
- Display statistics

**Minute 5: Maintenance**
- Create request
- Update status (Start → Resolve)
- Show workflow completion

---

## 📊 Sample Data

### Quick Copy-Paste Data

**Guests:**
```
Name: John Doe, Phone: 9876543210, Email: john@example.com
Name: Jane Smith, Phone: 9876543211, Email: jane@example.com
Name: Bob Wilson, Phone: 9876543212, Email: bob@example.com
```

**Rooms:**
```
101, Single, 5000
102, Double, 7000
103, Triple, 9000
201, Deluxe, 12000
```

**Maintenance Issues:**
```
Air conditioner not cooling
Leaky faucet in bathroom
Light bulb replacement needed
Door lock malfunction
```

---

## ✅ Pre-Demo Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] MySQL database connected
- [ ] Browser window maximized
- [ ] Console errors cleared
- [ ] Sample data ready
- [ ] All modules tested

---

## 🏆 Success Metrics

After testing, verify:
- ✅ All 6 tabs working
- ✅ Data persists across page refresh
- ✅ Statistics update correctly
- ✅ No console errors
- ✅ Responsive design works
- ✅ Forms validate properly

---

## 📞 Quick Links

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **GitHub**: ThrishanthaNS/DBMS-miniproject

---

## 🎯 Key Highlights to Mention

1. **Full-stack application** with React + FastAPI
2. **Complete CRUD operations** for all modules
3. **Real-time statistics** and dashboard
4. **Status workflows** (bookings, maintenance)
5. **Responsive design** for all screen sizes
6. **Professional UI/UX** with modern design
7. **Data validation** and error handling
8. **RESTful API** design

---

**Ready to impress! 🚀**
