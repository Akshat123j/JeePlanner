import axios from 'axios';

export const generateSmartPlan = async (userEmail) => {
  try {
    // 1. Fetch all data from your backend
    const res = await axios.get(`http://127.0.0.1:5000/api/userdata/${userEmail}`);
    
    // Default tasks to an empty array just in case your backend doesn't send it yet
    const { profile, knowledgeGraph, tasks = [] } = res.data;

    // 2. Prepare the context for Gemini
    const prompt = `
      You are an expert Study Planner Agent for ${profile.exam}.
      Context:
      - Daily Limit: ${profile.dailyGoal} hours.
      - Weak Areas: Topics in Knowledge Graph with status 'Reviewing' or ease < 2.0.
      - Knowledge Graph: ${JSON.stringify(knowledgeGraph)}
      - Recent Performance: ${JSON.stringify(tasks.slice(0, 5))}
      
      Task:
      Generate a personalized 1-day study schedule. 
      Auto-rebalance: Prioritize 'Reviewing' topics over 'New' ones. 
      If recent tasks were 'pending', reduce the difficulty/length of today's tasks.
      
      Return ONLY a raw JSON array of objects. Do not use markdown blocks. 
      Format: [{"title": "Topic Name", "duration": "90 mins", "priority": "High", "reason": "Why this was picked"}]
    `;

    // 3. Call YOUR backend, NOT Google directly!
    const aiResponse = await axios.post(`http://127.0.0.1:5000/api/ask-ai`, {
      prompt: prompt
    });

    // 4. Clean the AI response to prevent JSON.parse crashes
    let rawText = aiResponse.data.answer;
    
    // Strip out markdown formatting if the AI ignores our instruction
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    // 5. Safely parse and return the JSON array
    return JSON.parse(rawText);

  } catch (error) {
    console.error("Error generating smart plan:", error);
    return []; // Return empty array so your UI doesn't crash
  }
};