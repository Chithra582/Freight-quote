import pytest
from decimal import Decimal
from apps.quotes.approval_engine import evaluate_quote_approval
from apps.quotes.margin_policy import resolve_margin_policy
from core.enums import UserRole


@pytest.mark.django_db
def test_margin_floor_and_approval_routing():
    policy = resolve_margin_policy(lane_key='GLOBAL')
    floor = policy['floor_pct']

    # 1. Normal margin >= floor -> auto-approved
    normal_eval = evaluate_quote_approval(
        margin_pct=Decimal('15.0'),
        floor_pct=floor,
        total_quote_value=Decimal('5000.0')
    )
    assert not normal_eval['requires_approval']
    assert normal_eval['is_auto_approved']

    # 2. Minor deficit (<= 5% below floor) -> SENIOR_BROKER
    minor_deficit = evaluate_quote_approval(
        margin_pct=floor - Decimal('2.0'),
        floor_pct=floor,
        total_quote_value=Decimal('5000.0')
    )
    assert minor_deficit['requires_approval']
    assert minor_deficit['approver_role'] == UserRole.SENIOR_BROKER

    # 3. Severe deficit (> 5% below floor) -> PRICING_MANAGER
    severe_deficit = evaluate_quote_approval(
        margin_pct=floor - Decimal('6.0'),
        floor_pct=floor,
        total_quote_value=Decimal('5000.0')
    )
    assert severe_deficit['requires_approval']
    assert severe_deficit['approver_role'] == UserRole.PRICING_MANAGER

    # 4. High value (> $50,000) -> PRICING_MANAGER
    high_val = evaluate_quote_approval(
        margin_pct=Decimal('18.0'),
        floor_pct=floor,
        total_quote_value=Decimal('75000.0')
    )
    assert high_val['requires_approval']
    assert high_val['approver_role'] == UserRole.PRICING_MANAGER
