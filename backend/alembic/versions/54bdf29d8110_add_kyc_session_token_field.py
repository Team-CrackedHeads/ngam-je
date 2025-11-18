"""add_kyc_session_token_field

Revision ID: 54bdf29d8110
Revises: 9b439cc5f433
Create Date: 2025-11-18 21:38:17.188316

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54bdf29d8110'
down_revision: Union[str, Sequence[str], None] = '9b439cc5f433'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add kyc_session_token column to users table."""
    op.add_column('users', sa.Column('kyc_session_token', sa.String(), nullable=True))


def downgrade() -> None:
    """Remove kyc_session_token column from users table."""
    op.drop_column('users', 'kyc_session_token')
