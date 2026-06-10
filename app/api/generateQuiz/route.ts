import { NextResponse } from "next/server"

type QuizQuestion = {
  id: number
  question: string
  options: string[]
  answerIndex: number
}

// Simple in-memory question bank used to assemble a quiz.
const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  general: [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      answerIndex: 2,
    },
    {
      id: 2,
      question: "How many continents are there on Earth?",
      options: ["5", "6", "7", "8"],
      answerIndex: 2,
    },
    {
      id: 3,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      answerIndex: 1,
    },
  ],
  javascript: [
    {
      id: 1,
      question: "Which keyword declares a block-scoped variable?",
      options: ["var", "let", "function", "global"],
      answerIndex: 1,
    },
    {
      id: 2,
      question: "What does '===' check for in JavaScript?",
      options: [
        "Value only",
        "Type only",
        "Value and type",
        "Reference only",
      ],
      answerIndex: 2,
    },
    {
      id: 3,
      question: "Which method converts a JSON string to an object?",
      options: [
        "JSON.stringify()",
        "JSON.parse()",
        "JSON.toObject()",
        "Object.fromJSON()",
      ],
      answerIndex: 1,
    },
  ],
}

function buildQuiz(topic: string, count: number) {
  const key = topic.toLowerCase().trim()
  const pool = QUESTION_BANK[key] ?? QUESTION_BANK.general
  return pool.slice(0, Math.min(count, pool.length))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const topic = searchParams.get("topic") ?? "general"
  const count = Number(searchParams.get("count") ?? "3")

  const questions = buildQuiz(topic, Number.isFinite(count) ? count : 3)

  return NextResponse.json({
    topic,
    count: questions.length,
    questions,
  })
}

export async function POST(request: Request) {
  let body: { topic?: string; count?: number } = {}
  try {
    body = await request.json()
  } catch {
    // ignore malformed body, fall back to defaults
  }

  const topic = body.topic ?? "general"
  const count = typeof body.count === "number" ? body.count : 3

  const questions = buildQuiz(topic, count)

  return NextResponse.json({
    topic,
    count: questions.length,
    questions,
  })
}
