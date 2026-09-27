"""sync users schema with model

Revision ID: d1e2f3a4b5c6
Revises: c8e4b2f71d9a
Create Date: 2026-09-26
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, None] = 'c8e4b2f71d9a'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Переименовываем колонку role -> user_role
    op.alter_column('users', 'role', new_column_name='user_role')
    
    # 2. Переименовываем значения enum user_role: USER -> user, ADMIN -> admin, ROOT -> root
    op.execute("ALTER TYPE user_role RENAME VALUE 'USER' TO 'user'")
    op.execute("ALTER TYPE user_role RENAME VALUE 'ADMIN' TO 'admin'")
    op.execute("ALTER TYPE user_role RENAME VALUE 'ROOT' TO 'root'")
    # Добавляем 'client' (есть в модели, но не было в БД)
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client'")
    
    # 3. Создаём enum user_status
    user_status_enum = sa.Enum(
        'pending_verification', 'verificated', 'blocked',
        name='user_status', create_type=False
    )
    op.execute("CREATE TYPE user_status AS ENUM ('pending_verification', 'verificated', 'blocked')")
    
    # 4. Добавляем недостающие колонки
    op.add_column('users', sa.Column('user_status', sa.Enum('pending_verification', 'verificated', 'blocked', name='user_status'), server_default='verificated'))
    op.add_column('users', sa.Column('verified', sa.Boolean(), server_default='true'))
    op.add_column('users', sa.Column('username', sa.String(), nullable=True))
    op.add_column('users', sa.Column('name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('surname', sa.String(), nullable=True))
    op.add_column('users', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('vk_public_username', sa.String(), nullable=True))
    
    # 5. Обновляем существующих юзеров
    op.execute("UPDATE users SET verified = true, user_status = 'verificated' WHERE verified IS NULL")

def downgrade() -> None:
    op.drop_column('users', 'vk_public_username')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'description')
    op.drop_column('users', 'surname')
    op.drop_column('users', 'name')
    op.drop_column('users', 'username')
    op.drop_column('users', 'verified')
    op.drop_column('users', 'user_status')
    op.execute("DROP TYPE user_status")
    
    op.execute("ALTER TYPE user_role RENAME VALUE 'user' TO 'USER'")
    op.execute("ALTER TYPE user_role RENAME VALUE 'admin' TO 'ADMIN'")
    op.execute("ALTER TYPE user_role RENAME VALUE 'root' TO 'ROOT'")
    
    op.alter_column('users', 'user_role', new_column_name='role')
