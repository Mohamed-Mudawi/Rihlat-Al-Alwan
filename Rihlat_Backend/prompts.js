export const q1Prompt = ({ expectedArabic, userAnswer }) => `
You are checking if the student's answer matches the correct Arabic color name.

Correct answers: ${expectedArabic.join(", ")}
Student answer: ${userAnswer}

Respond with ONLY ONE word: "correct" or "wrong".
If they say the pronunciation or have small spelling mistakes, consider it correct.
If they give another form of the word, consider it correct.
DO NOT explain, DO NOT add extra words.
`;

export const q2Prompt = ({ colorName, userAnswer }) => `
You are a teacher checking if the student's answer is a place or object that commonly matches the color "${colorName}".

Color: ${colorName}
Student answer: ${userAnswer}

Rules:
- If the place/object is something that usually has this color, respond ONLY with "correct".
- If it is not something with this color, respond ONLY with "wrong".
- DO NOT explain, DO NOT add extra words.
`;

export const q3Prompt = ({ forms, userAnswer, colorName }) => `
You are checking if a student's answer correctly includes the masculine and feminine forms of the Arabic color "${colorName}".

Correct answers:
Masculine: ${forms.masculine}
Feminine: ${forms.feminine}

Student answer:
"${userAnswer}"

Rules:
- If BOTH forms appear in the student's answer (allow small spelling mistakes), respond ONLY with "correct".
- If one or both are missing, respond ONLY with "wrong".
- DO NOT explain anything.
`;

export const chatPrompt = ({ conversationHistory, colorName, userAnswer }) => `
A user (arabic student) is having a conversation about the color ${colorName}.

Here is the conversation so far:
${conversationHistory}

Rules:
- Continue the conversation naturally in a friendly and educational tone.
- Only speak in english, you may use arabic pronunciations, but ONLY use ascii. This means NO bold text, NO arabic text, etc.
- Keep your answers SHORT and CONCISE. Do not exceed two sentences, and always aim for 1 sentence.

Now respond to the student's latest message:

Insert response ONLY in ascii text.
Do NOT mention the fact that you are a teacher or that they are a student.

Student: ${userAnswer}
Teacher:
`;