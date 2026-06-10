export default async function handler(req, res) {
  res.status(200).json({
    questions: [
      {
        type: "mcq",
        question: "Test Question",
        options: ["A", "B", "C", "D"],
        answer: "A",
      },
    ],
  });
}
