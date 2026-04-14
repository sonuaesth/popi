"""add onboarding preferences

Revision ID: 8b61c5ed1a43
Revises: 4f031032609d
Create Date: 2026-04-12 23:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "8b61c5ed1a43"
down_revision: Union[str, Sequence[str], None] = "4f031032609d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "user_preferences",
        sa.Column(
            "allergies",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
    )
    op.add_column(
        "user_preferences",
        sa.Column("weight_kg", sa.Integer(), nullable=True),
    )
    op.add_column(
        "user_preferences",
        sa.Column("activity_level", sa.String(length=50), server_default="moderate", nullable=False),
    )
    op.add_column(
        "user_preferences",
        sa.Column("diet_type", sa.String(length=50), server_default="balanced", nullable=False),
    )
    op.add_column(
        "user_preferences",
        sa.Column("goal", sa.String(length=100), server_default="balanced nutrition", nullable=False),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("user_preferences", "goal")
    op.drop_column("user_preferences", "diet_type")
    op.drop_column("user_preferences", "activity_level")
    op.drop_column("user_preferences", "weight_kg")
    op.drop_column("user_preferences", "allergies")
