/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });


const INFLUENCER_AESTHETICS: { [key: string]: string } = {
    'general': "Ensure the final image is a clear, authentic-looking photograph.",
    'ugc_traveller': "The image should have a User-Generated Content (UGC) feel. It should look authentic, relatable, and as if it were shot on a high-end smartphone. Avoid overly polished or professional lighting. The setting should be a realistic, everyday environment.",
    'lifestyle_traveller': "The image should capture an aspirational yet relatable moment. Think cozy cafes, well-decorated home interiors, or scenic, everyday locations. The lighting should be natural and warm. The overall vibe is curated, authentic, and inviting.",
    'beauty_globetrotter': "The aesthetic should be clean, bright, and focused on the subject's face and skin. Use soft, flattering light that minimizes harsh shadows. The background should be simple and uncluttered, often a solid color or a clean bathroom/vanity setting. The mood is fresh and polished.",
    'fashion_traveller': "The focus must be on the outfit. The composition should highlight the clothing, textures, and silhouette. The background should be either a clean studio setting or a dynamic urban environment (street style). The aesthetic is chic, confident, and editorial.",
    'culinary_explorer': "The image should make the food look delicious and appealing. The setting is typically a restaurant or kitchen. Use natural light where possible. The focus is on the textures and colors of the food, with the subject interacting with it naturally.",
    'travel_creator': "The image must evoke a sense of wanderlust and adventure. The background should be a stunning and recognizable travel destination. The subject should be interacting with the environment, not just posing. The lighting should capture the mood of the location, whether it's bright sun or a moody, overcast day.",
    'digital_storyteller': "The setting should resemble a modern podcast or streaming studio. Include a professional microphone in the shot, soft studio lighting, and acoustic panels or a clean, minimalist background. The mood should be professional yet engaging.",
    'luxury_jet_setter': "The aesthetic is elegant, minimalist, and high-end. Use clean lines, neutral color palettes, and sophisticated settings (e.g., luxury hotels, designer stores, art galleries). The lighting should be soft and refined. The overall mood is exclusive and aspirational.",
    'tech_nomad': "Create a clean, modern aesthetic suitable for a tech reviewer. The setting should be a minimalist desk setup or studio with good lighting. The subject should be interacting with a piece of technology (e.g., phone, laptop) but the focus remains on them. The vibe is knowledgeable and trustworthy.",
    'creative_traveller': "The setting should be a bright, organized workshop or craft space. The subject should be actively engaged in a creative process (e.g., painting, woodworking, sewing). The aesthetic is hands-on, authentic, and inspiring. Use natural light to create a warm and inviting atmosphere.",
    'wellness_coach': "The image should feel energetic and motivational. The setting is a modern gym, a yoga studio, or an outdoor location suitable for a workout. The subject should be in athletic wear, possibly in a dynamic pose or using fitness equipment. The lighting should be bright and highlight muscle definition.",
    'music_nomad': "Capture a creative and expressive mood. The setting could be a recording studio with instruments, a moody stage with dramatic lighting, or an intimate space where they are writing music. The focus is on the artist's passion and connection to their craft.",
    'rapper_traveller': "The aesthetic should be bold, confident, and stylish. The setting could be a modern recording studio, a gritty urban location, or a luxury vehicle. The fashion should be high-end streetwear or designer. The mood is powerful, artistic, and unapologetic.",
    'genz_explorer': "Capture the quintessential 'TikTok lifestyle' aesthetic. The image should feel like a candid, high-energy still from a viral video. The setting should be trendy and relatable—think a cool cafe, a sun-drenched city street corner, an aesthetic bedroom with curated clutter (not a gaming setup), or an outdoor spot perfect for a viral trend. The fashion is key: emphasize current Gen Z trends like thrifted looks, baggy silhouettes, or unique accessories. The pose should be natural and in-the-moment, avoiding overly professional or staged compositions. The vibe is authentic, slightly unfiltered, and focused on romanticizing everyday life for a social media audience.",
    'business_jet_setter': "The aesthetic is professional, modern, and polished. The setting should be a clean, well-lit modern office, a co-working space, or an upscale business environment. The subject should be in sharp, professional attire. The mood is confident, successful, and approachable."
};

// A detailed dictionary of what each camera angle means, to give the AI better instructions.
const ANGLE_DESCRIPTIONS: { [key: string]: string } = {
    'Travel Diaries': "Shot from the true first-person perspective of someone being gently led forward by the subject’s hand. The viewer’s outstretched hand is visible in the frame, connecting with the subject’s hand. The subject looks back over their shoulder with a joyful or inviting expression while leading the viewer through a beautiful travel location. Maintain a sense of movement, connection, and cinematic depth.",
    'Window Seat Perspective': "from the perspective of a passenger looking out of a train window. The subject should be visible in profile, looking out at a stunning view (e.g., clouds, mountains, coastline). The focus is on the contemplative moment of travel.",
    'Resort View': "The subject is standing on a balcony of a beautiful hotel or resort, looking out at a breathtaking view (e.g., ocean, mountains, cityscape). The shot should capture a feeling of luxury and relaxation. It could be a morning coffee scene or an evening cocktail moment.",
    'Hidden Alleyway': "as a candid-style shot of the subject walking through a narrow, charming alleyway, perhaps with cobblestones or unique local architecture. They can be looking away from the camera, as if exploring. The aesthetic is romantic and full of wanderlust.",
    'Mountain Summit': "The subject is standing triumphantly on a mountain peak or a scenic viewpoint. The pose should be powerful (e.g., arms outstretched). The background is a vast, dramatic landscape of mountains and sky. The mood is adventurous and awe-inspiring.",
    'Tropical Beach Escape': "The subject is relaxing on a pristine tropical beach. They could be lying on the sand, sitting in a hammock, or walking along the shoreline. The image should feature turquoise water, white sand, and palm trees. The vibe is serene and idyllic.",
    'Street Market Scene': "as a vibrant, candid shot of the subject interacting with a bustling local market (e.g., a spice market, a flower market, a food market). They could be examining produce or talking to a vendor. The shot should be full of color, texture, and authentic local culture.",
    'Backpacker Explorer': "as a classic traveler's selfie, often taken with a wide-angle lens. The subject is wearing a backpack and looks happy and adventurous. The background should clearly show a new and interesting location, hinting at the start of a journey.",
    'Roadside Moment': "from the driver's or passenger's perspective inside a car. It could show the subject's hands on the steering wheel with a scenic road ahead, or the view out the side window of a passing landscape. The mood is one of freedom and adventure.",
    'Hotel Arrival': "as an aspirational shot of the subject in the lobby of a boutique hotel. They could be interacting with the reception, or posing with their stylish luggage. The background should reflect a stylish boutique hotel lobby — curated art pieces, warm ambient lighting, and cozy yet refined furniture that feels globally inspired rather than traditionally opulent. The aesthetic is elegant, inviting, and high-end.",
    'Ancient Discovery': "The subject is exploring ancient ruins (e.g., Roman, Greek, Mayan). They should be interacting with the environment, perhaps touching an old stone wall or looking up in awe at a grand structure. The mood is one of history, discovery, and adventure.",
    'Cafe Moment': "The subject is sitting at a table of a boutique café, enjoying a coffee or a local specialty. The shot should capture the unique ambiance and character of the location, with the surrounding scene in the background. The vibe is relaxed and authentic.",
    'Golden Hour Landmark': "The subject is posing in front of a famous landmark (e.g., Eiffel Tower, Colosseum) during golden hour. The lighting must be warm, soft, and glowing, creating a magical and romantic atmosphere.",
    'Mountain Trek': "as a dynamic shot of the subject hiking on a scenic trail. They should be in appropriate hiking gear and look active and energetic. The background should be a beautiful natural landscape like a forest, canyon, or mountain path.",
    'Flatlay Essentials': "as a top-down flat lay of essential travel items, like a passport, plane tickets, a camera, and sunglasses, arranged artfully. The subject's hands can be in the frame. The background could be a map or a simple surface. It builds anticipation for a trip.",
    'Balcony View': "The subject is in or next to an infinity pool that overlooks a stunning view (ocean, city skyline, jungle). The shot emphasizes the seamless blend of the pool and the background. The mood is luxurious, serene, and aspirational.",
    'First Person Frame': "from a first-person perspective, focusing on the subject's hand holding an object like a coffee cup, a passport, or a flower against an interesting background. It's about a small moment in a larger story.",
    'Aerial View': "from a high aerial perspective, as if taken by a drone. The subject should be relatively small in the frame, surrounded by a stunning, expansive landscape like a beach, a mountain top, or an interesting cityscape. The shot should evoke a sense of scale, freedom, and adventure.",
    'Rooftop Skyline': "The subject is on a stylish rooftop viewpoint, overlooking a sprawling cityscape at either sunset or dusk. They could be holding a drink or simply taking in the view. The mood is sophisticated, urban, and chic.",
    'Luxury Shopping': "A candid-style shot of the subject on a high-end shopping street, holding shopping bags from luxury brands. They should look happy and chic. The background should feature elegant storefronts. The aesthetic is aspirational and fashion-forward.",
    'Elegant Dining': "The subject is seated at a beautifully set table in a fine dining restaurant. The focus is on an artfully plated dish in front of them, with the subject subtly in the frame. The lighting is intimate and elegant. The mood is sophisticated and epicurean.",
    'Luxury Drive POV': "The shot captures the subject driving a luxury car (e.g., sleek convertible, premium SUV, or executive sedan). The camera is positioned from just behind or beside the driver, showing their hands on the wheel and partial face as they look toward a scenic road ahead. The interior should feature elegant design details — polished leather, ambient lighting, and refined modern finishes that evoke understated luxury. The mood is one of power, freedom, and luxury.",
    'Culinary Session': "The subject is actively participating in a cooking class, focused on local cuisine. They could be chopping ingredients, stirring a pot, or plating a dish, with a look of concentration and enjoyment. The setting is an inviting, boutique-style kitchen with warm lighting and refined design touches that reflect a global culinary experience. The vibe is immersive, authentic, and hands-on.",
    'Spa Retreat': "The subject is in a serene and luxurious spa environment. They could be wrapped in a plush robe by a tranquil pool, or receiving a spa treatment. The atmosphere is calm, minimalist, and rejuvenating. The aesthetic is one of ultimate relaxation and self-care.",
    'Gallery Visit': "The subject is observing a piece of art or an exhibit in a boutique museum or art space. They can be seen from the side or back to emphasize the art. The lighting is directional and the setting is quiet and contemplative. The mood is cultured and sophisticated.",
    'Private Jet View': "The subject is confidently ascending the steps of a private jet from the tarmac. They should be dressed stylishly, perhaps holding a piece of luxury luggage. The mood is exclusive, powerful, and glamorous, capturing the pinnacle of luxury travel.",
    'Scenic Cruise': "The subject is on a boat (e.g., a small tour boat, a sailboat, a gondola) moving through a beautiful body of water. The background should be a stunning coastline, a city's canals, or a dramatic fjord. The subject looks relaxed and is enjoying the scenery. The feeling is adventurous and picturesque.",
    'Street Food Adventure': "A close-up, vibrant shot of the subject taking their first bite of an interesting local street food. Their expression should be one of delight and discovery. The background is a bustling street food stall or market, adding to the authenticity. The vibe is candid, adventurous, and flavorful.",
    'Water Sports Moment': "A dynamic action shot of the subject engaged in a water sport like surfing, paddleboarding, or kayaking. The image should capture movement, with water splashing. The setting is a beautiful beach or lake. The mood is energetic, adventurous, and fun.",
    'Yacht Escape': "The subject is relaxing on the deck of a luxurious yacht. They are in stylish swimwear or resort wear, perhaps sunbathing or enjoying a drink with a stunning ocean backdrop. The aesthetic is glamorous, exclusive, and aspirational."
};


// --- Helper Functions ---

/**
 * Processes the Gemini API response, extracting the image or throwing an error if none is found.
 * @param response The response from the generateContent call.
 * @returns A data URL string for the generated image.
 */
function processGeminiResponse(response: GenerateContentResponse): string {
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const textResponse = response.text;
    console.error("API did not return an image. Response:", textResponse);
    throw new Error(`The AI model responded with text instead of an image: "${textResponse || 'No text response received.'}"`);
}

/**
 * A wrapper for the Gemini API call that includes a retry mechanism for timeout or network errors.
 * @param imagePart The image part of the request payload.
 * @param textPart The text part of the request payload.
 * @returns The GenerateContentResponse from the API.
 */
async function callGeminiWithRetry(imagePart: object, textPart: object): Promise<GenerateContentResponse> {
    const modelParams = {
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    };

    try {
        return await ai.models.generateContent(modelParams);
    } catch (error) {
        console.log("Retrying due to Gemini timeout or network error...");
        await new Promise(r => setTimeout(r, 1000));
        return await ai.models.generateContent(modelParams);
    }
}


/**
 * Generates a styled image from a source image and a camera angle prompt.
 * It includes a fallback mechanism for prompts that might be blocked.
 * @param imageDataUrl A data URL string of the source image (e.g., 'data:image/png;base64,...').
 * @param angle The camera angle to apply (e.g., 'Low angle shot').
 * @param options An optional object that can contain a 'regenerate' flag and an 'influencerType'.
 * @returns A promise that resolves to a base64-encoded image data URL of the generated image.
 */
export async function generateAngleImage(
    imageDataUrl: string,
    angle: string,
    options: { regenerate?: boolean; influencerType?: string; gender?: string; location?: string } = {}
): Promise<string> {
  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
  }
  const [, mimeType, base64Data] = match;

    const imagePart = {
        inlineData: { mimeType, data: base64Data },
    };
    
    const { regenerate = false, influencerType = 'general', gender = 'female', location = '' } = options;
    const aestheticInstruction = INFLUENCER_AESTHETICS[influencerType] || INFLUENCER_AESTHETICS['general'];
    
    let angleDescription = ANGLE_DESCRIPTIONS[angle] || `from a perspective known as a "${angle}".`;
    if (angle === 'GRWM (Get Ready With Me)' && gender === 'male') {
        angleDescription = "from a perspective of a man in a bathroom, looking into a mirror. The shot should be medium-close, capturing a masculine grooming routine like styling hair, trimming a beard, or applying skincare. Avoid showing makeup application. The setting should be clean and modern. The vibe is informal and focused on self-care.";
    }

    const locationInstruction = location ? `The new scene MUST take place in ${location}. Actively incorporate recognizable landmarks, architectural styles, or natural features that are famously representative of ${location}.` : '';
    const poseInstruction = regenerate ? 'The subject must also be in a new and different pose.' : '';
    const genderInstruction = `The subject in the photo is ${gender}.`;

    const primaryPrompt = `Your primary task is to use the person in the provided image as the subject for a completely new scene, captured from a different camera angle. ${genderInstruction} The new scene MUST be shot from the "${angle}" perspective. ${locationInstruction} Use the following detailed description as your guide for the composition: ${angleDescription}. ${aestheticInstruction} Generate a new background, setting, and pose for the subject that is natural and appropriate for the requested angle. ${poseInstruction} Do not just crop or slightly alter the original. The change must be dramatic. The final output must be a photorealistic image in PNG format with a 16:9 aspect ratio.`;
    
    const fallbackPrompt = `Create a new photograph featuring the person from the original image. This new photo must be taken from a "${angle}". ${locationInstruction} Use this guide for the shot: ${angleDescription}. ${aestheticInstruction} The background and setting should be completely new and fit the scene. ${poseInstruction} The final image must be a clear, authentic-looking photograph in PNG format with a 16:9 aspect ratio.`;

    // --- First attempt with the original prompt ---
    try {
        console.log(`Attempting generation for "${angle}" with original prompt...`);
        const textPart = { text: primaryPrompt };
        const response = await callGeminiWithRetry(imagePart, textPart);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        const isNoImageError = errorMessage.includes("The AI model responded with text instead of an image");

        if (isNoImageError) {
            console.warn(`Original prompt for "${angle}" was likely blocked. Trying a fallback prompt.`);
            
            // --- Second attempt with the fallback prompt ---
            try {
                console.log(`Attempting generation for "${angle}" with fallback prompt...`);
                const fallbackTextPart = { text: fallbackPrompt };
                const fallbackResponse = await callGeminiWithRetry(imagePart, fallbackTextPart);
                return processGeminiResponse(fallbackResponse);
            } catch (fallbackError) {
                console.error("Fallback prompt also failed.", fallbackError);
                const finalErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
                throw new Error(`The AI model failed with both original and fallback prompts. Last error: ${finalErrorMessage}`);
            }
        } else {
            // This is for other errors, like a final internal server error after retries.
            console.error(`An unrecoverable error occurred during image generation for "${angle}".`, error);
            throw new Error(`The AI model failed to generate an image. Details: ${errorMessage}`);
        }
    }
}

/**
 * Generates a travel itinerary using Gemini by requesting one day at a time to ensure completeness.
 * @param destination The travel destination.
 * @param duration The length of the trip (e.g., "5 days").
 * @param travelStyle The user's preferred travel style (e.g., "adventurous", "relaxing").
 * @returns A promise that resolves to a string containing the complete, markdown-formatted itinerary.
 */
export async function generateItinerary(
    destination: string,
    duration: string,
    travelStyle: string
): Promise<string> {
    const style = travelStyle || "balanced";

    // 1. Parse number of days from duration string like "5 days"
    const durationMatch = duration.match(/\d+/);
    const numDays = durationMatch ? parseInt(durationMatch[0], 10) : 1;
    
    // Use the parsed number for the title, e.g., "5 Day" or "1 Day"
    const finalDurationText = `${numDays} Day${numDays > 1 ? 's' : ''}`;

    const itineraryParts: string[] = [];
    
    // 2. Loop through each day and generate a plan
    for (let day = 1; day <= numDays; day++) {
        const dayPrompt = `You are an expert travel planner creating a luxury-style travel itinerary.
This is Day ${day} of a ${numDays}-day trip to ${destination}. The travel style is "${style}".
Generate ONLY the plan for Day ${day}.

Use this exact format and nothing else:
<b>Day ${day}: [Creative Day Title]</b><br><br>
<b>Morning:</b> Description of morning activities with <b>bold highlights</b>.<br><br>
<b>Afternoon:</b> Description of afternoon activities with <b>bold highlights</b>.<br><br>
<b>Evening:</b> Description of evening activities with <b>bold highlights</b>.<br><br>
💡 <b>Tip:</b> A short, helpful tip related to the day's activities.<br><br>

Your output must be clean, well-structured HTML using only <b> and <br> tags.
The tone should be elegant and cinematic.
Do not add any introductory or concluding text, titles, or summaries. Generate ONLY the content for Day ${day}.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: dayPrompt,
            });
            itineraryParts.push(response.text);
        } catch (error) {
            console.error(`Error generating itinerary for Day ${day}:`, error);
            itineraryParts.push(`<b>Day ${day}: Generation Error</b><br><br>An error occurred while planning this day. Please try regenerating the itinerary.<br><br>`);
        }
    }

    // 3. Assemble the full itinerary
    const planAndBookSection = `---
<b>✨ Plan & Book Your Trip ✨</b><br><br>
Looking to turn your AI-crafted itinerary into reality? Here are trusted booking options curated by <b>RAKI AI Digital DEN</b>:<br><br>
🏨 <b>Hotels:</b><br>
Option 1 — <a href="https://www.awin1.com/cread.php?awinmid=105925&awinaffid=1865944&ued=https%3A%2F%2Fwww.trivago.co.uk%2F" target="_blank">Book with Trivago UK</a><br>
Option 2 — <a href="https://www.awin1.com/cread.php?awinmid=4329&awinaffid=1865944&ued=https%3A%2F%2Fwww.lastminute.com%2F" target="_blank">Book with Lastminute.com</a><br><br>
🛫 <b>Flights, Hotels & Cars:</b><br>
<a href="https://trip.tpo.lv/Yjlwv6FB" target="_blank">Trip.com</a><br><br>
🎟️ <b>Tours & Attractions:</b><br>
<a href="https://tiqets.tpo.lv/1CSNZ3w6" target="_blank">Tiqets</a><br><br>
📶 <b>eSIM & Data:</b><br>
<a href="https://airalo.tpo.lv/UXIgYnfO" target="_blank">Airalo</a><br><br>
---`;

    const title = `<b>${destination} – ${finalDurationText} Smart Itinerary</b><br><br>`;
    const body = itineraryParts.join('');

    return `${title}${body}${planAndBookSection}`;
}
