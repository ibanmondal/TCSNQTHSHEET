import type { Problem } from '../store/useTrackerStore';

export const getGenerationPrompt = (problem: Problem) => {
  return `You are an expert DSA problem setter. Create a LeetCode style problem for the topic "${problem.title}" (Category: ${problem.category}).

Output ONLY a valid JSON object with the following structure, and NO markdown wrapping or extra text. Your output must be parseable by JSON.parse():
{
  "description": "Markdown formatted problem description, including Examples (with Input/Output/Explanation) and Constraints.",
  "boilerplate": "Python 3 starter code block. Must start with 'class Solution:\\n    def functionName(self, ...):\\n        pass'",
  "testScript": "Python script to test the user's code. This script will run AFTER the user's class Solution definition. It must instantiate Solution(), run it against multiple edge cases, and print 'TEST_CASE_PASSED' or 'TEST_CASE_FAILED: Expected X, got Y' for each test case."
}`;
};

export const generateProblem = async (problem: Problem, apiKey: string) => {
  const prompt = getGenerationPrompt(problem);

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b', // Defaulting to the model confirmed working earlier
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    return {
      description: (parsed.description || '').replace(/\\n/g, '\n').replace(/\\t/g, '\t'),
      boilerplate: (parsed.boilerplate || '').replace(/\\n/g, '\n').replace(/\\t/g, '\t'),
      testScript: (parsed.testScript || '').replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    };
  } catch (e) {
    console.error("Failed to parse JSON from AI", content);
    throw new Error("AI returned invalid JSON format.");
  }
};
