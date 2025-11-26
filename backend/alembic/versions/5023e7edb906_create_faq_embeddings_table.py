"""create faq_embeddings table

Revision ID: 5023e7edb906
Revises: 54bdf29d8110
Create Date: 2025-11-17 22:23:47.428597

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '5023e7edb906'
down_revision: Union[str, Sequence[str], None] = '54bdf29d8110'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'faq_embeddings',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('faq_id', sa.Integer(), sa.ForeignKey('faqs.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('embedding', postgresql.ARRAY(sa.Float), nullable=False),
    )
    op.create_index('ix_faq_embeddings_faq_id', 'faq_embeddings', ['faq_id'])

def downgrade() -> None:
    op.drop_index('ix_faq_embeddings_faq_id', table_name='faq_embeddings')
    op.drop_table('faq_embeddings')