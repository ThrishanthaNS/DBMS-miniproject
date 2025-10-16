# Maintenance Requests Integration - Implementation Summary

## Backend Changes (FastAPI)

### 1. Added Maintenance Status Enum
```python
class MaintenanceStatus(str, Enum):
    PENDING = 'Pending'
    IN_PROGRESS = 'In Progress'
    RESOLVED = 'Resolved'
```

### 2. Added Maintenance Request Models
```python
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
```

### 3. Added Maintenance Request Endpoints

#### GET /api/maintenance
- Fetches all maintenance requests
- Returns requests sorted by reported date (descending)
- Response: List[MaintenanceRequest]

#### POST /api/maintenance
- Creates a new maintenance request
- Validates that the room exists
- Validates that the guest exists (if guest_id is provided)
- Fields:
  - room_id (required)
  - guest_id (optional)
  - issue_description (required)
  - reported_date (required)
  - status (optional, default: 'Pending')
  - resolved_date (optional)
- Response: MaintenanceRequest object with request_id

#### PATCH /api/maintenance/{request_id}
- Updates the status of a maintenance request
- Query parameters:
  - status (required): Pending/In Progress/Resolved
  - resolved_date (optional): Auto-set when status is Resolved
- Response: Updated MaintenanceRequest object

## Frontend Changes (React)

### 1. Updated MaintenanceManagement Component

#### Features Added:
- ✅ Fetch all maintenance requests from backend API
- ✅ Display requests in a table with full information
- ✅ Show room details (room number and type)
- ✅ Show guest name (or "-" if no guest assigned)
- ✅ Create new maintenance requests
- ✅ Update request status (Pending → In Progress → Resolved)
- ✅ Statistics cards showing:
  - Pending requests count
  - In Progress requests count
  - Resolved requests count
  - Total requests count

#### Form Fields:
- Room selection (required) - shows room number and type
- Guest selection (optional) - shows guest name
- Issue description (required) - detailed text area
- Reported date (required) - defaults to today
- Status selection (Pending/In Progress/Resolved)

#### Table Columns:
- Request ID
- Room (Room Number - Room Type)
- Guest (Guest Name or "-")
- Issue Description (wrapped text)
- Reported Date
- Status (with color-coded badge)
- Resolved Date (or "-" if not resolved)
- Actions (Quick action buttons)

### 2. Action Buttons:
- **Start** button - Changes status from Pending to In Progress
- **Resolve** button - Changes status to Resolved and sets resolved_date
- Buttons only show for non-resolved requests

### 3. Status Badges:
- **Pending** - Yellow badge
- **In Progress** - Blue badge
- **Resolved** - Green badge

### 4. Enhanced UI Features:
- Color-coded status badges
- Inline status update buttons
- Issue description with proper text wrapping
- Responsive design
- Error handling and loading states

## How to Use

### Creating a Maintenance Request:
1. Go to the "🔧 Maintenance" section
2. Click "+ Create Request"
3. Select a room (required)
4. Select a guest (optional - who reported the issue)
5. Enter detailed issue description
6. Set reported date (defaults to today)
7. Choose initial status (usually Pending)
8. Click "Create Request"

### Updating Request Status:
1. Find the request in the table
2. Click **"Start"** to move from Pending to In Progress
3. Click **"Resolve"** to mark as Resolved
4. Resolved date is automatically set when marked as resolved

### Viewing Maintenance History:
- All requests are displayed in the table
- Sorted by most recent first
- Statistics show breakdown by status
- Resolved requests show the resolution date

## Database Table Used

The MaintenanceRequests table structure (already exists in your database):
```sql
CREATE TABLE MaintenanceRequests (
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
```

## Testing the Integration

1. Make sure the backend is running on http://localhost:8000
2. Make sure the frontend is running on http://localhost:3000
3. Create some rooms if you haven't already
4. Optionally create guests
5. Go to the Maintenance section
6. Create a maintenance request for a room
7. Update the status using the action buttons
8. View the updated status and resolved date

## API Examples

### Get All Maintenance Requests
```
GET http://localhost:8000/api/maintenance
```

### Create a Maintenance Request
```
POST http://localhost:8000/api/maintenance
Content-Type: application/json

{
  "room_id": 1,
  "guest_id": 2,
  "issue_description": "Air conditioner not working properly",
  "reported_date": "2025-10-16",
  "status": "Pending"
}
```

### Update Request Status
```
PATCH http://localhost:8000/api/maintenance/1?status=In Progress
```

```
PATCH http://localhost:8000/api/maintenance/1?status=Resolved&resolved_date=2025-10-16
```

## Workflow Example

1. **Guest reports issue**: Staff creates a request (Status: Pending)
2. **Maintenance starts work**: Staff clicks "Start" button (Status: In Progress)
3. **Issue is fixed**: Staff clicks "Resolve" button (Status: Resolved, resolved_date set)

## Use Cases

### Common Maintenance Issues:
- 🔧 Plumbing problems (leaky faucet, clogged drain)
- ❄️ AC/Heating not working
- 💡 Electrical issues (lights, outlets)
- 🪟 Window/door repairs
- 🛏️ Furniture repairs
- 🎨 Painting/wall repairs
- 🧹 Deep cleaning needed
- 🚪 Lock/key issues

## Next Steps (Optional Enhancements)

1. Add maintenance priority levels (Low/Medium/High/Urgent)
2. Add maintenance category/type classification
3. Add assigned technician field
4. Add cost estimation and actual cost
5. Add before/after photos
6. Add maintenance schedule/calendar view
7. Add email notifications when requests are created/updated
8. Add maintenance history per room
9. Add maintenance reports and analytics
10. Add recurring maintenance tasks

## Files Modified:
- `backend/app/main.py` - Added maintenance models and endpoints
- `frontend/src/components/MaintenanceManagement.js` - Full maintenance management UI
- `frontend/src/components/Management.css` - Added status badges and action button styling
- `frontend/src/App.js` - Already includes maintenance in navigation

The maintenance request system is now fully integrated and ready to use! 🔧✨
