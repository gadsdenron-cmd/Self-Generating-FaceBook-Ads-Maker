import { GoogleGenAI, Type } from "@google/genai";
import { AdCampaign, OfferType, GeneratedImages } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = "gemini-2.5-flash";
const imageModel = "imagen-4.0-generate-001";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * A utility to wrap an async function with retry logic and exponential backoff.
 * @param fn The async function to execute.
 * @param retries The maximum number of retries.
 * @param delayMs The initial delay in milliseconds.
 * @returns The result of the async function.
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> => {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`API call failed. Retrying in ${delayMs * Math.pow(2, i)}ms... (${i + 1}/${retries})`);
      if (i < retries - 1) {
        await delay(delayMs * Math.pow(2, i));
      }
    }
  }
  throw lastError;
};

export const generateProblems = async (productDescription: string, avatarDescription: string): Promise<string[]> => {
  const prompt = `
    Based on this product description: "${productDescription}" and this ideal customer avatar: "${avatarDescription}", generate a JSON array of 5 distinct, well-known problems this person is willing to pay money to solve.
    The problems should be concise, action-oriented, and directly relatable to the avatar's pains.
    Return ONLY the JSON array of strings, with no other text or explanation.
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
      },
    }));

    const jsonString = response.text.trim();
    const problems = JSON.parse(jsonString);
    if (Array.isArray(problems) && problems.every(p => typeof p === 'string')) {
        return problems;
    } else {
        throw new Error("Invalid format for problems received from API.");
    }

  } catch (error) {
    console.error("Error generating problems:", error);
    throw error;
  }
};


export const generateAdCampaign = async (
  productDescription: string,
  avatarDescription: string,
  selectedProblem: string,
  offerType: OfferType
): Promise<AdCampaign> => {
  const prompt = `
    You are an expert Facebook Ads copywriter and strategist. Your task is to generate a complete ad campaign kit.

    **CONTEXT:**
    - **Product/Offer:** ${productDescription}
    - **Ideal Customer Avatar:** ${avatarDescription}
    - **Problem this offer solves:** ${selectedProblem}
    - **Ad Type:** This ad is for an "${offerType}". Tailor all content accordingly. If it's an assessment, focus on diagnosing the problem, not selling the final solution.

    Generate the following components and return them in a single, valid JSON object that adheres to the provided schema.

    **COMPONENTS TO GENERATE:**

    1.  **"hooks" (Array of 10 strings):**
        - Create 10 attention-grabbing opening lines for an ad.
        - Must be tailored to the avatar and the specific problem.
        - Use a mix of angles: curiosity, authority, empathy, and urgency.

    2.  **"scripts" (Object with 7 string properties):**
        - Generate 7 distinct ad script versions. Each script must clearly address the selected problem and position the offer as the solution.
        - **short:** A punchy post (50-70 words).
        - **story:** A relatable storytelling style script.
        - **problemSolution:** A direct, problem-solution style script.
        - **emotional:** An empathetic tone that connects with the avatar's feelings.
        - **authority:** An expert tone that builds trust and credibility.
        - **socialProof:** A script written as if it's a testimonial.
        - **urgent:** A script with a strong sense of urgency or scarcity.

    3.  **"ctas" (Array of 5 strings):**
        - Write 5 clear and compelling calls to action.
        - Tailor them to whether the offer is a "product" or an "assessment". For assessments, focus on booking or claiming a spot. For products, focus on getting access or trying it out.

    4.  **"imagePrompts" (Array of 4 strings):**
        - Provide 4 creative image prompt concepts for an image generation AI (like Midjourney or DALL-E) or a graphic designer.
        - These prompts should result in visually appealing and relevant ad creatives.
        - Include concepts like: a before/after comparison, a visual metaphor for the customer's pain point, the product in a realistic usage scenario, and a bold, text-focused graphic.

    Return ONLY the JSON object. Do not include any introductory text, markdown formatting, or explanations.
  `;

   const schema = {
        type: Type.OBJECT,
        properties: {
          hooks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          scripts: {
            type: Type.OBJECT,
            properties: {
              short: { type: Type.STRING },
              story: { type: Type.STRING },
              problemSolution: { type: Type.STRING },
              emotional: { type: Type.STRING },
              authority: { type: Type.STRING },
              socialProof: { type: Type.STRING },
              urgent: { type: Type.STRING },
            },
             required: ['short', 'story', 'problemSolution', 'emotional', 'authority', 'socialProof', 'urgent']
          },
          ctas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          imagePrompts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['hooks', 'scripts', 'ctas', 'imagePrompts']
      };

  try {
     const response = await withRetry(() => ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      },
    }));

    const jsonString = response.text.trim();
    const campaign = JSON.parse(jsonString);
    return campaign as AdCampaign;

  } catch (error) {
    console.error("Error generating ad campaign:", error);
    throw error;
  }
};

export const generateImagesFromPrompts = async (prompts: string[]): Promise<GeneratedImages> => {
    const generatedImages: GeneratedImages = {};
    
    try {
        for (const prompt of prompts) {
            // Using fewer retries for image generation as it's a longer process.
            const response = await withRetry(() => ai.models.generateImages({
                model: imageModel,
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            }), 2, 2000);

            const images = response.generatedImages.map(img => img.image.imageBytes);
            if (images && images.length > 0) {
                generatedImages[prompt] = images;
            }
            
            // Add a delay after each API call to respect strict rate limits.
            await delay(1500);
        }
        return generatedImages;
    } catch (error) {
        console.error("Error generating images:", error);
        throw error;
    }
};