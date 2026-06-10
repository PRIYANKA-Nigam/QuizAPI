"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type QuizQuestion = {
  id: number
  question: string
  options: string[]
  answerIndex: number
}

export default function Home() {
  const [topic, setTopic] = useState("javascript")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generateQuiz() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/generateQuiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count: 3 }),
      })
      if (!res.ok) throw new Error("Failed to generate quiz")
      const data = await res.json()
      setQuestions(data.questions ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen justify-center font-sans">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-balance">
            generateQuiz
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Enter a topic and generate a quiz from the API route.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g. javascript, general)"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button onClick={generateQuiz} disabled={loading}>
            {loading ? "Generating..." : "Generate Quiz"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <ol className="flex flex-col gap-6">
          {questions.map((q, i) => (
            <li
              key={q.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4"
            >
              <p className="font-medium">
                {i + 1}. {q.question}
              </p>
              <ul className="flex flex-col gap-2">
                {q.options.map((opt, idx) => (
                  <li
                    key={idx}
                    className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </main>
    </div>
  )
}
