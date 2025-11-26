"""Add conversations and messages tables for user messaging

Revision ID: cd36e1e4027c
Revises: a1b2c3d4e5f6
Create Date: 2025-11-11 12:18:24.961679

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cd36e1e4027c'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create conversations and messages tables for user messaging."""

    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recommendation_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_message_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['recommendation_id'], ['recommendations.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('recommendation_id', name='uq_conversations_recommendation_id')
    )

    # Create indexes for conversations
    op.create_index('ix_conversations_id', 'conversations', ['id'])
    op.create_index('ix_conversations_recommendation_id', 'conversations', ['recommendation_id'])

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('message_type', sa.String(length=20), nullable=False, server_default='text'),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='SET NULL'),
    )

    # Create indexes for messages
    op.create_index('ix_messages_id', 'messages', ['id'])
    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('ix_messages_sender_id', 'messages', ['sender_id'])
    op.create_index('ix_messages_is_read', 'messages', ['is_read'])
    op.create_index('ix_messages_created_at', 'messages', ['created_at'])


def downgrade() -> None:
    """Drop conversations and messages tables."""
    # Drop messages table first (due to foreign key constraint)
    op.drop_index('ix_messages_created_at', table_name='messages')
    op.drop_index('ix_messages_is_read', table_name='messages')
    op.drop_index('ix_messages_sender_id', table_name='messages')
    op.drop_index('ix_messages_conversation_id', table_name='messages')
    op.drop_index('ix_messages_id', table_name='messages')
    op.drop_table('messages')

    # Drop conversations table
    op.drop_index('ix_conversations_recommendation_id', table_name='conversations')
    op.drop_index('ix_conversations_id', table_name='conversations')
    op.drop_table('conversations')
