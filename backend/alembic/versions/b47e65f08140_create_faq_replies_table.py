"""create_faq_replies_table

Revision ID: b47e65f08140
Revises: efa62552ad2a
Create Date: 2025-11-09 21:21:54.574720

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b47e65f08140'
down_revision: Union[str, Sequence[str], None] = 'efa62552ad2a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create faq_replies table for nested replies to FAQ answers."""
    op.create_table(
        'faq_replies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('faq_id', sa.Integer(), nullable=False),
        sa.Column('parent_reply_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('helpful_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('not_helpful_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['faq_id'], ['faqs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['parent_reply_id'], ['faq_replies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
    )

    # Create indexes for better query performance
    op.create_index('ix_faq_replies_id', 'faq_replies', ['id'])
    op.create_index('ix_faq_replies_faq_id', 'faq_replies', ['faq_id'])
    op.create_index('ix_faq_replies_parent_reply_id', 'faq_replies', ['parent_reply_id'])
    op.create_index('ix_faq_replies_user_id', 'faq_replies', ['user_id'])


def downgrade() -> None:
    """Drop faq_replies table."""
    op.drop_index('ix_faq_replies_user_id', table_name='faq_replies')
    op.drop_index('ix_faq_replies_parent_reply_id', table_name='faq_replies')
    op.drop_index('ix_faq_replies_faq_id', table_name='faq_replies')
    op.drop_index('ix_faq_replies_id', table_name='faq_replies')
    op.drop_table('faq_replies')
