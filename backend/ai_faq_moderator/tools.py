"""
RAG (Retrieval Augmented Generation) system for FAQ queries
"""
import google.generativeai as genai
import os
import numpy as np
from typing import List, Tuple
from sqlalchemy.orm import Session

# Configure environment
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_query_embedding(query: str) -> List[float]:
    """
    Generate embedding for the user query using Gemini embedding model.
    Args:
        query: User question text
    Returns:
        List of floats representing the embedding vector (768 dimensions)
    """
    result = genai.embed_content(
        model="models/embedding-001",
        content=query,
        task_type="retrieval_query"
    )
    return result['embedding']


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors or measure how similar both vectors are
    Args:
        vec1: First embedding vector
        vec2: Second embedding vector
    Returns:
        Similarity score between -1 and 1 (higher is more similar)
    """
    vec1_np = np.array(vec1)
    vec2_np = np.array(vec2)

    dot_product = np.dot(vec1_np, vec2_np)
    norm1 = np.linalg.norm(vec1_np)
    norm2 = np.linalg.norm(vec2_np)

    if norm1 == 0 or norm2 == 0:
        return 0.0

    return dot_product / (norm1 * norm2)

def retrieve_similar_faqs(
    db: Session,
    query: str,
    listing_id: int = None,
    top_k: int = 3,
    similarity_threshold: float = 0.7 # can change to 0.75 or 0.80 to prevent AI from giving off topic answers
) -> List[Tuple[dict, float]]:
    """
    Retrieve the most similar semantically or contextually FAQs from the database using semantic search.
    Args:
        db: Database session
        query: User question
        listing_id: Optional listing ID to filter FAQs (if None, searches all FAQs)
        top_k: Number of top results to return
        similarity_threshold: Minimum similarity score (0-1)

    Returns:
        List of tuples containing (faq_dict, similarity_score)
    """
    from src.models.faq_embeddings import FAQEmbedding
    from src.models.faq import FAQ

    # Generate embedding for user query
    query_embedding = get_query_embedding(query)

    # Query database for FAQ embeddings
    query_builder = db.query(FAQEmbedding, FAQ).join(FAQ, FAQEmbedding.faq_id == FAQ.id)

    # Filter by listing if provided
    if listing_id:
        query_builder = query_builder.filter(FAQ.listing_id == listing_id)

    # Only get answered FAQs
    query_builder = query_builder.filter(FAQ.is_answered == True)

    faq_embeddings = query_builder.all()

    # Calculate similarity scores
    results = []
    for faq_embedding, faq in faq_embeddings:
        similarity = cosine_similarity(query_embedding, faq_embedding.embedding)

        if similarity >= similarity_threshold:
            faq_dict = {
                'id': faq.id,
                'question': faq.question,
                'answer': faq.answer,
                'listing_id': faq.listing_id,
                'helpful_count': faq.helpful_count
            }
            results.append((faq_dict, similarity))

    # Sort by similarity (highest first) and return top_k
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]


def generate_grounded_response(query: str, context_text: str) -> str:
    """
    Uses Gemini Pro/Flash to answer a question based STRICTLY on the provided context.
    This acts as the Generation component of RAG.
    Args:
        query: User question
        context_text: Retrieved context from similar FAQs
    Returns:
        AI-generated response grounded in the context
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
    You are a helpful e-commerce assistant.

    CONTEXT DATA:
    {context_text}

    USER QUESTION:
    {query}

    INSTRUCTIONS:
    1. Answer based ONLY on the Context Data above.
    2. If the answer is not in the context, say "I don't have that information, please ask the seller."
    3. Be concise and polite to the prospective user.
    """
    response = model.generate_content(prompt)
    return response.text.strip()

def rag_query(
    db: Session,
    query: str,
    listing_id: int = None,
    top_k: int = 5
) -> str:
    """
    Complete RAG pipeline: Retrieve similar FAQs and generate a response.
    Args:
        db: Database session
        query: User question
        listing_id: Optional listing ID to filter FAQs
        top_k: Number of similar FAQs to retrieve
    Returns:
        AI-generated response based on retrieved FAQs
    """
    # RETRIEVAL: Get similar FAQs from database
    similar_faqs = retrieve_similar_faqs(db, query, listing_id, top_k)

    if not similar_faqs:
        return "I don't have any relevant information to answer that question about the product."

    # BUILD CONTEXT: Format retrieved FAQs into context text
    context_parts = []
    for idx, (faq, similarity) in enumerate(similar_faqs, 1):
        context_parts.append(
            f"Q{idx}: {faq['question']}\n"
            f"A{idx}: {faq['answer']}\n"
            f"(Relevance: {similarity:.2f})"
        )

    context_text = "\n\n".join(context_parts)

    # Generate response using retrieved context
    return generate_grounded_response(query, context_text)