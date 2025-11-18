import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(request: NextRequest) {
  // Get authenticated user ID from Clerk
  // Middleware already blocks unauthenticated users, but we get userId here for the session
  const { userId } = await auth();

  // Extra safety check (redundant with middleware but good practice)
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { amount, title, description, metadata } = await request.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Parse amount if it's a string like "RM 50"
    const amountNumber = typeof amount === 'number' ? amount : parseFloat(amount.match(/[\d.]+/)?.[0] || '0');

    // Create Checkout Session for embedded checkout
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: title || "Purchase",
              description: description || "",
            },
            unit_amount: Math.round(amountNumber * 100), // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      return_url: `${request.headers.get("origin")}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        // Use VERIFIED userId from Clerk auth, not client-provided data
        userId,
        // Merge any additional metadata from the request
        ...(metadata || {}),
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error creating checkout session:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
