"""Pydantic schemas for Ngam Overview API."""

from typing import List, Optional
from pydantic import BaseModel, Field


class NgamOverviewRequest(BaseModel):
    """Request schema for generating market overview"""
    query: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="User's question about secondhand market item",
        examples=["How do I verify if Air Jordan 1 Chicago sneakers are authentic?"]
    )
    include_images: bool = Field(
        default=True,
        description="Whether to include images in the response"
    )
    max_results: int = Field(
        default=10,
        ge=5,
        le=20,
        description="Maximum number of search results to analyze"
    )


class NgamOverviewResponse(BaseModel):
    """Response schema for market overview"""
    content: str = Field(
        ...,
        description="Markdown-formatted comprehensive overview"
    )
    images: List[str] = Field(
        default_factory=list,
        description="List of relevant image URLs"
    )
    sources: List[str] = Field(
        default_factory=list,
        description="List of source URLs used for research"
    )
    key_points: List[str] = Field(
        default_factory=list,
        description="Key takeaways and action items"
    )
    price_range: Optional[str] = Field(
        default=None,
        description="Suggested price range if available"
    )


class FollowUpRequest(BaseModel):
    """Request schema for follow-up questions"""
    original_query: str = Field(
        ...,
        description="Original query that generated the overview"
    )
    original_content: str = Field(
        ...,
        description="Previously generated overview content"
    )
    followup_question: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="Follow-up question",
        examples=["What's the typical price range?", "How can I verify authenticity?"]
    )


class FollowUpResponse(BaseModel):
    """Response schema for follow-up answers"""
    answer: str = Field(
        ...,
        description="Markdown-formatted answer to follow-up question"
    )
