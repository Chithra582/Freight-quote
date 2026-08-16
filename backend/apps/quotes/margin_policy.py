from decimal import Decimal
from typing import Dict, Any, Optional
from apps.quotes.models import MarginPolicy
from core.enums import MarginPolicyScope
from core.money import to_decimal


def resolve_margin_policy(
    lane_key: Optional[str] = None,
    customer_tier: Optional[str] = None,
    cargo_type: Optional[str] = None
) -> Dict[str, Decimal]:
    """
    Resolves the applicable margin policy hierarchically:
    1. Trade Lane specific policy (LANE)
    2. Customer Tier specific policy (CUSTOMER_TIER)
    3. Cargo Type specific policy (CARGO_TYPE)
    4. Global default policy (GLOBAL)
    """
    # 1. Lane match
    if lane_key:
        p = MarginPolicy.objects.filter(scope=MarginPolicyScope.LANE, scope_key=lane_key, is_active=True).first()
        if p:
            return {'floor_pct': p.floor_pct, 'target_pct': p.target_pct, 'stretch_pct': p.stretch_pct, 'scope': 'LANE'}

    # 2. Customer tier match
    if customer_tier:
        p = MarginPolicy.objects.filter(scope=MarginPolicyScope.CUSTOMER_TIER, scope_key=customer_tier, is_active=True).first()
        if p:
            return {'floor_pct': p.floor_pct, 'target_pct': p.target_pct, 'stretch_pct': p.stretch_pct, 'scope': 'CUSTOMER_TIER'}

    # 3. Cargo type match
    if cargo_type:
        p = MarginPolicy.objects.filter(scope=MarginPolicyScope.CARGO_TYPE, scope_key=cargo_type, is_active=True).first()
        if p:
            return {'floor_pct': p.floor_pct, 'target_pct': p.target_pct, 'stretch_pct': p.stretch_pct, 'scope': 'CARGO_TYPE'}

    # 4. Global match
    p_global = MarginPolicy.objects.filter(scope=MarginPolicyScope.GLOBAL, is_active=True).first()
    if p_global:
        return {'floor_pct': p_global.floor_pct, 'target_pct': p_global.target_pct, 'stretch_pct': p_global.stretch_pct, 'scope': 'GLOBAL'}

    # Default fallback
    return {
        'floor_pct': Decimal('12.000'),
        'target_pct': Decimal('18.000'),
        'stretch_pct': Decimal('24.000'),
        'scope': 'SYSTEM_DEFAULT'
    }
