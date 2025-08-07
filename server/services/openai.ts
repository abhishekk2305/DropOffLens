import OpenAI from "openai";
import { randomUUID } from "crypto";
import { type FeedbackTheme, type AnalysisResults } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function analyzeFeedbackWithAI(feedbackEntries: string[]): Promise<AnalysisResults> {
  const startTime = Date.now();
  
  const prompt = `Analyze the following customer exit feedback and identify the top 3-6 common themes for why customers are leaving. For each theme, provide:

1. A clear theme name
2. A summary of the issue
3. The percentage of feedback that relates to this theme
4. 1-2 representative user quotes from the feedback
5. A specific suggested product action to address this theme

Feedback entries:
${feedbackEntries.map((entry, index) => `${index + 1}. ${entry}`).join('\n')}

Respond with JSON in this exact format:
{
  "themes": [
    {
      "name": "Theme Name",
      "summary": "Detailed summary of the issue",
      "percentage": 42,
      "quotes": ["Representative quote 1", "Representative quote 2"],
      "suggestedAction": "Specific actionable recommendation"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert customer feedback analyst. Analyze feedback to identify key churn themes and provide actionable insights. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const processingTime = (Date.now() - startTime) / 1000;

    // Validate and format the response
    const themes: FeedbackTheme[] = (result.themes || []).map((theme: any) => ({
      id: randomUUID(),
      name: theme.name,
      summary: theme.summary,
      percentage: theme.percentage,
      quotes: theme.quotes || [],
      suggestedAction: theme.suggestedAction,
      isEdited: false,
    }));
    
    // Ensure percentages add up reasonably and quotes are from actual feedback
    themes.forEach(theme => {
      // Validate quotes are actually from the feedback
      theme.quotes = theme.quotes.filter((quote: string) => 
        feedbackEntries.some(entry => 
          entry.toLowerCase().includes(quote.toLowerCase()) || 
          quote.toLowerCase().includes(entry.toLowerCase())
        )
      );
      
      // Ensure we have at least one quote per theme
      if (theme.quotes.length === 0) {
        // Find a representative quote from the feedback
        const relatedEntry = feedbackEntries.find(entry => 
          entry.toLowerCase().includes(theme.name.toLowerCase()) ||
          theme.summary.toLowerCase().includes(entry.toLowerCase().substring(0, 20))
        );
        if (relatedEntry) {
          theme.quotes = [relatedEntry];
        }
      }
    });

    return {
      themes,
      totalFeedback: feedbackEntries.length,
      themesFound: themes.length,
      processingTime
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error(`Failed to analyze feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
