from decimal import Decimal
from typing import Dict, Any, Optional
from core.enums import UserRole


def evaluate_quote_approval(
    margin_pct: Decimal,
    floor_pct: Decimal,
    total_quote_value: Decimal,
    is_predicted_rate: bool = False
) -> Dict[str, Any]:
    """
    Evaluates business approval thresholds:
    - Order 1: Margin below lane floor by > 5 percentage points -> PRICING_MANAGER
    - Order 2: Margin below lane floor by <= 5 percentage points -> SENIOR_BROKER
    - Order 3: High value quote (> $50,000 USD) -> PRICING_MANAGER
    - Order 4: Uncontracted predicted market rate -> SENIOR_BROKER
    """
    requires_approval = False
    approver_role = None
    breach_reasons = []

    # Check margin floor breach
    if margin_pct < floor_pct:
        requires_approval = True
        deficit = floor_pct - margin_pct
        if deficit > Decimal('5.0'):
            approver_role = UserRole.PRICING_MANAGER
            breach_reasons.append(f"Margin ({margin_pct}%) is more than 5% below mandatory policy floor ({floor_pct}%). Requires Pricing Manager authorization.")
        else:
            if not approver_role:
                approver_role = UserRole.SENIOR_BROKER
            breach_reasons.append(f"Margin ({margin_pct}%) is below policy floor ({floor_pct}%). Requires Senior Broker review.")

    # Check high value threshold
    if total_quote_value > Decimal('50000.0000'):
        requires_approval = True
        approver_role = UserRole.PRICING_MANAGER
        breach_reasons.append(f"High value transaction (${total_quote_value:,.2f} USD). Requires Pricing Manager approval.")

    # Check uncontracted rate
    if is_predicted_rate:
        requires_approval = True
        if approver_role != UserRole.PRICING_MANAGER:
            approver_role = UserRole.SENIOR_BROKER
        breach_reasons.append("Contains components with uncontracted predicted market rates. Requires Senior Broker validation.")

    return {
        'requires_approval': requires_approval,
        'approver_role': approver_role,
        'breach_reasons': breach_reasons,
        'is_auto_approved': not requires_approval
    }
