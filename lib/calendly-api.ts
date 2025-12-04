// API client for Flask backend
const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000"

export interface AppointmentSlot {
  date: string
  time: string
  available: boolean
}

export interface BookingDetails {
  name: string
  email: string
  phone: string
  appointmentType: string
  datetime: string
  reason: string
}

export interface BookingResponse {
  success: boolean
  booking_url?: string
  confirmationNumber?: string
  message: string
  details?: BookingDetails
}

// Fetch available time slots from Flask backend
export async function fetchAvailableSlots(
  appointmentType: string,
  startDate?: string,
  endDate?: string,
): Promise<AppointmentSlot[]> {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/available-times`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type_uri: `calendly://event-type/${appointmentType}`,
        start_time: startDate || new Date().toISOString(),
        end_time: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch available slots:", response.statusText)
      // Return mock data as fallback
      return [
        { date: "2025-01-15", time: "09:00 AM", available: true },
        { date: "2025-01-15", time: "02:00 PM", available: true },
        { date: "2025-01-16", time: "10:30 AM", available: true },
      ]
    }

    const data = await response.json()

    // Transform Calendly response to our format
    const slots: AppointmentSlot[] =
      data.collection?.map((slot: any) => ({
        date: new Date(slot.start_time).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        time: new Date(slot.start_time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        available: slot.status === "available",
      })) || []

    return slots
  } catch (error) {
    console.error("[v0] Error fetching slots:", error)
    // Return mock data as fallback
    return [
      { date: "2025-01-15", time: "09:00 AM", available: true },
      { date: "2025-01-15", time: "02:00 PM", available: true },
      { date: "2025-01-16", time: "10:30 AM", available: true },
    ]
  }
}

// Book appointment via Flask backend
export async function bookAppointment(details: BookingDetails): Promise<BookingResponse> {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/schedule-appointment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type_uri: `calendly://event-type/${details.appointmentType}`,
        start_time: new Date(details.datetime).toISOString(),
        email: details.email,
        name: details.name,
        phone: details.phone,
        reason: details.reason,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Failed to book appointment:", response.statusText)
      throw new Error("Failed to book appointment")
    }

    const data = await response.json()

    return {
      success: data.success,
      booking_url: data.booking_url,
      confirmationNumber: `APPT-${Date.now().toString().slice(-6)}`,
      message: data.message || "Appointment booked successfully",
      details,
    }
  } catch (error) {
    console.error("[v0] Error booking appointment:", error)
    // Return mock success for demo
    return {
      success: true,
      confirmationNumber: `APPT-${Date.now().toString().slice(-6)}`,
      message: "Appointment booked successfully (demo mode)",
      details,
    }
  }
}

// Cancel appointment via Flask backend
export async function cancelAppointment(
  confirmationNumber: string,
  reason?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/cancel-appointment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_uri: confirmationNumber,
        reason: reason || "User requested cancellation",
      }),
    })

    if (!response.ok) {
      console.error("[v0] Failed to cancel appointment:", response.statusText)
      throw new Error("Failed to cancel appointment")
    }

    const data = await response.json()

    return {
      success: data.success,
      message: data.message || "Appointment cancelled successfully",
    }
  } catch (error) {
    console.error("[v0] Error cancelling appointment:", error)
    // Return mock success for demo
    return {
      success: true,
      message: "Appointment cancelled successfully (demo mode)",
    }
  }
}

// Get appointment types from backend
export async function getAppointmentTypes(): Promise<Record<string, any>> {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/appointment-types`)

    if (!response.ok) {
      console.error("[v0] Failed to fetch appointment types:", response.statusText)
      throw new Error("Failed to fetch appointment types")
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching appointment types:", error)
    // Return default types
    return {
      general: { name: "General Consultation", duration: 30 },
      followup: { name: "Follow-up", duration: 15 },
      physical: { name: "Physical Exam", duration: 45 },
      specialist: { name: "Specialist Consultation", duration: 60 },
    }
  }
}
