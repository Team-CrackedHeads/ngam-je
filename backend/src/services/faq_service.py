"""
service class handles FAQ questions for a product listing, using semantic search w/
embeddings & gemini assistant
to generate answers when no good match exists
"""
from sqlalchemy.orm import Session, joinedload
from src.models.faq import FAQ
from src.models.faq_embeddings import FAQEmbedding
from src.models.listing import Listing
from ai_faq_moderator.moderator import FAQModeratorAgent
from google.generativeai.embedding import embed_content
from google.generativeai.client import configure
import numpy as np
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FAQService:
    def __init__(self, db: Session):
        self.db = db
        self.agent = FAQModeratorAgent()
        self.embedding_model = "models/embedding-001"

        # Ensure Gemini API is configured
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if api_key:
            configure(api_key=api_key)

    def get_vector(self, text: str):
        """Calculates embedding using Gemini API."""
        return embed_content(
            model=self.embedding_model,
            content=text,
            task_type="retrieval_query"
        )['embedding']

    def _build_context(self, listing: Listing, include_faqs: bool = False) -> str:
        """
        CRITICAL: Converts your Listing's JSONB fields and numeric data
        into a plain text story the gemini is able to read.
        """
        # Safe handling of JSONB lists (tags, shipping) which might be None
        shipping = ", ".join([str(x) for x in (listing.shipping_options or [])])
        tags = ", ".join([str(x) for x in (listing.tags or [])])

        # Build price information
        price_info = f"{listing.price} {listing.currency}"
        if listing.min_price is not None and listing.max_price is not None:
            price_info += f" (Price range: {listing.min_price} - {listing.max_price} {listing.currency})"

        # Availability status
        availability = "Available" if listing.is_active is True else "Not Available"
        if listing.is_matched is True:
            availability = "Matched with buyer/seller"
        elif listing.is_checked_out is True:
            availability = "Sold/Completed"

        context = f"""
        --- PRODUCT DATA ---
        Title: {listing.title}
        Listing Type: {listing.listing_type}
        Price: {price_info}
        Description: {listing.description}
        Availability Status: {availability}

        --- LOGISTICS & METADATA ---
        Location: {listing.creator_location}
        Seller/Poster Name: {listing.creator_name}
        Verified Seller: {'Yes' if listing.creator_verified is True else 'No'}
        Shipping Options: {shipping if shipping else 'Not specified'}
        Tags/Categories: {tags if tags else 'None'}
        Views: {listing.views}
        Inventory Quantity: {listing.inventory_quantity if listing.inventory_quantity is not None else 'Not specified'}
        """

        if include_faqs:
            # Fetch existing Q&A to help with the Summary generation
            faqs = self.db.query(FAQ).filter(FAQ.listing_id == listing.id).limit(10).all()
            qa_text = "\n".join([f"Q: {f.question} A: {f.answer}" for f in faqs])
            context += f"\n\n--- EXISTING Q&A HISTORY ---\n{qa_text}"

        return context

    def process_question(self, req):
        # 1. Semantic Search (The "Memory" Check)
        # Fetch FAQs + Embeddings in one query
        existing = self.db.query(FAQ).options(joinedload(FAQ.embedding))\
            .filter(FAQ.listing_id == req.listing_id, FAQ.is_answered == True).all()
        
        if existing:
            query_vec = self.get_vector(req.question)
            valid_faqs = [f for f in existing if f.embedding]
            
            if valid_faqs:
                # Matrix multiplication (Cosine Similarity)
                db_vecs = [f.embedding.embedding for f in valid_faqs]
                scores = np.dot(db_vecs, query_vec)
                best_idx = np.argmax(scores)
                
                if scores[best_idx] > 0.88: # High confidence threshold
                    return {
                        "status": "found", 
                        "message": "Similar question found", 
                        "data": valid_faqs[best_idx]
                    }

        # 2. If not found, Ask AI (The "Thinking" Step)
        listing = self.db.query(Listing).filter(Listing.id == req.listing_id).first()
        if not listing:
            raise ValueError("Listing not found")

        context = self._build_context(listing)
        
        category = self.agent.classify_intent(req.question)
        ai_answer = self.agent.draft_answer(req.question, context)

        # 3. Save Result
        new_faq = FAQ(
            listing_id=req.listing_id,
            question_user_id=req.user_id,
            question=req.question,
            answer=ai_answer,
            is_answered=True,
            answer_username="AI_Assistant"
        )
        self.db.add(new_faq)
        self.db.commit()
        self.db.refresh(new_faq)

        # 4. Save Vector
        new_vec = self.get_vector(req.question)
        self.db.add(FAQEmbedding(faq_id=new_faq.id, embedding=new_vec))
        self.db.commit()

        return {"status": "created", "message": "AI Answered", "data": new_faq, "category": category}

    def get_widget_data(self, listing_id: int):
        """Called when user loads the page to show the Sidebar Summary"""
        listing = self.db.query(Listing).filter(Listing.id == listing_id).first()
        full_context = self._build_context(listing, include_faqs=True)
        return self.agent.generate_sidebar_widget(full_context)