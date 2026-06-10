export default async function handler(req, res) {

  try {

    const article = req.body.article;

    if (!article) {
      return res.status(400).json({
        error: "Article text missing"
      });
    }
const words = article.split(" ").length;

let questionCount = 10;

if(words > 1000) questionCount = 20;
if(words > 2500) questionCount = 30;
if(words > 5000) questionCount = 50;
    const prompt = `
Create a professional technical quiz from the article below.Questions should resemble certification,
placement and technical interview questions.
Generate as many meaningful questions as possible.

Maximum 50 questions.

Stop when no additional high-quality questions can be created.

Do not create repetitive questions.

not simple memorization.

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

JSON format:

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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
        })
      }
    );

    const data = await response.json();

    const raw =
      data.candidates[0]
      .content.parts[0]
      .text;

    const clean =
      raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const quiz =
      JSON.parse(clean);

    return res.status(200).json(quiz);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });

  }

}