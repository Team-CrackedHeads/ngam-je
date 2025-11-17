"""rename_seller_to_creator_in_listings

Revision ID: 33ef4bb81ec6
Revises: 801fedbbff55
Create Date: 2025-11-08 00:02:22.124137

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '33ef4bb81ec6'
down_revision: Union[str, Sequence[str], None] = '801fedbbff55'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename seller_* columns to creator_* in listings table
    op.alter_column('listings', 'seller_name', new_column_name='creator_name')
    op.alter_column('listings', 'seller_location', new_column_name='creator_location')
    op.alter_column('listings', 'seller_verified', new_column_name='creator_verified')


def downgrade() -> None:
    """Downgrade schema."""
    # Revert creator_* columns back to seller_* in listings table
    op.alter_column('listings', 'creator_name', new_column_name='seller_name')
    op.alter_column('listings', 'creator_location', new_column_name='seller_location')
    op.alter_column('listings', 'creator_verified', new_column_name='seller_verified')
