"""add stage to scenarios

Revision ID: e9f8g7h6i5j4
Revises: d1e2f3a4b5c6
Create Date: 2026-09-26
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e9f8g7h6i5j4'
down_revision: Union[str, None] = 'd1e2f3a4b5c6'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('scenarios', sa.Column('stage', sa.String(), server_default='in_flight'))

def downgrade() -> None:
    op.drop_column('scenarios', 'stage')
