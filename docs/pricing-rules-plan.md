# Pricing Rules Configuration System

## Overview
Admin-configurable pricing rules with distance-based tiers, per-currency support, and version history tracking.

## Requirements
- **Per-currency rules**: Separate distance tiers for CRC and USD
- **Distance tiers**: e.g., 0-5km = ₡1500, 5-10km = ₡2500, 10+ km = ₡500/km
- **Simple versioning**: Track changes, only latest version active
- **Admin UI**: Manage pricing rules in admin dashboard

## Data Model

### PricingRule (main configuration)
```
pricing_rules
├── id
├── currency_code (FK → currencies.code)
├── name (string) - "Standard Pricing CRC"
├── base_fare (decimal 12,2) - minimum fare
├── tax_rate (decimal 6,4) - e.g., 0.13 for 13%
├── version (integer) - auto-increment per currency
├── is_active (boolean) - only one active per currency
├── effective_from (datetime, nullable) - when rule became active
├── notes (text, nullable) - admin notes
├── created_at / updated_at
```

### PricingTier (distance-based fees)
```
pricing_tiers
├── id
├── pricing_rule_id (FK → pricing_rules.id)
├── min_km (decimal 8,2) - tier start (e.g., 0)
├── max_km (decimal 8,2, nullable) - tier end (null = unlimited)
├── flat_fee (decimal 12,2, nullable) - fixed fee for this tier
├── per_km_rate (decimal 10,2, nullable) - rate per km in this tier
├── order (integer) - sort order
├── created_at / updated_at
```

### Example Data
```
CRC Pricing Rule (v1, active):
├── base_fare: 1500
├── tax_rate: 0.13
├── Tiers:
│   ├── 0-5 km: flat_fee = 1500
│   ├── 5-10 km: flat_fee = 2500
│   └── 10+ km: per_km_rate = 500

USD Pricing Rule (v1, active):
├── base_fare: 3.00
├── tax_rate: 0.13
├── Tiers:
│   ├── 0-5 km: flat_fee = 3.00
│   ├── 5-10 km: flat_fee = 5.00
│   └── 10+ km: per_km_rate = 1.00
```

## Backend Implementation

### Files to Create

**Models:**
- `app/Models/PricingRule.php`
- `app/Models/PricingTier.php`

**DTOs:**
- `app/Data/Pricing/PricingRuleData.php`
- `app/Data/Pricing/PricingTierData.php`
- `app/Data/Pricing/StorePricingRuleData.php`
- `app/Data/Pricing/UpdatePricingRuleData.php`

**Controller:**
- `app/Http/Controllers/PricingRuleController.php`

**Service:**
- `app/Services/PricingService.php` - calculate fees from rules

**Migration:**
- `database/migrations/xxxx_create_pricing_rules_table.php`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pricing-rules` | List all rules (with versions) |
| GET | `/pricing-rules/active` | Get active rules per currency |
| GET | `/pricing-rules/{id}` | Get rule with tiers |
| POST | `/pricing-rules` | Create new rule (auto-version) |
| PATCH | `/pricing-rules/{id}` | Update rule |
| POST | `/pricing-rules/{id}/activate` | Set as active for currency |
| DELETE | `/pricing-rules/{id}` | Soft delete |

### PricingService

```php
class PricingService
{
    // Calculate distance fee based on active rule
    public function calculateDistanceFee(
        string $currency,
        float $distanceKm
    ): float;

    // Get active rule for currency
    public function getActiveRule(string $currency): ?PricingRule;

    // Create new version of rule
    public function createVersion(
        string $currency,
        array $data
    ): PricingRule;
}
```

### Quote Integration

Update `StoreQuoteData.php` to use PricingService:
- If `distanceFee` not provided, auto-calculate from active pricing rule
- Store which pricing_rule_id was used on quote (optional audit field)

## Admin Implementation

### Files to Create

**Service:**
- `services/pricingService.ts`

**Hooks:**
- `hooks/pricing/index.ts`
- `hooks/pricing/usePricingRules.ts`
- `hooks/pricing/usePricingRule.ts`
- `hooks/pricing/usePricingMutations.ts`

**Pages:**
- `app/(dashboard)/pricing/page.tsx` - List rules
- `app/(dashboard)/pricing/[id]/page.tsx` - Edit rule with tiers
- `app/(dashboard)/pricing/create/page.tsx` - Create new rule

**Components:**
- `components/pricing/PricingTierForm.tsx` - Add/edit tier rows
- `components/pricing/PricingRuleCard.tsx` - Display rule summary

### UI Features

1. **List View**:
   - Show active rule per currency (highlighted)
   - Show version history collapsed
   - "Create New Rule" button

2. **Edit View**:
   - Currency selector (locked after creation)
   - Base fare input
   - Tax rate input
   - Dynamic tier rows (add/remove)
   - Each tier: min_km, max_km, flat_fee OR per_km_rate
   - "Save as Draft" / "Save & Activate"

3. **Sidebar Navigation**:
   - Add "Pricing" link to sidebar

## File Changes Summary

### Backend (app/api)
```
app/
├── Models/
│   ├── PricingRule.php (NEW)
│   └── PricingTier.php (NEW)
├── Data/Pricing/
│   ├── PricingRuleData.php (NEW)
│   ├── PricingTierData.php (NEW)
│   ├── StorePricingRuleData.php (NEW)
│   └── UpdatePricingRuleData.php (NEW)
├── Http/Controllers/
│   └── PricingRuleController.php (NEW)
├── Services/
│   └── PricingService.php (NEW)
├── Policies/
│   └── PricingRulePolicy.php (NEW)
database/migrations/
└── xxxx_create_pricing_tables.php (NEW)
routes/
└── api.php (MODIFY - add pricing routes)
```

### Admin (app/admin)
```
app/(dashboard)/pricing/
├── page.tsx (NEW)
├── [id]/page.tsx (NEW)
└── create/page.tsx (NEW)
components/
├── layout/Sidebar.tsx (MODIFY - add pricing link)
└── pricing/
    ├── PricingTierForm.tsx (NEW)
    └── PricingRuleCard.tsx (NEW)
services/
└── pricingService.ts (NEW)
hooks/pricing/
├── index.ts (NEW)
├── usePricingRules.ts (NEW)
├── usePricingRule.ts (NEW)
└── usePricingMutations.ts (NEW)
```

## Verification Plan

### Backend
1. Run migration: `php artisan migrate`
2. Create test pricing rule via tinker
3. Test API endpoints with curl/Postman
4. Verify only one active rule per currency
5. Verify version auto-increment

### Admin
1. Navigate to /pricing
2. Create new CRC pricing rule with 3 tiers
3. Create new USD pricing rule
4. Edit existing rule, save
5. Activate different version
6. Verify CreateQuoteDialog shows calculated fee

### Integration
1. Create order with known distance
2. Open CreateQuoteDialog
3. Verify distance fee pre-calculated from active rule
4. Create quote, verify pricing applied correctly

## Future Enhancements (Out of Scope)
- Time-based surcharges (rush hour)
- Geographic zones
- Business-specific pricing
- Promotional discounts
- Surcharge categories (fragile, hazmat)
