"""add VSM domain fields

Revision ID: c8e4b2f71d9a
Revises: b7f3a1d92c4e
Create Date: 2026-09-25
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'c8e4b2f71d9a'
down_revision: Union[str, None] = 'b7f3a1d92c4e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- scenarios: домен ВСМ ---
    op.add_column('scenarios',
        sa.Column('service_class', sa.String(), server_default='any', nullable=False))
    op.add_column('scenarios',
        sa.Column('passenger_type', sa.String(), server_default='adult', nullable=False))
    op.add_column('scenarios',
        sa.Column('regulatory_ref', sa.String(), nullable=True))

    # --- node_choices: ролевая модель + эскалация ---
    op.add_column('node_choices',
        sa.Column('role_step', sa.String(), nullable=True))
    op.add_column('node_choices',
        sa.Column('requires_escalation', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('node_choices', 'requires_escalation')
    op.drop_column('node_choices', 'role_step')
    op.drop_column('scenarios', 'regulatory_ref')
    op.drop_column('scenarios', 'passenger_type')
    op.drop_column('scenarios', 'service_class')
