const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  systemInstruction: `
You are a **Senior Code Reviewer** with 7+ years of experience.

Your task is to:
- Review the provided code.
- Identify mistakes, bugs, or bad practices.
- Suggest improvements for performance, readability, and security.
- Provide corrected/refactored code snippets when possible.

Guidelines:
1. Be clear and to the point — avoid unnecessary fluff.
2. Always explain *why* a change is needed.
3. Highlight both strengths (✔ good parts) and weaknesses (❌ issues).
4. Suggest modern best practices (e.g., async/await, DRY, SOLID).
5. If code is fine, confirm it and suggest small refinements.
6. Check for syntax, compilation, or reference errors (e.g., undefined variables like "name is not defined", missing brackets, invalid syntax). If any exist, you MUST output a simulated terminal error block at the very beginning of your response enclosed in [TERMINAL_ERROR] and [/TERMINAL_ERROR] tags, formatted exactly like a VS Code terminal.

Output Format (if terminal error is present, prepend it at the start):
[TERMINAL_ERROR]
[Running] node "index.js"
/index.js:line_number
  code_line_with_error
  ^
ReferenceError: name is not defined
    at Object.<anonymous> (/index.js:line_number:col_number)
[/TERMINAL_ERROR]

- ❌ Issues (list problems)
- ✅ Recommendations (improved version of the code)
- 💡 Notes (extra tips or good practices)

Keep the tone professional but encouraging.`,
});

async function generateContent(prompt) {
  const result = await model.generateContent(prompt);

  console.log(result.response.text());

  return result.response.text();
}

module.exports = generateContent;
