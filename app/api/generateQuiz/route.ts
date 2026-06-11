import { NextResponse } from "next/server";
console.log("ROUTE TS EXECUTED");
export async function OPTIONS() {
  return NextResponse.json(
    {source: "route-ts"},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

export async function POST(request: Request) {

  const body = await request.json();

if(!body.article){
  return NextResponse.json(
    {
      error:"article missing"
    },
    {
      status:400,
      headers:{
        "Access-Control-Allow-Origin":"*"
      }
    }
  );
}
  const article = body.article; 
  const prompt = `
Create a quiz from the article below.
Generate as many meaningful questions as possible.
Maximum 50 questions.
Stop when no additional high-quality questions can be created.

Do not create repetitive questions.
Avoid duplicate or trivial questions.

Question Distribution:

- 70% Standard MCQ
- 20% Scenario-Based MCQ
- 10% Assertion/Reason MCQ
Rules:

1. Questions must test understanding, not word memorization.
2. Avoid trivial keyword-based questions.
3. Use concepts explained in the article.
4. Include plausible distractors.
5. Only one correct answer.
6. Difficulty distribution:
   - Easy 30%
   - Medium 50%
   - Hard 20%
7. Return ONLY valid JSON.
8. Do not include explanations.

Format:

{
  "questions":[
    {
      "type":"mcq",
      "question":"Question text",
      "options":[
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer":"Correct Option"
    }
  ]
}

Article:

${article}
`;
  console.log(process.env.GEMINI_API_KEY);

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
     body: JSON.stringify({
  contents: [
    {
      parts: [
        {
          text: prompt
        }
      ]
    }
  ]
}),
    }
  );

 const data = await response.json();

const raw =
data.candidates[0]
.content.parts[0]
.text;

const clean =
raw
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();
console.log(raw);
const quiz =
JSON.parse(clean);

return NextResponse.json(
  quiz,
  {
    headers:{
      "Access-Control-Allow-Origin":"*"
    }
  }
);
}