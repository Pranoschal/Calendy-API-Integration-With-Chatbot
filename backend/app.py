from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import requests
from typing import List, Dict, Optional

app = Flask(__name__)
CORS(app)

# Calendly API Configuration
CALENDLY_API_BASE = "https://api.calendly.com"
CALENDLY_API_TOKEN = os.environ.get("CALENDLY_API_TOKEN", "")
CALENDLY_USER_URI = os.environ.get("CALENDLY_USER_URI", "")

# Appointment type durations (in minutes)
APPOINTMENT_TYPES = {
    "general": {"name": "General Consultation", "duration": 30},
    "followup": {"name": "Follow-up", "duration": 15},
    "physical": {"name": "Physical Exam", "duration": 45},
    "specialist": {"name": "Specialist Consultation", "duration": 60}
}

def get_calendly_headers():
    """Get headers for Calendly API requests"""
    return {
        "Authorization": f"Bearer {CALENDLY_API_TOKEN}",
        "Content-Type": "application/json"
    }

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Flask backend is running"})

@app.route("/api/appointment-types", methods=["GET"])
def get_appointment_types():
    """Get available appointment types"""
    return jsonify(APPOINTMENT_TYPES)

@app.route("/api/event-types", methods=["GET"])
def get_event_types():
    """Get event types from Calendly"""
    try:
        if not CALENDLY_API_TOKEN:
            return jsonify({"error": "Calendly API token not configured"}), 500
        
        url = f"{CALENDLY_API_BASE}/event_types"
        params = {"user": CALENDLY_USER_URI}
        
        response = requests.get(url, headers=get_calendly_headers(), params=params)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
        else:
            return jsonify({"error": "Failed to fetch event types", "details": response.text}), response.status_code
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/available-times", methods=["POST"])
def get_available_times():
    """Get available time slots for a specific event type"""
    try:
        data = request.json
        event_type_uri = data.get("event_type_uri")
        start_time = data.get("start_time")  # ISO 8601 format
        end_time = data.get("end_time")  # ISO 8601 format
        
        if not event_type_uri:
            return jsonify({"error": "event_type_uri is required"}), 400
        
        # Default to next 7 days if not specified
        if not start_time:
            start_time = datetime.utcnow().isoformat() + "Z"
        if not end_time:
            end_time = (datetime.utcnow() + timedelta(days=7)).isoformat() + "Z"
        
        url = f"{CALENDLY_API_BASE}/event_type_available_times"
        params = {
            "event_type": event_type_uri,
            "start_time": start_time,
            "end_time": end_time
        }
        
        response = requests.get(url, headers=get_calendly_headers(), params=params)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
        else:
            return jsonify({"error": "Failed to fetch available times", "details": response.text}), response.status_code
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/schedule-appointment", methods=["POST"])
def schedule_appointment():
    """Schedule a new appointment"""
    try:
        data = request.json
        
        # Required fields
        event_type_uri = data.get("event_type_uri")
        start_time = data.get("start_time")
        email = data.get("email")
        name = data.get("name")
        
        if not all([event_type_uri, start_time, email, name]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Optional fields
        phone = data.get("phone", "")
        reason = data.get("reason", "")
        
        # Create scheduling link first
        url = f"{CALENDLY_API_BASE}/scheduling_links"
        payload = {
            "max_event_count": 1,
            "owner": CALENDLY_USER_URI,
            "owner_type": "EventType",
            "event_type": event_type_uri
        }
        
        response = requests.post(url, headers=get_calendly_headers(), json=payload)
        
        if response.status_code == 201:
            scheduling_data = response.json()
            booking_url = scheduling_data.get("resource", {}).get("booking_url")
            
            return jsonify({
                "success": True,
                "booking_url": booking_url,
                "message": "Appointment scheduled successfully",
                "details": {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "start_time": start_time,
                    "reason": reason
                }
            })
        else:
            return jsonify({"error": "Failed to create appointment", "details": response.text}), response.status_code
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/scheduled-events", methods=["GET"])
def get_scheduled_events():
    """Get all scheduled events"""
    try:
        url = f"{CALENDLY_API_BASE}/scheduled_events"
        params = {
            "user": CALENDLY_USER_URI,
            "status": "active"
        }
        
        response = requests.get(url, headers=get_calendly_headers(), params=params)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
        else:
            return jsonify({"error": "Failed to fetch scheduled events", "details": response.text}), response.status_code
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/cancel-appointment", methods=["POST"])
def cancel_appointment():
    """Cancel an appointment"""
    try:
        data = request.json
        event_uri = data.get("event_uri")
        reason = data.get("reason", "")
        
        if not event_uri:
            return jsonify({"error": "event_uri is required"}), 400
        
        url = f"{CALENDLY_API_BASE}/scheduled_events/{event_uri}/cancellation"
        payload = {"reason": reason}
        
        response = requests.post(url, headers=get_calendly_headers(), json=payload)
        
        if response.status_code == 201:
            return jsonify({
                "success": True,
                "message": "Appointment cancelled successfully"
            })
        else:
            return jsonify({"error": "Failed to cancel appointment", "details": response.text}), response.status_code
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
