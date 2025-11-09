import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getListingById } from "@/utils/mock-all-data-used"; // Assuming this can be called server-side

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  // In a production app, you might want to throw an error or handle this more robustly
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const { listingId, userMessage, chatHistory } = await request.json();

    if (!listingId || !userMessage) {
      return NextResponse.json(
        { error: "Invalid request body. 'listingId' and 'userMessage' are required." },
        { status: 400 }
      );
    }

    const listing = getListingById(listingId);

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found for the provided ID." },
        { status: 404 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construct the initial system instruction/context for the AI
    const systemInstruction = `
      You are an AI assistant for a product listing. Your goal is to answer user questions about the specific product listing provided.
      Here are the details of the product listing:

      Title: ${listing.title}
      Description: ${listing.description}
      Price: ${listing.price}
      Listing Type: ${listing.listingType}
      Category: ${listing.category}

      Based on this information, answer the user's questions concisely and helpfully.
      If a question cannot be answered from the provided listing details, politely state that you don't have that information.
      Do not make up information.
    `;

    // Prepare the chat history for Gemini
    // Gemini's chat history expects roles 'user' and 'model'
    const formattedChatHistory = chatHistory.map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }],
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm here to answer your questions about this listing. What would you like to know?" }],
        },
        ...formattedChatHistory, // Add previous chat history
      ],
      generationConfig: {
        maxOutputTokens: 200, // Limit response length for conciseness
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Error generating AI chat response:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get AI response. Please try again later." },
      { status: 500 }
    );
  }
}