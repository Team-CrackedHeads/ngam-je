"""add_performance_indexes

Revision ID: 9b439cc5f433
Revises: 9401a887153e
Create Date: 2025-11-16 23:36:51.527200

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9b439cc5f433'
down_revision: Union[str, Sequence[str], None] = '9401a887153e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add performance indexes for listings and recommendations tables."""

    # 1. Index for matched listing queries
    # Helps filter listings that are already matched
    op.create_index('ix_listings_is_matched', 'listings', ['is_matched'])

    # 2. Composite index for common filter combinations
    # Optimizes queries filtering by both listing_type AND is_active
    op.create_index('ix_listings_type_active', 'listings',
                   ['listing_type', 'is_active'])

    # 3. Index for ordering optimization
    # Speeds up ORDER BY created_at queries
    op.create_index('ix_listings_created_at', 'listings',
                   ['created_at'], postgresql_using='btree')

    # 4. JSONB GIN index for tag searches
    # Enables fast containment searches on tags array
    # Example: WHERE tags @> '["electronics", "laptop"]'
    op.create_index('ix_listings_tags', 'listings', ['tags'],
                   postgresql_using='gin')

    # 5. Full-text search index for title and description
    # Enables semantic keyword searches across listings
    # Creates a generated tsvector column for search
    op.execute("""
        CREATE INDEX ix_listings_title_description_search
        ON listings
        USING gin(to_tsvector('english', title || ' ' || description))
    """)

    # 6. Composite index for recommendations filtered by status
    # Optimizes: WHERE status = 'matched' AND source_listing_id = X
    op.create_index('ix_recommendations_status_source', 'recommendations',
                   ['status', 'source_listing_id'])

    # 7. Composite index for recommendations filtered by status (target side)
    # Optimizes: WHERE status = 'matched' AND target_listing_id = X
    op.create_index('ix_recommendations_status_target', 'recommendations',
                   ['status', 'target_listing_id'])


def downgrade() -> None:
    """Remove performance indexes."""

    op.drop_index('ix_recommendations_status_target', table_name='recommendations')
    op.drop_index('ix_recommendations_status_source', table_name='recommendations')
    op.drop_index('ix_listings_title_description_search', table_name='listings')
    op.drop_index('ix_listings_tags', table_name='listings')
    op.drop_index('ix_listings_created_at', table_name='listings')
    op.drop_index('ix_listings_type_active', table_name='listings')
    op.drop_index('ix_listings_is_matched', table_name='listings')
