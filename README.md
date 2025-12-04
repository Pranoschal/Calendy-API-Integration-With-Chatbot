# Medical Appointment Scheduling Agent

An intelligent conversational AI agent that helps patients schedule medical appointments through natural language conversations, powered by Calendly integration, Next.js, Flask, and the Vercel AI SDK.

## Features

### Core Functionality
- **Intelligent Conversation Flow**: Natural, context-aware dialogues that guide patients through scheduling
- **Calendly Integration**: Real-time availability checking and appointment booking
- **Multiple Appointment Types**:
  - General Consultation (30 min)
  - Follow-up (15 min)
  - Physical Exam (45 min)
  - Specialist Consultation (60 min)
- **Smart Slot Suggestions**: AI recommends 3-5 available slots based on patient preferences
- **FAQ System with RAG**: Knowledge base covering 12+ common questions about insurance, location, hours, policies, etc.
- **Seamless Context Switching**: Smoothly handles both scheduling and FAQ questions in one conversation
- **Appointment Management**: Book, reschedule, and cancel appointments

### Technical Features
- **AI-Powered**: Uses Vercel AI SDK v5 with OpenAI GPT-5 for intelligent conversations
- **Tool Calling**: Advanced function calling for fetching slots, booking, cancellation, and FAQ retrieval
- **RAG (Retrieval Augmented Generation)**: Keyword-based FAQ search (upgradeable to embeddings)
- **Responsive Design**: Beautiful, healthcare-themed UI with Tailwind CSS
- **Real-time Updates**: Streaming responses for immediate feedback
- **Fallback Handling**: Graceful degradation when backend is unavailable

## Tech Stack

### Frontend (Next.js)
- Next.js 16 with App Router
- React 19.2
- TypeScript
- Tailwind CSS v4
- Vercel AI SDK v5 (@ai-sdk/react)
- shadcn/ui components

### Backend (Flask)
- Flask 3.0
- Flask-CORS
- Requests library for Calendly API
- Python 3.10+

### APIs & Integrations
- Calendly API v2
- Vercel AI Gateway (OpenAI GPT-5)
- RAG Knowledge Base

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.10+
- Calendly account with API access
- Vercel account (for AI Gateway)

### Installation

#### 1. Clone and Install Dependencies

\`\`\`bash
# Install Next.js frontend dependencies
npm install

# Install Flask backend dependencies
cd backend
pip install -r requirements.txt
\`\`\`

#### 2. Configure Environment Variables

Create \`.env.local\` in the root directory:

\`\`\`env
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
GROQ_API_KEY=your-groq-api-key
\`\`\`

Create \`.env\` in the \`backend\` directory:

\`\`\`env
CALENDLY_API_TOKEN=your_calendly_personal_access_token
CALENDLY_USER_URI=https://api.calendly.com/users/YOUR_USER_ID
\`\`\`

#### 3. Get Calendly API Credentials And Groq API Key

1. Go to https://calendly.com/integrations/api_webhooks
2. Generate a Personal Access Token
3. Get your user URI from the API response or Calendly dashboard
4. Update the \`.env\` file in the backend directory

#### 4. Start the Servers

**Terminal 1 - Flask Backend:**
\`\`\`bash
cd backend
python app.py
# Server runs on http://localhost:5000
\`\`\`

**Terminal 2 - Next.js Frontend:**
\`\`\`bash
npm run dev
# App runs on http://localhost:3000
\`\`\`

#### 5. Open the Application

Navigate to http://localhost:3000 in your browser.

## Usage

### Scheduling an Appointment

1. Start by telling the assistant what you need: "I'd like to book an appointment"
2. Answer questions about:
   - Type of appointment needed
   - Preferred date/time
   - Contact information (name, email, phone)
   - Reason for visit
3. Review available time slots
4. Confirm your appointment

### Asking Questions

Use the quick action buttons or ask naturally:
- "What insurance do you accept?"
- "What are your office hours?"
- "Where is your clinic located?"
- "What's your cancellation policy?"

### Canceling/Rescheduling

- "I need to cancel my appointment APPT-123456"
- "Can I reschedule my appointment?"

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI conversation endpoint with tool calling
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main page
│   └── globals.css                # Global styles with healthcare theme
├── components/
│   ├── chat-interface.tsx         # Main chat UI component
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── calendly-api.ts            # Flask backend API client
│   └── faq-knowledge-base.ts      # RAG knowledge base
├── backend/
│   ├── app.py                     # Flask server with Calendly integration
│   ├── requirements.txt           # Python dependencies
│   └── README.md                  # Backend-specific docs
└── README.md                      # This file
\`\`\`

## API Endpoints

### Flask Backend

- \`GET /api/health\` - Health check
- \`GET /api/appointment-types\` - Get available appointment types
- \`GET /api/event-types\` - Get Calendly event types
- \`POST /api/available-times\` - Get available time slots
- \`POST /api/schedule-appointment\` - Book an appointment
- \`GET /api/scheduled-events\` - Get all scheduled events
- \`POST /api/cancel-appointment\` - Cancel an appointment

### Next.js Frontend

- \`POST /api/chat\` - AI conversation endpoint with tool calling

## AI Agent Architecture

### Conversation Phases

**Phase 1: Understanding Needs**
- Greeting and context gathering
- Determining appointment type
- Understanding urgency

**Phase 2: Slot Recommendation**
- Collecting date/time preferences
- Fetching available slots from Calendly
- Suggesting top 3-5 options
- Handling "none work" scenarios

**Phase 3: Booking Confirmation**
- Collecting patient information
- Confirming all details
- Creating appointment via Calendly
- Providing confirmation number

### Tool Calling

The AI agent has access to 4 tools:

1. **getAvailableSlots**: Fetches real-time availability from Calendly
2. **bookAppointment**: Creates appointments via Calendly API
3. **cancelAppointment**: Cancels existing appointments
4. **answerFAQ**: Searches knowledge base using RAG

### RAG System

The FAQ knowledge base covers:
- Insurance plans and coverage
- Location and directions
- Office hours
- Appointment preparation
- Cancellation policy
- Telemedicine options
- New patient process
- Prescription refills
- Medical records access
- Billing and payment
- Specialist referrals
- Wait times

## Customization

### Adding More FAQs

Edit \`lib/faq-knowledge-base.ts\` and add new entries to the \`faqKnowledgeBase\` array:

\`\`\`typescript
{
  id: 'unique-id',
  category: 'Category Name',
  question: 'The question',
  answer: 'The detailed answer',
  keywords: ['keyword1', 'keyword2']
}
\`\`\`

### Changing Appointment Types

Edit \`backend/app.py\` and update the \`APPOINTMENT_TYPES\` dictionary.

### Customizing the AI Behavior

Edit the \`systemPrompt\` in \`app/api/chat/route.ts\` to adjust the agent's personality and conversation flow.

### Styling

The healthcare theme uses calming blue and teal colors. Edit \`app/globals.css\` to customize colors via CSS variables.

## Deployment

### Deploy to Vercel

\`\`\`bash
vercel deploy
\`\`\`

### Deploy Flask Backend

The Flask backend can be deployed to:
- Railway
- Render
- Heroku
- AWS/GCP/Azure

Update \`NEXT_PUBLIC_FLASK_API_URL\` environment variable in Vercel with your deployed backend URL.

## Future Enhancements

- [ ] Upgrade RAG to use vector embeddings (Pinecone/Weaviate)
- [ ] Add SMS reminders via Twilio
- [ ] Email confirmations with calendar invites
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Patient history tracking
- [ ] Insurance verification integration
- [ ] Waitlist management
- [ ] Admin dashboard for appointment management

## Troubleshooting

### Backend Connection Issues

If the frontend can't connect to Flask:
1. Ensure Flask is running on port 5000
2. Check CORS is enabled in Flask
3. Verify \`NEXT_PUBLIC_FLASK_API_URL\` is set correctly
4. Check browser console for errors

### Calendly API Issues

1. Verify your API token is valid
2. Check your user URI is correct
3. Ensure your Calendly account has active event types
4. Review Flask logs for API error messages

### AI Agent Not Responding

1. Check Vercel AI Gateway is working
2. Review browser console for errors
3. Check network tab for failed API calls
4. Ensure you're using a supported model

## License

MIT

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@yourcompany.com
- Phone: (555) 123-4567
\`\`\`
