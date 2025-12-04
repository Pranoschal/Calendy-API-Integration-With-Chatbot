"use client";

import type React from "react";
import getMessageDate from "@/lib/getMessage";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown"

export function ChatInterface() {
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "initial-msg-1",
          role: "assistant",
          parts: [
            {
              type: "text",
              text: "Hello! I'm your medical appointment scheduling assistant. I'm here to help you book an appointment with our doctors. How can I assist you today?",
            },
          ],
        },
      ]);
    }
  }, [messages.length, setMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || status === "streaming") return;

    sendMessage({ text: input });
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (text: string) => {
    if (status === "streaming") return;
    sendMessage({ text });
  };

  const renderToolResult = (toolName: string, toolResult: any) => {
    if (toolName === "getAvailableSlots" && toolResult.slots) {
      return (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium">Available time slots:</p>
          {toolResult.slots.map((slot: any, idx: number) => (
            <div
              key={idx}
              className="p-2 bg-background/50 rounded border border-border/50 text-sm"
            >
              <Calendar className="h-3 w-3 inline mr-2" />
              {slot.date} at {slot.time}
            </div>
          ))}
        </div>
      );
    }

    if (toolName === "bookAppointment" && toolResult.success) {
      return (
        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              Appointment Confirmed
            </p>
          </div>
          <div className="space-y-1 text-xs text-emerald-800 dark:text-emerald-200">
            <p>
              <strong>Confirmation #:</strong> {toolResult.confirmationNumber}
            </p>
            {toolResult.details && (
              <>
                <p>
                  <User className="h-3 w-3 inline mr-1" />
                  {toolResult.details.name}
                </p>
                <p>
                  <Mail className="h-3 w-3 inline mr-1" />
                  {toolResult.details.email}
                </p>
                <p>
                  <Phone className="h-3 w-3 inline mr-1" />
                  {toolResult.details.phone}
                </p>
                <p>
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {toolResult.details.datetime}
                </p>
              </>
            )}
          </div>
        </div>
      );
    }

    if (toolName === "cancelAppointment" && toolResult.success) {
      return (
        <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              {toolResult.message}
            </p>
          </div>
        </div>
      );
    }

    if (toolName === "answerFAQ" && toolResult.answer) {
      return (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              {toolResult.category && (
                <Badge variant="outline" className="mb-2 text-xs">
                  {toolResult.category}
                </Badge>
              )}
              <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                {toolResult.answer}
              </p>
              {toolResult.relatedQuestions &&
                toolResult.relatedQuestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Related questions:
                    </p>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      {toolResult.relatedQuestions.map(
                        (q: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <HelpCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{q}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-80 border-r border-border bg-card p-6 flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                MediSchedule
              </h1>
              <p className="text-xs text-muted-foreground">
                AI Appointment Assistant
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <Card className="p-4 border-l-4 border-l-teal-600">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground mb-1">
                  Quick & Easy
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Book appointments in minutes with our intelligent assistant
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-600">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground mb-1">
                  Personalized Care
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get appointment suggestions tailored to your needs
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground mb-1">
                  Instant Confirmation
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Receive immediate confirmation and reminders
                </p>
              </div>
            </div>
          </Card>

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-foreground mb-3">
              Quick Actions
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs bg-transparent"
                onClick={() =>
                  handleQuickAction("What insurance do you accept?")
                }
                disabled={status === "streaming"}
              >
                <HelpCircle className="h-3 w-3 mr-2" />
                Insurance Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs bg-transparent"
                onClick={() => handleQuickAction("What are your office hours?")}
                disabled={status === "streaming"}
              >
                <Clock className="h-3 w-3 mr-2" />
                Office Hours
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs bg-transparent"
                onClick={() =>
                  handleQuickAction("Where is your clinic located?")
                }
                disabled={status === "streaming"}
              >
                <Calendar className="h-3 w-3 mr-2" />
                Location
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Available 24/7 to help you schedule, reschedule, or cancel
            appointments
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Schedule Appointment
              </h2>
              <p className="text-sm text-muted-foreground">
                Chat with our AI assistant
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  status === "streaming"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-emerald-500"
                }`}
              ></div>
              <span className="text-sm text-muted-foreground">
                {status === "streaming" ? "Thinking..." : "Online"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar
                  className={`h-8 w-8 ${
                    message.role === "user" ? "bg-blue-600" : "bg-teal-600"
                  }`}
                >
                  <AvatarFallback className="text-white text-xs">
                    {message.role === "user" ? "You" : "AI"}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex flex-col gap-1 max-w-[70%] ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <Card
                    className={`p-4 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-card border-border"
                    }`}
                  >
                    {message.parts.map((part, idx) => {
                      if (part.type === "text") {
                        return (
                          <ReactMarkdown
                            key={idx}
                            // className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            //   message.role === "user"
                            //     ? "text-white"
                            //     : "text-foreground"
                            // }`}
                          >
                            {part.text}
                          </ReactMarkdown>
                        );
                      }

                      if (
                        "toolName" in part &&
                        part.state === "output-available"
                      ) {
                        return (
                          <div key={idx}>
                            {renderToolResult(part.toolName, part.output)}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </Card>
                  <span className="text-xs text-muted-foreground px-1">
                    {getMessageDate(message).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {status === "streaming" && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-teal-600">
                  <AvatarFallback className="text-white text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <Card className="p-4 bg-card">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 bg-background"
                disabled={status === "streaming"}
              />
              <Button
                onClick={handleSendMessage}
                disabled={status === "streaming" || !input.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Our AI can help with scheduling,
              rescheduling, and FAQs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
