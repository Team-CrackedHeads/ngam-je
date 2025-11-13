"""create faqs table

Revision ID: f5a12b3c8d9e
Revises: e4c36078732a
Create Date: 2025-01-08 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f5a12b3c8d9e'
down_revision: Union[str, None] = 'e4c36078732a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = ('801fedbbff55',)


def upgrade() -> None:
    """Create FAQs table for listing questions and answers."""
    op.create_table(
        'faqs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('listing_id', sa.Integer(), nullable=False),
        sa.Column('question_user_id', sa.Integer(), nullable=True),
        sa.Column('answer_user_id', sa.Integer(), nullable=True),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('question_username', sa.String(length=100), nullable=True),
        sa.Column('answer', sa.Text(), nullable=True),
        sa.Column('answer_username', sa.String(length=100), nullable=True),
        sa.Column('is_answered', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_accepted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('helpful_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('not_helpful_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('answered_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for better query performance
    op.create_index('ix_faqs_listing_id', 'faqs', ['listing_id'])
    op.create_index('ix_faqs_question_user_id', 'faqs', ['question_user_id'])
    op.create_index('ix_faqs_answer_user_id', 'faqs', ['answer_user_id'])
    op.create_index('ix_faqs_is_answered', 'faqs', ['is_answered'])

    # Create foreign key constraints
    op.create_foreign_key(
        'fk_faqs_listing_id',
        'faqs', 'listings',
        ['listing_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'fk_faqs_question_user_id',
        'faqs', 'users',
        ['question_user_id'], ['id'],
        ondelete='SET NULL'
    )
    op.create_foreign_key(
        'fk_faqs_answer_user_id',
        'faqs', 'users',
        ['answer_user_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    """Drop FAQs table."""
    op.drop_table('faqs')
