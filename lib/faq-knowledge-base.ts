// FAQ Knowledge Base for RAG
export const faqKnowledgeBase = [
  {
    id: "insurance-1",
    category: "Insurance",
    question: "What insurance plans do you accept?",
    answer:
      "We accept most major insurance plans including Blue Cross Blue Shield, Aetna, UnitedHealthcare, Cigna, Humana, Medicare, and Medicaid. We also work with many regional insurance providers. Please contact our billing department at (555) 123-4567 to verify your specific plan coverage.",
    keywords: [
      "insurance",
      "plans",
      "coverage",
      "accept",
      "blue cross",
      "aetna",
      "united",
      "cigna",
      "medicare",
      "medicaid",
    ],
  },
  {
    id: "location-1",
    category: "Location & Facilities",
    question: "Where is your clinic located?",
    answer:
      "Our main clinic is located at 123 Medical Center Drive, Suite 200, Springfield, IL 62701. We have ample free parking available in the lot directly in front of the building. The clinic is wheelchair accessible with elevators to all floors.",
    keywords: ["location", "address", "where", "parking", "directions", "accessible", "wheelchair"],
  },
  {
    id: "hours-1",
    category: "Hours & Availability",
    question: "What are your office hours?",
    answer:
      "Our regular office hours are Monday through Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 2:00 PM. We are closed on Sundays and major holidays. For urgent medical needs after hours, please call our emergency line at (555) 987-6543.",
    keywords: ["hours", "open", "closed", "schedule", "time", "weekend", "saturday", "sunday", "holiday"],
  },
  {
    id: "preparation-1",
    category: "Appointment Preparation",
    question: "How should I prepare for my appointment?",
    answer:
      "Please arrive 15 minutes early to complete any necessary paperwork. Bring your insurance card, photo ID, and a list of current medications including dosages. If you have recent lab results or imaging from another provider, please bring those as well. Fasting may be required for certain blood tests - we will notify you in advance if this applies to you.",
    keywords: [
      "prepare",
      "preparation",
      "bring",
      "documents",
      "insurance card",
      "medications",
      "fasting",
      "lab",
      "early",
    ],
  },
  {
    id: "cancellation-1",
    category: "Cancellation Policy",
    question: "What is your cancellation policy?",
    answer:
      "We require at least 24 hours advance notice for cancellations or rescheduling. Cancellations made with less than 24 hours notice, or missed appointments without notification, may incur a $50 fee. We understand emergencies happen - please call us as soon as possible if you need to cancel.",
    keywords: ["cancel", "cancellation", "reschedule", "policy", "notice", "fee", "missed", "no-show"],
  },
  {
    id: "telemedicine-1",
    category: "Telemedicine",
    question: "Do you offer telemedicine appointments?",
    answer:
      "Yes, we offer secure video telemedicine appointments for follow-ups, medication management, minor illness consultations, and mental health visits. Telemedicine is available Monday through Friday during regular business hours. Initial consultations and physical exams typically require in-person visits.",
    keywords: ["telemedicine", "virtual", "video", "online", "remote", "telehealth", "video call", "zoom"],
  },
  {
    id: "newpatient-1",
    category: "New Patients",
    question: "What should I expect as a new patient?",
    answer:
      "New patients should arrive 30 minutes before their scheduled appointment to complete registration forms. You will need to provide insurance information, medical history, current medications, and emergency contacts. Your first visit will typically include a comprehensive health assessment and discussion of your medical needs and goals.",
    keywords: ["new patient", "first visit", "registration", "forms", "first time", "initial"],
  },
  {
    id: "prescriptions-1",
    category: "Prescriptions",
    question: "How do I request prescription refills?",
    answer:
      "You can request prescription refills through our patient portal, by calling our office at (555) 123-4567, or by having your pharmacy contact us directly. Please allow 48 hours for refill requests to be processed. For urgent medication needs, please call our office directly.",
    keywords: ["prescription", "refill", "medication", "pharmacy", "medicine", "drugs", "rx"],
  },
  {
    id: "records-1",
    category: "Medical Records",
    question: "How can I access my medical records?",
    answer:
      "You can access your medical records 24/7 through our secure patient portal. To request paper copies or transfer records to another provider, please complete a medical records release form available on our website or at the front desk. There may be a small processing fee for extensive record requests.",
    keywords: ["medical records", "records", "portal", "patient portal", "access", "transfer", "release"],
  },
  {
    id: "payment-1",
    category: "Billing & Payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, checks, credit cards (Visa, Mastercard, American Express, Discover), and HSA/FSA cards. Payment is expected at the time of service. We also offer payment plans for larger balances - please speak with our billing department to arrange a payment plan.",
    keywords: ["payment", "billing", "cost", "pay", "credit card", "insurance", "copay", "price", "fee"],
  },
  {
    id: "specialists-1",
    category: "Specialists & Referrals",
    question: "How do I get a referral to a specialist?",
    answer:
      "If your insurance requires a referral, your doctor will submit it electronically after your appointment. You will receive a copy via the patient portal and we will coordinate with the specialist office. Most referrals are processed within 1-2 business days. If you have questions about your referral status, please contact our referral coordinator.",
    keywords: ["referral", "specialist", "refer", "coordination", "authorization"],
  },
  {
    id: "wait-1",
    category: "Wait Times",
    question: "How long are typical wait times?",
    answer:
      "We strive to see patients within 15 minutes of their scheduled appointment time. Occasionally, emergencies or complex cases may cause delays. We will keep you informed if your appointment is running late. Same-day urgent appointments may have longer wait times but we make every effort to see urgent cases as quickly as possible.",
    keywords: ["wait", "waiting", "delay", "late", "on time", "schedule"],
  },
]

// Simple embedding-like search using keyword matching
// In production, you would use actual embeddings with a vector database
export function searchFAQs(query: string, limit = 3): typeof faqKnowledgeBase {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/)

  // Score each FAQ based on keyword matches
  const scoredFAQs = faqKnowledgeBase.map((faq) => {
    let score = 0

    // Check for exact phrase match in question or answer
    if (faq.question.toLowerCase().includes(queryLower)) {
      score += 100
    }
    if (faq.answer.toLowerCase().includes(queryLower)) {
      score += 50
    }

    // Check for keyword matches
    faq.keywords.forEach((keyword) => {
      if (queryLower.includes(keyword)) {
        score += 10
      }
      queryWords.forEach((word) => {
        if (keyword.includes(word) && word.length > 2) {
          score += 5
        }
      })
    })

    return { ...faq, score }
  })

  // Sort by score and return top results
  return scoredFAQs
    .filter((faq) => faq.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Get FAQ context for RAG prompt
export function getFAQContext(query: string): string {
  const relevantFAQs = searchFAQs(query, 3)

  if (relevantFAQs.length === 0) {
    return "No specific FAQ information found for this query."
  }

  return relevantFAQs
    .map((faq, idx) => `FAQ ${idx + 1} [${faq.category}]:\nQ: ${faq.question}\nA: ${faq.answer}`)
    .join("\n\n")
}
