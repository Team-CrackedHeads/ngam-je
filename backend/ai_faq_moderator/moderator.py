# help to manage & respond about the the products
# pyright: reportPrivateImportUsage=false, reportAttributeAccessIssue=false
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from ai_faq_moderator.tools import generate_grounded_response

# Load environment variables from the ai_faq_moderator/.env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

class FAQModeratorAgent:
    def __init__(self):
        self.model_name = "gemini-2.5-flash"
        self.config_json = {"response_mime_type": "application/json"}

    # classify the intent of the question into 5 cat (Product Features, Pricing, Warranty, Returns, General Inquiry)
    def classify_intent(self, question: str) -> str:
        """Classifies the question into 5 specific buckets."""
        model = genai.GenerativeModel(self.model_name)
        prompt = f"""You are an expert e-commerce customer service classifier. Your task is to categorize customer questions accurately.

CATEGORIES AND THEIR DEFINITIONS:
1. "Product Features" - Questions about specifications, functionality, condition, compatibility, or what's included
2. "Pricing" - Questions about cost, payment methods, discounts, or price negotiation
3. "Warranty" - Questions about guarantees, coverage, defects, or manufacturer support
4. "Returns" - Questions about refund policy, return process, exchange options, or buyer protection
5. "General Inquiry" - All other questions (shipping, availability, seller reputation, etc.)

CUSTOMER QUESTION:
"{question}"

INSTRUCTIONS:
- Analyze the question carefully
- Choose the MOST relevant category
- If multiple categories apply, prioritize based on the main intent
- Default to "General Inquiry" only if truly uncertain

OUTPUT FORMAT (strict JSON):
{{ "category": "Category Name" }}"""
        response = model.generate_content(prompt, generation_config=self.config_json)
        try:
            return json.loads(response.text).get("category", "General Inquiry")
        except:
            return "General Inquiry"

    # generate answer based on retrieved similar faqs
    # delegate to grounded response to generate an accurate answer based on prod info
    def draft_answer(self, question: str, product_context: str) -> str:
        """Delegates to the tool to get a factual answer."""
        return generate_grounded_response(question, product_context)

    def generate_sidebar_widget(self, full_context: str) -> dict:
        """
        Generates the "AI Summary" and "Negotiation Readiness Score" for the sidebar widget.
        """
        model = genai.GenerativeModel(self.model_name)
        prompt = f"""You are an expert marketplace analyst. Analyze the product listing and provide actionable insights for potential buyers.

TASK:
Evaluate the product listing's completeness, reliability, and readiness for buyer decision-making.

ANALYSIS CRITERIA:
1. SUMMARY: Synthesize key product details (what it is, condition, notable features)
2. NEGOTIATION SCORE: Rate listing quality 0-100 based on:
   - Information completeness (40 points)
   - Transparency about condition/flaws (30 points)
   - Answer quality in Q&A (20 points)
   - Seller responsiveness (10 points)
3. READINESS TIPS: Identify missing critical information
4. RELIABILITY QUOTE: Extract or paraphrase seller's most trust-building statement

SCORING GUIDE:
- 80-100: Excellent - Complete info, transparent, responsive
- 60-79: Good - Mostly complete, minor gaps
- 40-59: Fair - Missing key details or concerns about transparency
- 20-39: Poor - Incomplete listing with major gaps
- 0-19: Very Poor - Severely lacking information

INPUT CONTEXT:
{full_context}

OUTPUT FORMAT (strict JSON):
{{
    "summary": "3-sentence summary covering: product type, condition, and key selling point",
    "negotiation_score": 75,
    "readiness_tips": ["Specific missing info 1", "Specific missing info 2", "Specific missing info 3"],
    "reliability_quote": "Direct or paraphrased quote from seller"
}}

IMPORTANT:
- Be factual and objective
- Negotiation score must reflect actual listing quality
- Tips should be actionable (e.g., "Ask seller about original purchase date" not "More details needed")
- Quote should build trust, not undermine seller"""
        response = model.generate_content(prompt, generation_config=self.config_json)
        try:
            return json.loads(response.text) # if ai response fails, the below will be generated
        except:
            return {
                "summary": "Analysis pending.",
                "negotiation_score": 50,
                "readiness_tips": ["Check back later"],
                "reliability_quote": ""
            }