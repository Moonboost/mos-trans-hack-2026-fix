"""add VSM domain fields

Revision ID: c8e4b2f71d9a
Revises: b7f3a1d92c4e
Create Date: 2026-09-25
<<<<<<< HEAD

LLM context: Grounds scenarios in STO RZD 03.011/03.013/03.014.
- service_class: SLA per STO 03.011 p.10.5
- passenger_type: taxonomy from "Situations on board"
- stage: boarding | in_flight | arrival (Приложение А СТО 03.011)
- role_step on choice: admit | state_rule | offer_solution | reassure
- requires_escalation: hard trigger to call Nachalnik poezda / PTB / LOVD
=======
>>>>>>> main
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'c8e4b2f71d9a'
down_revision: Union[str, None] = 'b7f3a1d92c4e'
branch_labels = None
depends_on = None


def upgrade() -> None:
<<<<<<< HEAD
    # --- scenarios ---
    op.add_column('scenarios', sa.Column('service_class', sa.String(), server_default='any'))
    op.add_column('scenarios', sa.Column('passenger_type', sa.String(), server_default='regular'))
    op.add_column('scenarios', sa.Column('stage', sa.String(), server_default='in_flight'))
    op.add_column('scenarios', sa.Column('regulatory_ref', sa.String(), nullable=True))
    op.create_index('ix_scenarios_service_class', 'scenarios', ['service_class'])
    op.create_index('ix_scenarios_passenger_type', 'scenarios', ['passenger_type'])

    # --- choices: role-model step + escalation ---
    op.add_column('node_choices', sa.Column('role_step', sa.String(), nullable=True))
    op.add_column('node_choices', sa.Column('requires_escalation', sa.String(), nullable=True))
    op.add_column('node_choices', sa.Column('sla_violation_penalty', sa.Integer(), server_default='0'))

    # --- runs: SLA + role-model progress ---
    op.add_column('scenario_runs', sa.Column('service_class', sa.String(), server_default='standard'))
    op.add_column('scenario_runs', sa.Column('role_steps_seen', sa.JSON(), server_default='[]'))
    op.add_column('scenario_runs', sa.Column('escalation_deadline_at', sa.DateTime(), nullable=True))
    op.add_column('scenario_runs', sa.Column('escalation_done', sa.Boolean(), server_default=sa.false()))

    # --- achievements: competence-based ---
    op.add_column('achievements', sa.Column('competence', sa.String(), nullable=True))
    op.add_column('achievements', sa.Column('min_value', sa.Integer(), server_default='1'))


def downgrade() -> None:
    op.drop_column('achievements', 'min_value')
    op.drop_column('achievements', 'competence')
    op.drop_column('scenario_runs', 'escalation_done')
    op.drop_column('scenario_runs', 'escalation_deadline_at')
    op.drop_column('scenario_runs', 'role_steps_seen')
    op.drop_column('scenario_runs', 'service_class')
    op.drop_column('node_choices', 'sla_violation_penalty')
    op.drop_column('node_choices', 'requires_escalation')
    op.drop_column('node_choices', 'role_step')
    op.drop_index('ix_scenarios_passenger_type', 'scenarios')
    op.drop_index('ix_scenarios_service_class', 'scenarios')
    op.drop_column('scenarios', 'regulatory_ref')
    op.drop_column('scenarios', 'stage')
=======
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
>>>>>>> main
    op.drop_column('scenarios', 'passenger_type')
    op.drop_column('scenarios', 'service_class')
