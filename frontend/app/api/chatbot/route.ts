import { NextResponse } from "next/server";

import { answerChatbotQuestion } from "@/lib/chatbot-knowledge";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const question = typeof (body as { question?: unknown }).question === "string" ? (body as { question: string }).question : "";

  if (!question.trim()) {
    return NextResponse.json({ success: false, message: "Question is required" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: {
      answer: answerChatbotQuestion(question),
      source: "rule-database",
    },
  });
}
