declare namespace App.Data {
  export type NotificationData = {
    id: string;
    type: string;
    data: Array<any>;
    readAt: string | null;
    createdAt: string | null;
  };
}
declare namespace App.Data.Address {
  export type AddressData = {
    id: number;
    publicId: string;
    ownerId: number | null;
    ownerType: string | null;
    type: App.Enums.AddressType;
    streetAddress: string | null;
    label?: string | null;
    premise?: string | null;
    placeId?: string | null;
    additionalInfo?: string | null;
    globalCode: string;
    compoundCode: string;
    isPrimary: boolean;
    isPhysical: boolean;
    latitude: number;
    longitude: number;
    humanReadableAddress: string;
    country: App.Data.Location.LocationData;
    state: App.Data.Location.LocationData;
    city: App.Data.Location.LocationData;
    district: App.Data.Location.LocationData;
    geoHash?: string | null;
    placeHash?: string | null;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    owner?: App.Data.User.UserData | App.Data.Business.BusinessData;
  };
  export type FetchAddressData = {
    latitude: number;
    longitude: number;
    placeId: string | null;
  };
  export type MapAddressData = {
    humanReadableAddress: string;
    country: string;
    state: string;
    city: string;
    district: string;
    streetAddress: string | null;
    premise: string | null;
    latitude: number;
    longitude: number;
    globalCode: string;
    compoundCode: string;
  };
  export type PlaceAutocompleteItemData = {
    placeId: string;
    description: string;
  };
  export type PlaceAutocompleteRequestData = {
    input: string;
    lat: number | null;
    lng: number | null;
    radius: number | null;
  };
  export type PlaceDetailsData = {
    placeId: string;
    name: string;
    formattedAddress: string;
    lat: number;
    lng: number;
  };
  export type PlaceDetailsRequestData = {
    placeId: string;
  };
  export type StoreAddressData = {
    latitude: number;
    longitude: number;
    label: string;
    placeId?: string;
    additionalInfo?: string;
    isPrimary: boolean;
  };
  export type StoreAddressRegistrationData = {
    latitude: number;
    longitude: number;
    label: string;
    additionalInfo?: string;
    placeId?: string;
  };
  export type StoreSnapshotAddressData = {
    latitude: number;
    longitude: number;
    placeId?: string;
    additionalInfo?: string;
  };
  export type UpdateAddressData = {
    latitude: number;
    longitude: number;
    isPrimary: boolean;
    label?: string;
    placeId: string | null;
    additionalInfo: string | null;
  };
}
declare namespace App.Data.Business {
  export type BusinessData = {
    id: number;
    publicId: string;
    name: string;
    typeName?: string;
    usersCanApproveOwnOrders?: boolean;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    addresses?: Array<App.Data.Address.AddressData>;
    primaryAddress?: App.Data.Address.AddressData;
    user?: App.Data.User.UserData;
  };
  export type StoreBusinessData = {
    user: App.Data.User.StoreUserData;
    address: App.Data.Address.StoreAddressRegistrationData;
    name: string;
    typeId: number;
    usersCanApproveOwnOrders?: boolean;
  };
  export type UpdateBusinessData = {
    name?: string;
    typeId?: number;
    usersCanApproveOwnOrders?: boolean;
  };
}
declare namespace App.Data.Catalog {
  export type CatalogData = {
    id?: number;
    code?: string;
    name?: string;
    nameTranslations?: App.Data.Shared.FullLangData;
    description?: string | null;
    descriptionTranslations?: App.Data.Shared.FullLangData;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    elements?: Array<App.Data.CatalogElement.CatalogElementData>;
    elementsCount?: number;
  };
  export type StoreCatalogData = {
    code: string;
    name: App.Data.Shared.FullLangData;
    description?: App.Data.Shared.FullLangData;
  };
  export type UpdateCatalogData = {
    name?: App.Data.Shared.PartialLangData;
    description?: App.Data.Shared.PartialLangData;
  };
}
declare namespace App.Data.CatalogElement {
  export type CatalogElementData = {
    id?: number;
    catalogId?: number;
    code?: string;
    name?: string;
    nameTranslations?: App.Data.Shared.FullLangData;
    description?: string | null;
    descriptionTranslations?: App.Data.Shared.FullLangData;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    order?: number | null;
    parentIds?: Array<any>;
    meta?: Array<any>;
    catalog?: App.Data.Catalog.CatalogData;
  };
  export type StoreCatalogElementData = {
    code: string;
    name: App.Data.Shared.FullLangData;
    catalogId: number;
    description?: App.Data.Shared.FullLangData;
    order?: number | null;
    parentIds?: Array<any>;
    meta?: Array<any>;
  };
  export type UpdateCatalogElementData = {
    catalogId: number;
    name?: App.Data.Shared.PartialLangData;
    description?: App.Data.Shared.PartialLangData;
    order?: number | null;
    parentIds?: Array<any>;
    meta?: Array<any>;
  };
}
declare namespace App.Data.Chat {
  export type OrderMessageData = {
    id: number;
    orderId: number;
    businessId: number | null;
    userId: number;
    channel: App.Enums.ChatChannel;
    body: string | null;
    imageUrl: string | null;
    createdAt: string;
    user?: App.Data.User.UserData;
  };
}
declare namespace App.Data.Currency {
  export type CurrencyData = {
    code?: string;
    symbol?: string;
    name?: string;
    nameTranslations?: App.Data.Shared.FullLangData;
    precision?: number;
    isEnabled?: boolean;
    isBase?: boolean;
    roundingMode?: string;
    roundingIncrement?: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    currentRate?: number | null;
    rateDate?: string | null;
    rateSource?: string | null;
  };
  export type UpdateCurrencyData = {
    isEnabled?: boolean;
    roundingMode?: string;
    roundingIncrement?: number;
  };
}
declare namespace App.Data.Driver {
  export type DriverData = {
    id?: number;
    publicId?: string;
    userId?: number;
    licenseNumber?: string;
    licensePlateNumber?: string;
    licensePhotoFront?: string;
    licensePhotoBack?: string;
    licenseExpirationDate?: string;
    active?: boolean;
    isOutsourced?: boolean;
    currentLatitude?: number | null;
    currentLongitude?: number | null;
    locationUpdatedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    user?: App.Data.User.UserData;
  };
  export type StoreDriverData = {
    user: App.Data.User.StoreUserData;
    licenseNumber: string;
    licensePlateNumber: string;
    licensePhotoFront: string;
    licensePhotoBack: string;
    licenseExpirationDate: string;
  };
  export type UpdateDriverData = {
    licenseNumber?: string;
    licensePlateNumber?: string;
    licensePhotoFront?: string;
    licensePhotoBack?: string;
    licenseExpirationDate?: string;
    active?: boolean;
  };
  export type UpdateLocationData = {
    latitude: number;
    longitude: number;
  };
}
declare namespace App.Data.ExchangeRate {
  export type ExchangeRateData = {
    id?: number;
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    inverseRate: number;
    source: string;
    rateDate: string;
    fetchedAt?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}
declare namespace App.Data.Feasibility {
  export type DriverCandidate = {
    driverId: number;
    driverName: string;
    extraDistanceKm: number;
    suggestedPickup: string | null;
    suggestedDelivery: string | null;
    score: number;
    travelTimeMinutes: number | null;
  };
  export type FeasibilityResult = {
    level: App.Enums.FeasibilityLevel;
    candidates: Array<App.Data.Feasibility.DriverCandidate>;
    outsourceRequired: boolean;
    suggestedPickup: string | null;
    suggestedDelivery: string | null;
    windowStart: string | null;
    windowEnd: string | null;
    timeSensitive: boolean;
  };
}
declare namespace App.Data.Location {
  export type LocationData = {
    id?: number;
    name?: string;
    type?: string;
    parentId?: number | null;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    polygons?: Array<any>;
    parent?: App.Data.Location.LocationData;
    children?: App.Data.Location.LocationData;
  };
}
declare namespace App.Data.Order {
  export type OrderData = {
    id?: number;
    publicId?: string;
    userId?: number;
    businessId?: number | null;
    driverId?: number | null;
    fromName?: string;
    fromPhone?: string;
    fromAddressId?: number;
    toName?: string;
    toPhone?: string;
    toAddressId?: number;
    currencyCode?: string | null;
    currentQuoteId?: number | null;
    pin?: string | null;
    requiresPin?: boolean;
    isContactless?: boolean;
    deliveryTier?: App.Enums.DeliveryTier;
    timeSensitive?: boolean;
    description?: string | null;
    distanceKm?: number | null;
    estimatedMinutes?: number | null;
    status?: App.Enums.OrderStatus;
    paymentStatus?: App.Enums.PaymentStatus;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    pickupScheduledFor?: string | null;
    deliveryScheduledFor?: string | null;
    desiredDeliveryAt?: string | null;
    desiredPickupAt?: string | null;
    windowStart?: string | null;
    windowEnd?: string | null;
    pickupCompletedAt?: string | null;
    deliveryCompletedAt?: string | null;
    paidAt?: string | null;
    reconciledAt?: string | null;
    refundedAt?: string | null;
    user?: App.Data.User.UserData;
    business?: App.Data.Business.BusinessData | null;
    driver?: App.Data.Driver.DriverData | null;
    currentQuote?: App.Data.Quote.QuoteData;
    fromAddress?: App.Data.Address.AddressData;
    toAddress?: App.Data.Address.AddressData;
    quotes?: Array<App.Data.Quote.QuoteData>;
  };
  export type StoreOrderData = {
    fromName: string;
    fromPhone: string;
    fromAddress: App.Data.Address.StoreSnapshotAddressData;
    toName: string;
    toPhone: string;
    toAddress: App.Data.Address.StoreSnapshotAddressData;
    currencyCode: string;
    description?: string;
    desiredDeliveryAt: string | null;
    desiredPickupAt: string | null;
    requiresPin: boolean;
    isContactless: boolean;
    deliveryTier: App.Enums.DeliveryTier;
    timeSensitive: boolean;
  };
}
declare namespace App.Data.Payment {
  export type InitiatePaymentData = {
    orderPublicId: string;
    paymentMethodPublicId: string | null;
    amount: number | null;
    returnUrl: string | null;
  };
  export type PaymentData = {
    id?: number;
    publicId?: string;
    orderId?: number;
    paymentMethodId?: number | null;
    provider?: App.Enums.PaymentProvider;
    method?: App.Enums.PaymentMethodType | null;
    status?: App.Enums.TransactionStatus;
    amount?: number;
    currencyCode?: string;
    fxRate?: number | null;
    providerChargeId?: string | null;
    receiptUrl?: string | null;
    paidAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  export type PaymentMethodData = {
    id?: number;
    publicId?: string;
    userId?: number;
    businessId?: number | null;
    provider?: App.Enums.PaymentProvider;
    methodType?: App.Enums.PaymentMethodType;
    brand?: string | null;
    last4?: string | null;
    expMonth?: number | null;
    expYear?: number | null;
    isDefault?: boolean;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  export type RefundData = {
    id?: number;
    publicId?: string;
    paymentId?: number;
    orderId?: number | null;
    amount?: number;
    currencyCode?: string;
    reason?: string | null;
    refundedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  export type StoreRefundData = {
    amount: number;
    reason: string | null;
  };
}
declare namespace App.Data.Pricing {
  export type PricingRuleData = {
    id?: number;
    name?: string;
    serviceFee?: number;
    taxRate?: number;
    version?: number;
    status?: App.Enums.PricingRuleStatus;
    calculationMode?: App.Enums.PricingCalculationMode;
    effectiveFrom?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    tiers?: Array<App.Data.Pricing.PricingTierData>;
  };
  export type PricingTierData = {
    id?: number;
    pricingRuleId?: number;
    minKm?: number;
    maxKm?: number | null;
    flatFee?: number | null;
    perKmRate?: number | null;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  export type StorePricingRuleData = {
    name: string;
    serviceFee: number;
    taxRate: number;
    calculationMode: App.Enums.PricingCalculationMode;
    notes: string | null;
    activate: boolean;
    tiers?: Array<App.Data.Pricing.StorePricingTierData>;
  };
  export type StorePricingTierData = {
    minKm: number;
    maxKm: number | null;
    flatFee: number | null;
    perKmRate: number | null;
    order: number;
  };
  export type UpdatePricingRuleData = {
    name?: string;
    serviceFee?: number;
    taxRate?: number;
    calculationMode?: App.Enums.PricingCalculationMode;
    notes?: string | null;
    tiers?: Array<App.Data.Pricing.StorePricingTierData>;
  };
}
declare namespace App.Data.Quote {
  export type QuoteData = {
    id?: number;
    publicId?: string;
    orderId?: number;
    pricingRuleId?: number | null;
    version?: number;
    status?: App.Enums.QuoteStatus;
    isFinal?: boolean;
    finalizedAt?: string | null;
    pickupProposedFor?: string | null;
    deliveryProposedFor?: string | null;
    validUntil?: string | null;
    baseFare?: number | null;
    distanceKm?: number | null;
    distanceFee?: number | null;
    timeFee?: number | null;
    surcharge?: number | null;
    discountRate?: number | null;
    taxRate?: number | null;
    taxTotal?: number | null;
    total?: number | null;
    notes?: string | null;
    rejectionReason?: string | null;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    order?: App.Data.Order.OrderData;
    pricingRule?: App.Data.Pricing.PricingRuleData;
  };
  export type StoreQuoteData = {
    orderId: number;
    validUntil?: string;
    distanceKm: number;
    timeFee: number | null;
    surcharge: number | null;
    discountRate: number | null;
    pickupProposedFor: string | null;
    deliveryProposedFor: string | null;
    notes?: string | null;
  };
}
declare namespace App.Data.Route {
  export type AddStopData = {
    orderId: number;
    type: App.Enums.RouteStopType;
    scheduledFor?: string | null;
  };
  export type BatchAddStopsData = {
    stops: Array<any>;
    optimize: boolean;
  };
  export type CreateRouteWithStopsData = {
    date: string;
    driverId: number | null;
    stops: Array<any>;
    optimize: boolean;
  };
  export type FlagDelayData = {
    reason: string;
  };
  export type OptimizationResult = {
    success: boolean;
    stopsOptimized: number;
    conflictsFound: number;
    reassignedOrderIds: Array<any>;
    message: string;
  };
  export type ReassignStopData = {
    targetRouteId: number | null;
    newDriverId: number | null;
    date: string | null;
    optimize: boolean;
  };
  export type ReorderStopsData = {
    stopIds: Array<any>;
  };
  export type RouteData = {
    id?: number;
    publicId?: string;
    driverId?: number | null;
    date: string;
    status?: App.Enums.RouteStatus;
    notes?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    driver?: App.Data.Driver.DriverData | null;
    stops?: Array<App.Data.Route.RouteStopData>;
  };
  export type RouteStopData = {
    id: number;
    routeId?: number;
    orderId?: number;
    type: App.Enums.RouteStopType;
    sequence: number;
    status: App.Enums.RouteStopStatus;
    scheduledFor?: string | null;
    windowStart?: string | null;
    windowEnd?: string | null;
    delayFlaggedAt?: string | null;
    delayReason?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
    order?: App.Data.Order.OrderData;
  };
  export type StoreRouteData = {
    date: string;
    driverId?: number | null;
    notes?: string | null;
  };
  export type UpdateRouteData = {
    date?: string;
    driverId?: number | null;
    notes?: string | null;
    status?: string | null;
  };
}
declare namespace App.Data.Setting {
  export type SettingData = {
    noServiceStart: string;
    noServiceEnd: string;
    serviceWindowEnabled: boolean;
  };
  export type UpdateSettingData = {
    noServiceStart?: string;
    noServiceEnd?: string;
    serviceWindowEnabled?: boolean;
  };
}
declare namespace App.Data.Shared {
  export type FullLangData = {
    en: string;
    es: string;
    fr: string;
  };
  export type PartialLangData = {
    en?: string;
    es?: string;
    fr?: string;
  };
}
declare namespace App.Data.User {
  export type LoginData = {
    email: string;
    password: string;
    remember: boolean;
  };
  export type SetPasswordData = {
    password: string;
  };
  export type StoreBusinessUserData = {
    name: string;
    email: string;
    dateOfBirth: any;
    password: string;
    phone: string;
    sexId: number;
    langCode: string;
    avatar?: string;
  };
  export type StoreUserData = {
    name: string;
    email: string;
    dateOfBirth: any;
    password: string;
    phone: string;
    avatar: string;
    sexId: number;
    langCode: string;
    businessId?: number;
    isDriver?: boolean;
    login?: boolean;
  };
  export type UpdatePasswordData = {
    password: string;
    passwordConfirmation: string;
    currentPassword: string;
  };
  export type UpdateUserData = {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    sexId?: number;
    langCode?: string;
    preferredCurrency?: string | null;
  };
  export type UserData = {
    id: number;
    publicId: string;
    role: App.Enums.Role;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    langCode: string;
    preferredCurrency?: string | null;
    businessId?: number | null;
    sexId?: number | null;
    isAdmin: boolean;
    isBusinessAccount: boolean;
    isBusinessOwner: boolean;
    isBusinessUser: boolean;
    isDriver: boolean;
    isClient: boolean;
    createdAt?: string;
    updatedAt?: string;
    dateOfBirth?: string;
    emailVerifiedAt?: string | null;
    deletedAt?: string | null;
    rememberToken?: string | null;
    business?: App.Data.Business.BusinessData;
    driver?: App.Data.Driver.DriverData;
  };
}
declare namespace App.Enums {
  export enum AddressType {
    Saved = 'saved',
    Snapshot = 'snapshot',
  }
  export enum Attributes {
    ID = 'id',
    NAME = 'name',
    EMAIL = 'email',
    PHONE = 'phone',
    TYPE = 'type',
    ROLE = 'role',
    TOTAL = 'total',
    AVATAR = 'avatar',
    SEX_ID = 'sexId',
    SEX = 'sex',
    LANG_CODE = 'langCode',
    PASSWORD = 'password',
    NEW_PASSWORD = 'newPassword',
    CURRENT_PASSWORD = 'currentPassword',
    PASSWORD_CONFIRMATION = 'passwordConfirmation',
    ADDITIONAL_INFO = 'additionalInfo',
    LABEL = 'label',
    LATITUDE = 'latitude',
    LONGITUDE = 'longitude',
    IS_PRIMARY = 'isPrimary',
    IS_PHYSICAL = 'isPhysical',
    OWNER_ID = 'ownerId',
    OWNER_TYPE = 'ownerType',
    OWNER = 'owner',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    DELETED_AT = 'deletedAt',
    DATE_OF_BIRTH = 'dateOfBirth',
    EMAIL_VERIFIED_AT = 'emailVerifiedAt',
    FROM_NAME = 'fromName',
    FROM_PHONE = 'fromPhone',
    FROM_ADDRESS = 'fromAddress',
    TO_NAME = 'toName',
    TO_PHONE = 'toPhone',
    TO_ADDRESS = 'toAddress',
    DESCRIPTION = 'description',
    CURRENCY = 'currency',
    TIMESTAMPS = 'timestamps',
    STATUS = 'status',
    CODE = 'code',
    CITY = 'city',
    ELEMENTS = 'elements',
    ORDER = 'order',
    VERSION = 'version',
    NOTES = 'notes',
    LICENSE_NUMBER = 'licenseNumber',
    LICENSE_PLATE = 'licensePlate',
    LICENSE_EXPIRES = 'licenseExpires',
    EXPIRATION_DATE = 'expirationDate',
    BASE_FARE = 'baseFare',
    TAX_RATE = 'taxRate',
    TIERS = 'tiers',
    MIN_KM = 'minKm',
    MAX_KM = 'maxKm',
    FLAT_FEE = 'flatFee',
    PER_KM_RATE = 'perKmRate',
    DISTANCE_KM = 'distanceKm',
    SUBTOTAL = 'subtotal',
    TAX = 'tax',
    DISTANCE = 'distance',
    DISTANCE_FEE = 'distanceFee',
    TIME_FEE = 'timeFee',
    SURCHARGE = 'surcharge',
    DISCOUNT = 'discount',
    DELIVERY_TIER = 'deliveryTier',
    TIME_SENSITIVE = 'timeSensitive',
    PICKUP = 'pickup',
    DELIVERY = 'delivery',
  }
  export enum ChatChannel {
    Support = 'support',
    Delivery = 'delivery',
  }
  export enum ConflictReason {
    WindowOverflow = 'window_overflow',
    TimeSensitiveViolation = 'time_sensitive_violation',
  }
  export enum CrudAction {
    Retrieved = 'retrieved',
    Created = 'created',
    Updated = 'updated',
    Edited = 'edited',
    Deleted = 'deleted',
    Unchanged = 'unchanged',
    Restored = 'restored',
    ForceDeleted = 'force_deleted',
    Synced = 'synced',
    Approved = 'approved',
    Denied = 'denied',
    Sent = 'sent',
  }
  export enum DeliveryTier {
    Expedited = 'expedited',
    Regular = 'regular',
    Cheapest = 'cheapest',
    Custom = 'custom',
  }
  export enum ErrorAction {
    Retrieving = 'retrieving',
    Creating = 'creating',
    Updating = 'updating',
    Editing = 'editing',
    Deleting = 'deleting',
    Restoring = 'restoring',
    ForceDeleting = 'force_deleting',
    Syncing = 'syncing',
    Approving = 'approving',
    Denying = 'denying',
    Sending = 'sending',
  }
  export enum FeasibilityLevel {
    Green = 'green',
    Yellow = 'yellow',
    Red = 'red',
  }
  export enum HttpStatus {
    OK = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    UnprocessableEntity = 422,
    TooManyRequests = 429,
    InternalServerError = 500,
    NotImplemented = 501,
    ServiceUnavailable = 503,
  }
  export enum LogLevel {
    Emergency = 'emergency',
    Alert = 'alert',
    Critical = 'critical',
    Error = 'error',
    Warning = 'warning',
    Notice = 'notice',
    Info = 'info',
    Debug = 'debug',
  }
  export enum ModelKey {
    Catalog = 'catalog',
    CatalogElement = 'element',
    Business = 'business',
    Driver = 'driver',
    User = 'user',
    Address = 'address',
    Location = 'location',
    Currency = 'currency',
    Order = 'order',
    Quote = 'quote',
    PricingRule = 'pricing_rule',
    PricingTier = 'pricing_tier',
    ExchangeRate = 'exchange_rate',
    Notification = 'notification',
    Payment = 'payment',
    PaymentMethod = 'payment_method',
    Refund = 'refund',
    Route = 'route',
    RouteStop = 'route_stop',
    OrderMessage = 'order_message',
  }
  export enum NotificationAction {
    QuoteRequested = 'quote_requested',
    QuoteSent = 'quote_sent',
    ScheduleChanged = 'schedule_changed',
    StopAssigned = 'stop_assigned',
    DelayFlagged = 'delay_flagged',
    OrderPendingApproval = 'order_pending_approval',
  }
  export enum OrderStatus {
    PENDING_OWNER_APPROVAL = 'pending_owner_approval',
    PENDING = 'pending',
    ESTIMATED = 'estimated',
    APPROVED = 'approved',
    DENIED = 'denied',
    ASSIGNED = 'assigned',
    PICKING_UP = 'picking_up',
    ARRIVED_AT_PICKUP = 'arrived_at_pickup',
    PICKED_UP = 'picked_up',
    IN_TRANSIT = 'in_transit',
    ARRIVED_AT_DROP_OFF = 'arrived_at_drop_off',
    WAITING_CONFIRMATION = 'waiting_confirmation',
    COMPLETED = 'completed',
    DELIVERY_FAILED = 'delivery_failed',
    RETURNED_TO_SENDER = 'returned_to_sender',
    CANCELED = 'canceled',
  }
  export enum PaymentMethodType {
    Card = 'card',
    SinpeMobile = 'sinpe_mobile',
    ApplePay = 'apple_pay',
    Cash = 'cash',
  }
  export enum PaymentProvider {
    Tilopay = 'tilopay',
    Onvo = 'onvo',
    Cash = 'cash',
  }
  export enum PaymentStatus {
    UNPAID = 'unpaid',
    PAID = 'paid',
    RECONCILING = 'reconciling',
    REFUND_DUE = 'refund_due',
    REFUNDED = 'refunded',
    SURCHARGE_DUE = 'surcharge_due',
    PAID_IN_FULL = 'paid_in_full',
    CHARGEBACK = 'chargeback',
  }
  export enum PricingCalculationMode {
    CUMULATIVE = 'cumulative',
    DISCRETE = 'discrete',
  }
  export enum PricingRuleStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    ARCHIVED = 'archived',
  }
  export enum QuoteCurrency {
    CRC = 'CRC',
    USD = 'USD',
  }
  export enum QuoteStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    FINALIZED = 'finalized',
  }
  export enum Role {
    BUSINESS_OWNER = 'business.owner',
    BUSINESS_USER = 'business.user',
    CLIENT = 'client',
    DRIVER = 'driver',
    ADMIN = 'admin',
  }
  export enum RouteStatus {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
  }
  export enum RouteStopStatus {
    PENDING = 'pending',
    EN_ROUTE = 'en_route',
    ARRIVED = 'arrived',
    COMPLETED = 'completed',
    SKIPPED = 'skipped',
  }
  export enum RouteStopType {
    PICKUP = 'pickup',
    DROPOFF = 'dropoff',
  }
  export enum TransactionStatus {
    Pending = 'pending',
    Authorized = 'authorized',
    Succeeded = 'succeeded',
    Failed = 'failed',
  }
}
