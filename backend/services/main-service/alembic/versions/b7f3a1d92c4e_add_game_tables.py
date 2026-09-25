"""add game tables

Revision ID: b7f3a1d92c4e
Revises: 9ae240940cf1
Create Date: 2026-09-25
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'b7f3a1d92c4e'
down_revision: Union[str, None] = '9ae240940cf1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('scenarios',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('slug', sa.String(), nullable=False, unique=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('difficulty', sa.String(), server_default='medium'),
        sa.Column('xp_reward', sa.Integer(), server_default='100'),
        sa.Column('start_node_key', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('draft','active','archived', name='scenario_status'), server_default='active'),
        sa.Column('media_url', sa.String()),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
    )
    op.create_index('ix_scenarios_slug', 'scenarios', ['slug'], unique=True)
    op.create_index('ix_scenarios_category', 'scenarios', ['category'])

    op.create_table('scenario_nodes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('scenario_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('scenarios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('node_key', sa.String(), nullable=False),
        sa.Column('node_type', sa.String(), server_default='choice'),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('media_url', sa.String()),
        sa.Column('timer_seconds', sa.Integer()),
        sa.Column('is_terminal', sa.Boolean(), server_default=sa.false()),
        sa.Column('meta', postgresql.JSONB(), server_default='{}'),
        sa.UniqueConstraint('scenario_id', 'node_key', name='uq_node_scenario_key'),
    )
    op.create_index('ix_scenario_nodes_scenario_id', 'scenario_nodes', ['scenario_id'])

    op.create_table('node_choices',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('node_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('scenario_nodes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('label', sa.String(), nullable=False),
        sa.Column('next_node_key', sa.String()),
        sa.Column('loyalty_delta', sa.Integer(), server_default='0'),
        sa.Column('safety_delta', sa.Integer(), server_default='0'),
        sa.Column('score_delta', sa.Integer(), server_default='0'),
        sa.Column('competence', sa.String()),
        sa.Column('feedback', sa.Text()),
        sa.Column('order_index', sa.Integer(), server_default='0'),
    )
    op.create_index('ix_node_choices_node_id', 'node_choices', ['node_id'])

    op.create_table('user_game_profiles',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('xp', sa.Integer(), server_default='0'),
        sa.Column('level', sa.Integer(), server_default='1'),
        sa.Column('completed_scenarios', sa.Integer(), server_default='0'),
        sa.Column('best_score', sa.Integer(), server_default='0'),
        sa.Column('loyalty_avg', sa.Integer(), server_default='0'),
        sa.Column('safety_avg', sa.Integer(), server_default='0'),
        sa.Column('updated_at', sa.DateTime()),
    )

    op.create_table('scenario_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('scenario_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('scenarios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.Enum('in_progress','finished','abandoned', name='run_status'), server_default='in_progress'),
        sa.Column('current_node_key', sa.String()),
        sa.Column('loyalty', sa.Integer(), server_default='50'),
        sa.Column('safety', sa.Integer(), server_default='50'),
        sa.Column('score', sa.Integer(), server_default='0'),
        sa.Column('choices_log', postgresql.JSONB(), server_default='[]'),
        sa.Column('started_at', sa.DateTime()),
        sa.Column('finished_at', sa.DateTime()),
    )
    op.create_index('ix_scenario_runs_user_id', 'scenario_runs', ['user_id'])
    op.create_index('ix_scenario_runs_scenario_id', 'scenario_runs', ['scenario_id'])

    op.create_table('achievements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('code', sa.String(), nullable=False, unique=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('icon', sa.String()),
        sa.Column('condition', postgresql.JSONB(), server_default='{}'),
    )
    op.create_index('ix_achievements_code', 'achievements', ['code'], unique=True)

    op.create_table('user_achievements',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('achievement_code', sa.String(), sa.ForeignKey('achievements.code', ondelete='CASCADE'), primary_key=True),
        sa.Column('awarded_at', sa.DateTime()),
    )

    op.create_table('analytics_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True)),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('payload', postgresql.JSONB(), server_default='{}'),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_index('ix_analytics_events_user_id', 'analytics_events', ['user_id'])
    op.create_index('ix_analytics_events_run_id', 'analytics_events', ['run_id'])


def downgrade() -> None:
    op.drop_table('analytics_events')
    op.drop_table('user_achievements')
    op.drop_table('achievements')
    op.drop_table('scenario_runs')
    op.drop_table('user_game_profiles')
    op.drop_table('node_choices')
    op.drop_table('scenario_nodes')
    op.drop_table('scenarios')
