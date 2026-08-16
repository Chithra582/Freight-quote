import pytest
from decimal import Decimal
from apps.pricing.cost_engine import CostEngine
from core.enums import Incoterm


@pytest.mark.django_db
def test_incoterms_cost_responsibility():
    engine = CostEngine()

    # Test EXW: Buyer pays pickup, origin THC, freight, dest THC, delivery
    exw_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm=Incoterm.EXW,
        container_count=1, pickup_km=50.0, delivery_km=40.0
    )
    exw_codes = [c['code'] for c in exw_res['components'] if c['included_in_buyer_quote']]
    assert 'ORIGIN_HAULAGE' in exw_codes
    assert 'THC_ORIGIN' in exw_codes
    assert 'BASE_FREIGHT' in exw_codes
    assert 'THC_DESTINATION' in exw_codes
    assert 'DEST_HAULAGE' in exw_codes

    # Test FOB: Origin paid by seller, Buyer pays freight, surcharges, dest THC, delivery
    fob_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm=Incoterm.FOB,
        container_count=1, pickup_km=50.0, delivery_km=40.0
    )
    fob_codes = [c['code'] for c in fob_res['components'] if c['included_in_buyer_quote']]
    assert 'ORIGIN_HAULAGE' not in fob_codes
    assert 'THC_ORIGIN' not in fob_codes
    assert 'BASE_FREIGHT' in fob_codes
    assert 'THC_DESTINATION' in fob_codes

    # Test CIF: Includes marine insurance
    cif_res = engine.calculate_cost_breakdown(
        origin_code='INNSA', dest_code='AEJEA', incoterm=Incoterm.CIF,
        container_count=1, declared_value=Decimal('50000.0')
    )
    cif_codes = [c['code'] for c in cif_res['components'] if c['included_in_buyer_quote']]
    assert 'MARINE_INSURANCE' in cif_codes
