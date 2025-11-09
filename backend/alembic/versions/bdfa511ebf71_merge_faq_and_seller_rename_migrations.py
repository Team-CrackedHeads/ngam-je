"""merge faq and seller rename migrations

Revision ID: bdfa511ebf71
Revises: 33ef4bb81ec6, f5a12b3c8d9e
Create Date: 2025-11-08 20:16:29.231577

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bdfa511ebf71'
down_revision: Union[str, Sequence[str], None] = ('33ef4bb81ec6', 'f5a12b3c8d9e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
