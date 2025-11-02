"""migrate_to_clerk_auth

Revision ID: 735774342215
Revises: 143637ed0a88
Create Date: 2025-11-02 21:37:03.985524

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '735774342215'
down_revision: Union[str, Sequence[str], None] = '143637ed0a88'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Migrate to Clerk authentication - add clerk_user_id, remove hashed_password."""
    # Add clerk_user_id column (nullable initially for existing users)
    op.add_column('users', sa.Column('clerk_user_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_users_clerk_user_id'), 'users', ['clerk_user_id'], unique=True)

    # Make hashed_password nullable (for Clerk-managed users)
    op.alter_column('users', 'hashed_password', nullable=True)

    # NOTE: Existing users will need to be migrated manually or via a data migration
    # For fresh installs, clerk_user_id will be required on user creation


def downgrade() -> None:
    """Rollback Clerk migration - remove clerk_user_id, restore hashed_password requirement."""
    # Remove clerk_user_id
    op.drop_index(op.f('ix_users_clerk_user_id'), table_name='users')
    op.drop_column('users', 'clerk_user_id')

    # Restore hashed_password as required
    op.alter_column('users', 'hashed_password', nullable=False)
