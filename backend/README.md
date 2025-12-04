# Flask Backend for Medical Appointment Scheduling

## Setup Instructions

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Create a `.env` file based on `.env.example`:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Get your Calendly API credentials:
   - Go to https://calendly.com/integrations/api_webhooks
   - Generate a Personal Access Token
   - Copy your user URI from the API response

4. Update the `.env` file with your credentials

5. Run the Flask server:
\`\`\`bash
python app.py
\`\`\`

The server will start on `http://localhost:5000`

## API Endpoints

### GET /api/health
Health check endpoint

### GET /api/appointment-types
Get available appointment types with durations

### GET /api/event-types
Get event types from Calendly

### POST /api/available-times
Get available time slots for booking
Body: `{ "event_type_uri": "...", "start_time": "...", "end_time": "..." }`

### POST /api/schedule-appointment
Schedule a new appointment
Body: `{ "event_type_uri": "...", "start_time": "...", "email": "...", "name": "...", "phone": "...", "reason": "..." }`

### GET /api/scheduled-events
Get all scheduled events

### POST /api/cancel-appointment
Cancel an appointment
Body: `{ "event_uri": "...", "reason": "..." }`
