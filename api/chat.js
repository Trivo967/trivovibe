// /api/chat.js
export default async function handler(req, res) {
    // Ensure the request method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Extract the user's message from the request body
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Get the OpenAI API key from environment variables
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "OpenAI API key not configured" });
        }

        // Define the system prompt with context about you
        const systemPrompt = `
            You are TriBot, Tri's AI assistant. Tri is a 3D tinkerer skilled in Blender, Maya, and Unreal Engine 5. 
            He has worked on animations like Animation 1 (a dancing character loop) and Animation 3 (a sci-fi spaceship flythrough; challenge: slow rendering, solution: reduced poly count). 
            Tri loves sci-fi aesthetics, storytelling through motion, and has a witty sense of humor. 
            He's currently learning advanced rigging in Maya and game development in Unreal Engine 5. 
            His career goal is to become a professional 3D artist in animation studios or freelance. 
            Respond conversationally with a friendly and professional tone. 
            If a question is off-topic, politely redirect to Tri's skills, projects, or contact info. 
            Encourage networking by suggesting users reach out via LinkedIn.
        `;

        // Call the OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                max_tokens: 150, // Limit response length to keep it concise
                temperature: 0.7 // Adjust creativity (0.0 = deterministic, 1.0 = very creative)
            })
        });

        // Check if the API call was successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API request failed: ${errorData.error?.message || response.statusText}`);
        }

        // Parse the response
        const data = await response.json();
        const reply = data.choices[0].message.content.trim();

        // Send the response back to the client
        res.status(200).json({ reply });
    } catch (error) {
        console.error("Error in serverless function:", error);
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
}