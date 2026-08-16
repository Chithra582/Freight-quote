from decimal import Decimal
from typing import Dict, List, Any, Optional
from datetime import date
from apps.masterdata.models import Port, Carrier, Currency, FxRate
from apps.pricing.models import RateCardLine, Surcharge, RateHistory
from core.money import to_decimal, round_money, convert_currency
from core.enums import Incoterm, TransportMode, CalculationType


class CostEngine:
    """
    Deterministic Buy-Side Cost Build-Up Engine:
    - Resolves contracted carrier rate card lines or predicted market rates
    - Evaluates all applicable surcharges (BAF, CAF, THC, ISPS, PSS, LSS, DOC)
    - Enforces strict Incoterm cost responsibility mapping across EXW, FCA, FOB, CIF, CFR, DAP, DDP
    - Zero floating point calculations - uses exact Decimal(14,4) throughout
    """

    def calculate_cost_breakdown(
        self,
        origin_code: str,
        dest_code: str,
        mode: str = 'OCEAN',
        load_type: str = 'FCL',
        incoterm: str = 'FOB',
        container_type: str = '40HC',
        container_count: int = 1,
        chargeable_units: Decimal = Decimal('1.0'),
        carrier_code: Optional[str] = None,
        pickup_km: float = 0.0,
        delivery_km: float = 0.0,
        declared_value: Decimal = Decimal('0.0'),
        target_currency: str = 'USD'
    ) -> Dict[str, Any]:
        incoterm_u = incoterm.upper()
        mode_u = mode.upper()
        cnt_count_d = to_decimal(container_count)
        chg_units_d = to_decimal(chargeable_units)

        # 1. Resolve Base Line-Haul Rate
        base_line = None
        if carrier_code:
            base_line = RateCardLine.objects.filter(
                origin_port__un_locode=origin_code,
                destination_port__un_locode=dest_code,
                container_type=container_type,
                rate_card__carrier__code=carrier_code,
                rate_card__is_active=True
            ).select_related('rate_card', 'currency').first()

        if not base_line:
            base_line = RateCardLine.objects.filter(
                origin_port__un_locode=origin_code,
                destination_port__un_locode=dest_code,
                container_type=container_type,
                rate_card__is_active=True
            ).select_related('rate_card', 'currency').first()

        is_predicted = False
        if base_line:
            unit_rate = base_line.base_rate
            source_tag = 'RATE_CARD'
        else:
            # Fallback predicted market baseline
            is_predicted = True
            source_tag = 'PREDICTED'
            unit_rate = Decimal('1950.0000') if '40' in container_type else Decimal('1250.0000')
            if mode_u == 'AIR':
                unit_rate = Decimal('4.2500')

        if mode_u == 'OCEAN' and load_type.upper() == 'FCL':
            base_freight = round_money(unit_rate * cnt_count_d)
        else:
            base_freight = round_money(unit_rate * chg_units_d)

        # 2. Build Itemized Cost Components
        components: List[Dict[str, Any]] = []

        # (a) Origin Haulage / Pickup (Paid by Buyer under EXW)
        origin_pickup_charge = Decimal('0.0000')
        if pickup_km > 0:
            rate_per_km = Decimal('1.8500')
            origin_pickup_charge = round_money(to_decimal(pickup_km) * rate_per_km * cnt_count_d)

        is_origin_pickup_in_quote = (incoterm_u == Incoterm.EXW)
        components.append({
            'code': 'ORIGIN_HAULAGE',
            'name': 'Origin Pre-Carriage Road Pickup',
            'amount': str(origin_pickup_charge),
            'currency': 'USD',
            'source': 'MANUAL' if origin_pickup_charge > 0 else 'PREDICTED',
            'included_in_buyer_quote': is_origin_pickup_in_quote,
            'incoterm_responsibility': 'Buyer' if is_origin_pickup_in_quote else 'Seller'
        })

        # (b) Origin Terminal Handling & Export Documentation (Paid by Buyer under EXW, FCA)
        origin_thc = round_money(Decimal('185.0000') * cnt_count_d)
        origin_doc = Decimal('75.0000')
        is_origin_terminal_in_quote = (incoterm_u in (Incoterm.EXW, Incoterm.FCA))

        components.append({
            'code': 'THC_ORIGIN',
            'name': 'Origin Terminal Handling Charge (THC-O)',
            'amount': str(origin_thc),
            'currency': 'USD',
            'source': 'TARIFF',
            'included_in_buyer_quote': is_origin_terminal_in_quote,
            'incoterm_responsibility': 'Buyer' if is_origin_terminal_in_quote else 'Seller'
        })

        components.append({
            'code': 'EXPORT_DOC',
            'name': 'Export Customs Documentation & Bill of Lading Fee',
            'amount': str(origin_doc),
            'currency': 'USD',
            'source': 'TARIFF',
            'included_in_buyer_quote': is_origin_terminal_in_quote,
            'incoterm_responsibility': 'Buyer' if is_origin_terminal_in_quote else 'Seller'
        })

        # (c) Base Ocean / Air Freight (Paid by Buyer under EXW, FCA, FOB)
        is_freight_in_buyer_quote = (incoterm_u in (Incoterm.EXW, Incoterm.FCA, Incoterm.FOB))
        components.append({
            'code': 'BASE_FREIGHT',
            'name': f'Main Leg {mode_u} Base Freight',
            'amount': str(base_freight),
            'currency': 'USD',
            'source': source_tag,
            'included_in_buyer_quote': is_freight_in_buyer_quote,
            'incoterm_responsibility': 'Buyer' if is_freight_in_buyer_quote else 'Seller'
        })

        # (d) Ocean Mandatory Surcharges (BAF, CAF, ISPS, PSS)
        surcharges_total = Decimal('0.0000')
        active_surcharges = Surcharge.objects.filter(is_active=True)
        if not active_surcharges.exists():
            # Default standard maritime surcharges
            default_scs = [
                ('BAF', 'Bunker Adjustment Factor (Fuel)', CalculationType.PERCENT, Decimal('10.0')),
                ('ISPS', 'International Ship & Port Security', CalculationType.PER_CONTAINER, Decimal('25.0')),
                ('PSS', 'Peak Season Surcharge', CalculationType.PER_CONTAINER, Decimal('150.0')),
                ('LSS', 'Low Sulphur Fuel Surcharge', CalculationType.PER_CONTAINER, Decimal('45.0')),
            ]
            for sc_code, sc_name, sc_type, sc_val in default_scs:
                if sc_type == CalculationType.PERCENT:
                    sc_amount = round_money((sc_val / Decimal('100.0')) * base_freight)
                else:
                    sc_amount = round_money(sc_val * cnt_count_d)

                surcharges_total += sc_amount
                components.append({
                    'code': sc_code,
                    'name': sc_name,
                    'amount': str(sc_amount),
                    'currency': 'USD',
                    'source': 'TARIFF',
                    'included_in_buyer_quote': is_freight_in_buyer_quote,
                    'incoterm_responsibility': 'Buyer' if is_freight_in_buyer_quote else 'Seller'
                })
        else:
            for sc in active_surcharges:
                if sc.calculation_type == CalculationType.PERCENT:
                    sc_amount = round_money((sc.value / Decimal('100.0')) * base_freight)
                elif sc.calculation_type == CalculationType.PER_CONTAINER:
                    sc_amount = round_money(sc.value * cnt_count_d)
                else:
                    sc_amount = round_money(sc.value)

                surcharges_total += sc_amount
                components.append({
                    'code': sc.code,
                    'name': sc.name,
                    'amount': str(sc_amount),
                    'currency': 'USD',
                    'source': 'RATE_CARD',
                    'included_in_buyer_quote': is_freight_in_buyer_quote,
                    'incoterm_responsibility': 'Buyer' if is_freight_in_buyer_quote else 'Seller'
                })

        # (e) Destination Terminal Handling (THC-D) (Paid by Buyer under EXW, FCA, FOB, CFR, CIF)
        dest_thc = round_money(Decimal('220.0000') * cnt_count_d)
        is_dest_thc_in_buyer_quote = (incoterm_u in (Incoterm.EXW, Incoterm.FCA, Incoterm.FOB, Incoterm.CFR, Incoterm.CIF))

        components.append({
            'code': 'THC_DESTINATION',
            'name': 'Destination Terminal Handling Charge (THC-D)',
            'amount': str(dest_thc),
            'currency': 'USD',
            'source': 'TARIFF',
            'included_in_buyer_quote': is_dest_thc_in_buyer_quote,
            'incoterm_responsibility': 'Buyer' if is_dest_thc_in_buyer_quote else 'Seller'
        })

        # (f) Destination Delivery Haulage (Paid by Buyer under EXW, FCA, FOB, CFR, CIF)
        dest_delivery_charge = Decimal('0.0000')
        if delivery_km > 0:
            rate_per_km = Decimal('2.1000')
            dest_delivery_charge = round_money(to_decimal(delivery_km) * rate_per_km * cnt_count_d)

        components.append({
            'code': 'DEST_HAULAGE',
            'name': 'Destination On-Carriage Final Delivery',
            'amount': str(dest_delivery_charge),
            'currency': 'USD',
            'source': 'MANUAL' if dest_delivery_charge > 0 else 'PREDICTED',
            'included_in_buyer_quote': is_dest_thc_in_buyer_quote,
            'incoterm_responsibility': 'Buyer' if is_dest_thc_in_buyer_quote else 'Seller'
        })

        # (g) Marine Insurance (Included in CIF and DDP)
        marine_insurance = Decimal('0.0000')
        if declared_value > 0:
            marine_insurance = round_money(declared_value * Decimal('0.0035'))  # 0.35% of cargo value

        components.append({
            'code': 'MARINE_INSURANCE',
            'name': 'Marine Cargo Insurance Policy',
            'amount': str(marine_insurance),
            'currency': 'USD',
            'source': 'PREDICTED',
            'included_in_buyer_quote': (incoterm_u in (Incoterm.CIF, Incoterm.DDP)),
            'incoterm_responsibility': 'Included'
        })

        # 3. Sum Total Buy-Side Cost (Only components that are the buyer's responsibility for this quote)
        total_buy_cost = Decimal('0.0000')
        for c in components:
            if c['included_in_buyer_quote']:
                total_buy_cost += to_decimal(c['amount'])

        total_buy_cost = round_money(total_buy_cost)

        return {
            'total_buy_cost': str(total_buy_cost),
            'currency': target_currency,
            'base_freight': str(base_freight),
            'surcharges_total': str(round_money(surcharges_total)),
            'is_predicted': is_predicted,
            'source': source_tag,
            'components': components
        }
