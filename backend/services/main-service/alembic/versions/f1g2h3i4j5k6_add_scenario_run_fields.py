"""add scenario run fields for role model and SLA

Revision ID: f1g2h3i4j5k6
Revises: e9f8g7h6i5j4
Create Date: 2026-09-28
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f1g2h3i4j5k6'
down_revision: Union[str, None] = 'e9f8g7h6i5j4'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('scenario_runs', sa.Column('service_class', sa.String(), server_default='standard'))
    op.add_column('scenario_runs', sa.Column('role_steps_seen', sa.JSON(), server_default='[]'))
    op.add_column('scenario_runs', sa.Column('escalation_done', sa.Boolean(), server_default='false'))
    op.add_column('scenario_runs', sa.Column('escalation_deadline_at', sa.DateTime(), nullable=True))
    
    op.execute("COMMIT")
    op.execute("ALTER TYPE run_status ADD VALUE IF NOT EXISTS 'failed'")

def downgrade() -> None:
    op.drop_column('scenario_runs', 'escalation_deadline_at')
    op.drop_column('scenario_runs', 'escalation_done')
    op.drop_column('scenario_runs', 'role_steps_seen')
    op.drop_column('scenario_runs', 'service_class')
