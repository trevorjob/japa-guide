"""
Core utilities for Japaguide.
"""
from decimal import Decimal


def calculate_migration_costs(country, city, visa_type, duration_months, inputs, num_dependents=0):
    """
    Enhanced cost calculation with country defaults and hidden costs.
    
    Args:
        country: Country model instance
        city: City name string
        visa_type: Visa type string
        duration_months: Duration in months
        inputs: Dict with user inputs (can override defaults)
        num_dependents: Number of dependents
    
    Returns:
        Dict with comprehensive cost breakdown
    """
    # Use country defaults if not provided
    monthly_rent = inputs.get('rent_monthly') or country.avg_rent_monthly_usd or Decimal('800')
    monthly_living = inputs.get('living_monthly') or (
        (country.avg_meal_cost_usd or Decimal('10')) * 60  # ~2 meals/day
    )
    monthly_healthcare = country.healthcare_monthly_usd or Decimal('100')
    
    # Calculate base costs
    breakdown = {
        'visa_application': Decimal(str(inputs.get('visa_fees', 150))),
        'flights': Decimal(str(inputs.get('flights', 1200))) * (1 + num_dependents),
        'insurance': Decimal(str(inputs.get('insurance_yearly', 600))) * (Decimal(duration_months) / 12),
        'tuition': Decimal(str(inputs.get('tuition_yearly', 0))) * (Decimal(duration_months) / 12),
        'accommodation': monthly_rent * duration_months * (1 + num_dependents * Decimal('0.5')),
        'living_expenses': monthly_living * duration_months * (1 + num_dependents * Decimal('0.7')),
        'healthcare': monthly_healthcare * duration_months * (1 + num_dependents),
        'phone_internet': Decimal('60') * duration_months,
        'transportation': Decimal('100') * duration_months * (1 + num_dependents * Decimal('0.3')),
    }
    
    # Add hidden costs from country metadata
    hidden_costs = []
    if country.metadata.get('hidden_costs'):
        for cost_item in country.metadata['hidden_costs']:
            # Just add as-is for now
            hidden_costs.append({
                'item': cost_item,
                'estimated': 300  # Default estimate
            })
    
    # Add standard hidden costs
    hidden_costs.extend([
        {'item': 'Initial apartment deposit', 'estimated': float(monthly_rent * 2)},
        {'item': 'Furniture & setup', 'estimated': 1500},
        {'item': 'Documents translation/notarization', 'estimated': 300},
    ])
    
    # Calculate buffer
    subtotal = sum(breakdown.values())
    buffer_pct = Decimal(str(inputs.get('buffer_percentage', 20))) / 100
    breakdown['buffer'] = subtotal * buffer_pct
    
    total = subtotal + breakdown['buffer']
    
    # Savings plans
    months_to_save = inputs.get('months_to_save', 12)
    
    savings_plan = {
        'months_to_save': months_to_save,
        'monthly_target': float(total / months_to_save),
        'aggressive_plan': {
            'months': max(6, int(months_to_save * 0.66)),
            'monthly': float(total / max(6, int(months_to_save * 0.66)))
        },
        'relaxed_plan': {
            'months': int(months_to_save * 1.5),
            'monthly': float(total / (months_to_save * 1.5))
        }
    }
    
    # Convert Decimal to float for JSON serialization
    breakdown_float = {k: float(v) for k, v in breakdown.items()}
    
    return {
        'total_estimated': float(total),
        'breakdown': breakdown_float,
        'hidden_costs': hidden_costs,
        'monthly_breakdown': {
            'essential': float(monthly_rent + monthly_living + monthly_healthcare),
            'optional': 100,
            'total': float(monthly_rent + monthly_living + monthly_healthcare + 100)
        },
        'savings_plan': savings_plan,
        'cost_comparison': {
            'your_estimate': float(total),
            'typical_range': f"{float(total * Decimal('0.85')):.0f}-{float(total * Decimal('1.15')):.0f}",
            'percentile': '60th'
        },
        'currency': 'USD'
    }


def claim_session_data(user, session_key):
    """
    Migrate anonymous session data to user account.
    
    Args:
        user: User model instance
        session_key: Session key string
    
    Returns:
        Dict with migration stats
    """
    from roadmaps.models import Roadmap
    from ai.models import AIRequest
    
    # Find all session-based records
    roadmaps = Roadmap.objects.filter(session_id=session_key, user__isnull=True)
    ai_requests = AIRequest.objects.filter(session_id=session_key, user__isnull=True)
    
    # Migrate to user account
    roadmap_count = roadmaps.update(user=user, session_id='', is_anonymous=False)
    ai_request_count = ai_requests.update(user=user, session_id='')
    
    # Mark user as converted from anonymous
    user.is_anonymous_converted = True
    user.save()
    
    return {
        'migrated_roadmaps': roadmap_count,
        'migrated_ai_requests': ai_request_count,
    }
