"""remove_faqs_json_column_from_listings

Revision ID: efa62552ad2a
Revises: bdfa511ebf71
Create Date: 2025-11-08 20:36:35.450977

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'efa62552ad2a'
down_revision: Union[str, Sequence[str], None] = 'bdfa511ebf71'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove faqs JSON column from listings table."""
    # Drop the faqs column - FAQs are now stored in the separate faqs table
    op.drop_column('listings', 'faqs')


def downgrade() -> None:
    """Add back faqs JSON column to listings table."""
    # Add the column back (in case we need to rollback)
    # Note: This will not restore the data, only the column structure
    op.add_column('listings', sa.Column('faqs', sa.JSON(), nullable=True))
