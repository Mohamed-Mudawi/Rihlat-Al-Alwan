import { GoogleGenerativeAI } from "@google/generative-ai"; // Importing Google Gemini library

// Gemini Client Initialization function
function getClient() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not set in environment variables");
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Colors dictionary
const arabicColors = {
    red: ["أحمر"],
    blue: ["أزرق"],
    green: ["أخضر"],
    yellow: ["أصفر"],
    purple: ["بنفسجي"],
    orange: ["برتقالي"]
};
// Colors forms dictionary
const colorForms = {
    red: {
        masculine: "أحمر",
        feminine: "حمراء"
    },
    blue: {
        masculine: "أزرق",
        feminine: "زرقاء"
    },
    green: {
        masculine: "أخضر",
        feminine: "خضراء"
    },
    yellow: {
        masculine: "أصفر",
        feminine: "صفراء"
    },
    purple: {
        masculine: "بنفسجي",
        feminine: "بنفسجية"
    },
    orange: {
        masculine: "برتقالي",
        feminine: "برتقالية"
    }
};


// startConversation Function
export async function startConversation(req, res) {
    const { colorName, sessionId } = req.body;

    return res.json({
        stage: "Q1",
        message: "What is this color in Arabic?",
        colorName,
        sessionId,
    });
}

// Handler for first stage Q1
async function handleQ1(userAnswer, colorName, sessionId, res) {
    try {
        const client = getClient();
        const expectedArabic = arabicColors[colorName];

        if (!expectedArabic) {
            return res.status(400).json({ error: `Invalid color: ${colorName}. Use: red, blue, green, yellow, purple, or orange.` });
        }

        const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(`
You are checking if the student's answer matches the correct Arabic color name.

Correct answers: ${expectedArabic.join(", ")}
Student answer: ${userAnswer}

Respond with ONLY ONE word: "correct" or "wrong".
If they say the pronounciation or have small spelling mistakes, consider it correct.
If they give another form of the word, consider it correct.
DO NOT explain, DO NOT add extra words.
`);

        const response = await result.response;
        const text = response.text().trim().toLowerCase();

        if (text === "correct") {
            return res.json({
                stage: "Q2",
                correct: true,
                message: `Great! Can you give me examples of where you see the color ${colorName}?`,
                sessionId,
                colorName
            });
        }

        // Wrong answer, so help the student
        return res.json({
            stage: "Q1",
            correct: false,
            message: `Try again! How do we say ${colorName} in Arabic?`,
            sessionId,
            colorName
        });
    } catch (err) {
        console.error("Error in handleQ1:", err);
        return res.status(500).json({ error: "Failed to process your answer. Please try again." });
    }
}

// Handler for second stage Q2
async function handleQ2(userAnswer, colorName, sessionId, res) {
    try {
        const client = getClient();
        const expectedArabic = arabicColors[colorName];

        if (!expectedArabic) {
            return res.status(400).json({ error: `Invalid color: ${colorName}. Use: red, blue, green, yellow, purple, or orange.` });
        }

        const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(`
You are a teacher checking if the student's answer is a place or object that commonly matches the color "${colorName}".

Color: ${colorName}
Student answer: ${userAnswer}

Rules:
- If the place/object is something that usually has this color, respond ONLY with "correct".
- If it is not something with this color, respond ONLY with "wrong".
- DO NOT explain, DO NOT add extra words.
`);

        const response = await result.response;
        const text = response.text().trim().toLowerCase();

        if (text === "correct") {
            return res.json({
                stage: "Q3",
                correct: true,
                message: `Great! Now tell me the different forms (masculine, feminine) of this color in Arabic.`,
                sessionId,
                colorName
            });
        }

        // Wrong answer → try again
        return res.json({
            stage: "Q2",
            correct: false,
            message: `Try again. That doesn't usually have the color ${colorName}`,
            sessionId,
            colorName
        });
    } catch (err) {
        console.error("Error in handleQ2:", err);
        return res.status(500).json({ error: "Failed to process your answer. Please try again." });
    }
}

// Handler for third stage Q3
async function handleQ3(userAnswer, colorName, sessionId, res) {
    try {
        const client = getClient();
        const forms = colorForms[colorName];

        if (!forms) {
            return res.status(400).json({ error: `Invalid color: ${colorName}. Use: red, blue, green, yellow, purple, or orange.` });
        }

        const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(`
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
`);

        const response = await result.response;
        const text = response.text().trim().toLowerCase();

        if (text === "correct") {
            // Move directly into the chat/continue stage after Q3
            return res.json({
                stage: "continue",
                correct: true,
                message: `Great! Let's keep talking about ${colorName}. What else would you like to know?`,
                sessionId,
                colorName
            });
        }

        return res.json({
            stage: "Q3",
            correct: false,
            message: `Try again. What are the masculine and feminine forms of ${colorName} in Arabic?`,
            sessionId,
            colorName
        });
    } catch (err) {
        console.error("Error in handleQ3:", err);
        return res.status(500).json({ error: "Failed to process your answer. Please try again." });
    }
}

// When past Q4, and want to chat more about same color
async function handleChat(userAnswer, colorName, sessionId, history = [], res) {
    try {
        const client = getClient();

        const conversationHistory = history
            .map(msg => `${msg.role}: ${msg.text}`)
            .join("\n");

        const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(`
A user (arabic student) is having a conversation about the color ${colorName}.

Here is the conversation so far:
${conversationHistory}

Continue the conversation naturally in a friendly and educational tone.
Only speak in english, you may use arabic pronunciations, but only use ascii.

Now respond to the student's latest message:

Insert response ONLY in ascii text.
Do NOT mention the fact that you are a teacher or that they are a student.

Student: ${userAnswer}
Teacher:
`);

        const response = await result.response;
        const text = response.text();

        return res.json({
            stage: "continue",
            message: text,
            sessionId,
            colorName
        });
    } catch (err) {
        console.error("Error in handleChat:", err);
        return res.status(500).json({ error: "Failed to process your message. Please try again." });
    }
}


// continueConversation Function
export async function continueConversation(req, res) {
    const { stage, userAnswer, colorName, sessionId, history = [] } = req.body;

    // Determine which stage
    if (stage === "Q1") {
        return handleQ1(userAnswer, colorName, sessionId, res);
    }
    if (stage === "Q2") {
        return handleQ2(userAnswer, colorName, sessionId, res);
    }
    if (stage === "Q3") {
        return handleQ3(userAnswer, colorName, sessionId, res);
    }
    if (stage === "continue") {
        return handleChat(userAnswer, colorName, sessionId, history, res);
    }
    return res.json({
        message: "Invalid stage.",
    });
}

