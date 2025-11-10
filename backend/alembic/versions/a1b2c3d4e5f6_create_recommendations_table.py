"""create_recommendations_table

Revision ID: a1b2c3d4e5f6
Revises: b47e65f08140
Create Date: 2025-11-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'b47e65f08140'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create recommendations table for AI and user-generated listing matches."""
    op.create_table(
        'recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('source_listing_id', sa.Integer(), nullable=False),
        sa.Column('target_listing_id', sa.Integer(), nullable=False),
        sa.Column('created_by_user_id', sa.Integer(), nullable=True),
        sa.Column('recommendation_type', sa.String(length=20), nullable=False, server_default='ai_match'),
        sa.Column('match_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('match_reasons', JSONB, nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['source_listing_id'], ['listings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_listing_id'], ['listings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ondelete='SET NULL'),
    )

    # Create indexes for better query performance
    op.create_index('ix_recommendations_id', 'recommendations', ['id'])
    op.create_index('ix_recommendations_source_listing_id', 'recommendations', ['source_listing_id'])
    op.create_index('ix_recommendations_target_listing_id', 'recommendations', ['target_listing_id'])
    op.create_index('ix_recommendations_status', 'recommendations', ['status'])


def downgrade() -> None:
    """Drop recommendations table."""
    op.drop_index('ix_recommendations_status', table_name='recommendations')
    op.drop_index('ix_recommendations_target_listing_id', table_name='recommendations')
    op.drop_index('ix_recommendations_source_listing_id', table_name='recommendations')
    op.drop_index('ix_recommendations_id', table_name='recommendations')
    op.drop_table('recommendations')
