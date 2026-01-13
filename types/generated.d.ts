declare namespace App.Data.Address {
  export type AddressData = {
    id: number;
    ownerId: number;
    ownerType: string;
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
declare namespace App.Data.Currency {
  export type CurrencyData = {
    code?: string;
    symbol?: string;
    name?: string;
    nameTranslations?: App.Data.Shared.FullLangData;
    precision?: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
  };
}
declare namespace App.Data.Driver {
  export type DriverData = {
    id?: number;
    userId?: number;
    licenseNumber?: string;
    licensePlateNumber?: string;
    licensePhotoFront?: string;
    licensePhotoBack?: string;
    licenseExpirationDate?: string;
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
    description?: string | null;
    status?: App.Enums.OrderStatus;
    paymentStatus?: App.Enums.PaymentStatus;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    pickupScheduledFor?: string | null;
    deliveryScheduledFor?: string | null;
    fulfilledBefore?: string | null;
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
    fulfilledBefore: string | null;
    requiresPin: boolean;
    isContactless: boolean;
  };
}
declare namespace App.Data.Quote {
  export type QuoteData = {
    id?: number;
    orderId?: number;
    version?: number;
    status?: App.Enums.QuoteStatus;
    isFinal?: boolean;
    finalizedAt?: string | null;
    pickupProposedFor?: string | null;
    deliveryProposedFor?: string | null;
    validUntil?: string | null;
    currencyCode?: string | null;
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
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    order?: App.Data.Order.OrderData;
  };
  export type StoreQuoteData = {
    orderId: number;
    pickupProposedFor: string;
    deliveryProposedFor: string;
    validUntil: string;
    currencyCode: string;
    distanceKm: number | null;
    distanceFee: number | null;
    timeFee: number | null;
    surcharge: number | null;
    discountRate: number | null;
    notes?: string | null;
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
  };
  export type UserData = {
    id: number;
    role: App.Enums.Role;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    langCode: string;
    businessId?: number | null;
    sexName?: string;
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
    NAME = 'name',
    PHONE = 'phone',
    AVATAR = 'avatar',
    SEX_ID = 'sexId',
    LANG_CODE = 'langCode',
    EMAIL = 'email',
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
  }
  export enum ErrorAction {
    Retrieving = 'retrieving',
    Creating = 'creating',
    Updating = 'updating',
    Editing = 'editing',
    Deleting = 'deleting',
    Restoring = 'restoring',
    ForceDeleting = 'force_deleting',
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
  }
  export enum OrderStatus {
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
}
