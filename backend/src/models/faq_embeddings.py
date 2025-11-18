"""
to store vector embeddings for FAQs for semantic search
act as a long-term memory for the embeddings
"""
from sqlalchemy import Column, Integer, ForeignKey, Float
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from src.database import Base

# table name: faq_embeddings
# columns: id (Integer, primary key), faq_id (Integer, ForeignKey to faqs.id), embedding (ARRAY of Float)
class FAQEmbedding(Base):
    """
    Stores vector embeddings for FAQs for semantic search.
    Std PostgreSQL array(float) to avoid pgvector dependency
    """
    __tablename__ = "faq_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    faq_id = Column(Integer, ForeignKey("faqs.id", ondelete="CASCADE"), nullable=False, unique=True)
  
    # gemini model / gemini-embedding-001 (768 dimension)
    embedding = Column(ARRAY(Float), nullable=False)

    # Relationship to FAQ
    faq = relationship("FAQ", backref="embedding")

    def __repr__(self):
        return f"<FAQEmbedding(id={self.id}, faq_id={self.faq_id})>"