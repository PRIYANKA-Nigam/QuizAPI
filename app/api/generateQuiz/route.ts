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
  const existingQuestions =
body.existingQuestions || [];
  const prompt = `
Create a quiz from the article below.

Generate new questions.

Create maximum 10 additional high quality questions.

Important rules:

- Existing questions are already stored.
- Do NOT repeat existing questions.
- Do NOT create similar questions with changed wording.
- Test different concepts.
- If no new useful questions can be created, return empty array.

Question Distribution:

- 70% Standard MCQ
- 20% Scenario-Based MCQ
- 10% Assertion/Reason MCQ

Return only JSON.

Format:

{
 "questions":[
  {
   "type":"mcq",
   "question":"",
   "options":["","","",""],
   "answer":""
  }
 ]
}


Existing Questions:

${JSON.stringify(existingQuestions)}


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