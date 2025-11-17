"""add_is_checked_out_field_to_listings

Revision ID: 9401a887153e
Revises: cd36e1e4027c
Create Date: 2025-11-15 08:48:44.121496

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9401a887153e'
down_revision: Union[str, Sequence[str], None] = 'cd36e1e4027c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add is_checked_out column to listings table
    op.add_column('listings', sa.Column('is_checked_out', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove is_checked_out column from listings table
    op.drop_column('listings', 'is_checked_out')
