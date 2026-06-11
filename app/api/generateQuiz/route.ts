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

Generate EXACTLY 10 questions.

Question Distribution:
- 7 Standard MCQ
- 2 Scenario-Based MCQ
- 1 Assertion/Reason MCQ

Return ONLY valid JSON.

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

console.log(
JSON.stringify(data,null,2)
);

if(data.error){
  return NextResponse.json(
    data,
    {
      status:500,
      headers:{
        "Access-Control-Allow-Origin":"*"
      }
    }
  );
}

if(
!data.candidates ||
!data.candidates[0]
){
  return NextResponse.json(
    {
      questions:[]
    },
    {
      headers:{
        "Access-Control-Allow-Origin":"*"
      }
    }
  );
}

const raw =
data.candidates[0]
.content.parts[0]
.text;
console.log(
"RAW GEMINI RESPONSE:"
);

console.log(raw);
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