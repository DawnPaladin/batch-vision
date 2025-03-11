import { Handlers } from "$fresh/server.ts";
import { JsonSchema } from "../../types/schema.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { imagesOf, schemaDescription, apiKey } = await req.json();
      
      if (!imagesOf || !schemaDescription) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Missing API key" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Construct the prompt for OpenAI
      const systemPrompt = `You are a helpful assistant that converts natural language descriptions into JSON schemas.
The schema should follow this structure:
{
  "type": "object",
  "properties": {
    "property1": {
      "type": "string",
      "description": "Description of property1"
    },
    ...more properties
  },
  "required": ["property1", ...more required properties],
  "additionalProperties": false
}

The available property types are: string, number, boolean.
Create descriptive property names and clear descriptions.
`;

      const userPrompt = `I'm building a computer vision application that analyzes images of ${imagesOf}.
I need to extract the following information from each image: ${schemaDescription}
Please create a JSON schema that defines these properties with appropriate types and descriptions.`;

      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to generate schema" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      
      // Extract the schema from the response
      try {
        const content = data.choices[0].message.content;
        // Extract JSON from the response (in case it includes markdown or extra text)
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```\n([\s\S]*?)\n```/) || 
                          content.match(/({[\s\S]*})/);
                          
        const schemaText = jsonMatch ? jsonMatch[1] : content;
        const schema = JSON.parse(schemaText) as JsonSchema;
        
        // Validate the schema has the required structure
        if (!schema.type || !schema.properties || !Array.isArray(schema.required)) {
          throw new Error("Generated schema doesn't have the required structure");
        }
        
        // Create a prompt based on the schema
        const promptText = generatePromptFromSchema(schema, imagesOf);
        
        return new Response(
          JSON.stringify({ schema, promptText }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error parsing schema:", error);
        return new Response(
          JSON.stringify({ error: "Failed to parse generated schema" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.error("Server error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};

// Helper function to generate a prompt from the schema
function generatePromptFromSchema(schema: JsonSchema, imagesOf: string): string {
  const properties = Object.entries(schema.properties)
    .map(([name, prop]) => {
      const requiredText = schema.required.includes(name) ? " (required)" : "";
      return `- ${name}${requiredText}: ${prop.description}`;
    })
    .join("\n");

  return `Analyze this image of ${imagesOf} and extract the following information:

${properties}

Respond with valid JSON.`;
} 