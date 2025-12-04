import { consumeStream, convertToModelMessages, streamText, tool, type UIMessage, stepCountIs } from "ai"
import { z } from "zod"
import { searchFAQs } from "@/lib/faq-knowledge-base"
import { groq } from "@ai-sdk/groq";
import {
  fetchAvailableSlots,
  bookAppointment as bookAppointmentAPI,
  cancelAppointment as cancelAppointmentAPI,
} from "@/lib/calendly-api"

export const maxDuration = 30

const getAvailableSlots = tool({
  description: "Get available appointment time slots from the calendar system",
  inputSchema: z.object({
    appointmentType: z.enum(["general", "followup", "physical", "specialist"]).describe("Type of appointment"),
    preferredDate: z.string().optional().describe("Preferred date in YYYY-MM-DD format"),
    preferredTime: z.enum(["morning", "afternoon", "evening"]).optional().describe("Preferred time of day"),
  }),
  execute: async ({ appointmentType, preferredDate, preferredTime }) => {
    console.log("[v0] Fetching available slots for:", appointmentType, preferredDate, preferredTime)

    // Calculate date range based on preferences
    const startDate = preferredDate ? new Date(preferredDate).toISOString() : new Date().toISOString()

    const endDate = preferredDate
      ? new Date(new Date(preferredDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch from backend
    const slots = await fetchAvailableSlots(appointmentType, startDate, endDate)

    // Filter by time preference if specified
    let filteredSlots = slots
    if (preferredTime) {
      filteredSlots = slots.filter((slot) => {
        const hour = Number.parseInt(slot.time.split(":")[0])
        const isPM = slot.time.includes("PM")
        const hour24 = isPM && hour !== 12 ? hour + 12 : hour

        if (preferredTime === "morning") return hour24 >= 6 && hour24 < 12
        if (preferredTime === "afternoon") return hour24 >= 12 && hour24 < 17
        if (preferredTime === "evening") return hour24 >= 17 && hour24 < 21
        return true
      })
    }

    return {
      appointmentType,
      slots: filteredSlots.slice(0, 5), // Return top 5 slots
      message: `Found ${filteredSlots.length} available slots for ${appointmentType} consultation`,
    }
  },
})

const bookAppointment = tool({
  description: "Book a medical appointment after collecting all required information",
  inputSchema: z.object({
    name: z.string().describe("Patient full name"),
    email: z.string().email().describe("Patient email address"),
    phone: z.string().describe("Patient phone number"),
    appointmentType: z.enum(["general", "followup", "physical", "specialist"]),
    datetime: z.string().describe("Appointment date and time"),
    reason: z.string().describe("Reason for visit"),
  }),
  execute: async ({ name, email, phone, appointmentType, datetime, reason }) => {
    console.log("[v0] Booking appointment via backend:", { name, email, phone, appointmentType, datetime, reason })

    // Call backend API
    const result = await bookAppointmentAPI({
      name,
      email,
      phone,
      appointmentType,
      datetime,
      reason,
    })

    return result
  },
})

const cancelAppointment = tool({
  description: "Cancel an existing appointment",
  inputSchema: z.object({
    confirmationNumber: z.string().describe("Appointment confirmation number"),
    reason: z.string().optional().describe("Reason for cancellation"),
  }),
  execute: async ({ confirmationNumber, reason }) => {
    console.log("[v0] Cancelling appointment via backend:", confirmationNumber, reason)

    // Call backend API
    const result = await cancelAppointmentAPI(confirmationNumber, reason)

    return result
  },
})

const answerFAQ = tool({
  description:
    "Answer frequently asked questions about the medical practice using the knowledge base. Use this for questions about policies, insurance, location, hours, etc.",
  inputSchema: z.object({
    question: z.string().describe("The FAQ question to answer"),
  }),
  execute: async ({ question }) => {
    console.log("[v0] Searching FAQ knowledge base for:", question)

    // Use RAG to find relevant FAQs
    const relevantFAQs = searchFAQs(question, 3)

    if (relevantFAQs.length === 0) {
      return {
        answer:
          "I don't have specific information about that in our knowledge base. Please call our office at (555) 123-4567 for assistance, or you can visit our website for more details.",
        confidence: "low",
        sources: [],
      }
    }

    // Return the most relevant FAQ answer
    const topFAQ = relevantFAQs[0]

    return {
      answer: topFAQ.answer,
      confidence: "high",
      category: topFAQ.category,
      relatedQuestions: relevantFAQs.slice(1).map((faq) => faq.question),
      sources: relevantFAQs.map((faq) => ({ question: faq.question, category: faq.category })),
    }
  },
})

const systemPrompt = `You are a friendly and professional medical appointment scheduling assistant. Your role is to:

1. Help patients schedule medical appointments through natural conversation
2. Understand their needs and preferences
3. Suggest available time slots
4. Collect necessary information (name, email, phone, reason for visit)
5. Answer frequently asked questions using the knowledge base
6. Handle rescheduling and cancellation requests

CONVERSATION FLOW:
Phase 1 - Understanding Needs:
- Greet warmly and understand the reason for their visit
- Determine what type of appointment they need:
  * General Consultation (30 min) - routine checkups, minor issues
  * Follow-up (15 min) - post-treatment follow-ups
  * Physical Exam (45 min) - comprehensive physical examinations
  * Specialist Consultation (60 min) - complex cases requiring specialist

Phase 2 - Slot Recommendation:
- Ask about preferred dates/times
- Use the getAvailableSlots tool to fetch available slots
- Present 3-5 options clearly
- If none work, offer alternatives
- Be flexible and understanding

Phase 3 - Booking Confirmation:
- Collect: full name, email, phone number, reason for visit
- Confirm all details before booking
- Use bookAppointment tool to create the appointment
- Provide clear confirmation with appointment details

ANSWERING FAQs WITH RAG:
- When a patient asks a question (about insurance, location, hours, policies, etc.), use the answerFAQ tool
- The tool searches our knowledge base and returns accurate, up-to-date information
- Always provide the information from the knowledge base, don't make up details
- If the knowledge base doesn't have the answer, acknowledge it and provide contact information
- After answering an FAQ, ask if they'd like to schedule an appointment or have other questions

SEAMLESS CONTEXT SWITCHING:
- You can smoothly switch between scheduling and answering questions
- If someone asks about insurance while scheduling, use answerFAQ and then continue scheduling
- Remember the conversation context when switching between topics
- Example: "Great question about insurance! [answer from knowledge base] Now, shall we continue scheduling your appointment?"

IMPORTANT GUIDELINES:
- Be warm, empathetic, and professional
- Use clear, simple language
- Ask one question at a time
- Confirm understanding before proceeding
- Always use the answerFAQ tool for policy/practice questions rather than guessing
- Be patient with elderly or anxious patients
- Always verify information before booking

If asked about cancellations or rescheduling, help them through the process using appropriate tools.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: groq('qwen/qwen3-32b'),
    system: systemPrompt,
    prompt,
    stopWhen: stepCountIs(10),
    tools: {
      getAvailableSlots,
      bookAppointment,
      cancelAppointment,
      answerFAQ,
    },
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Stream aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}
