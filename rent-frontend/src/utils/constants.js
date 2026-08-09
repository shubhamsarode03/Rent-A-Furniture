export const ROLES = {
  ADMIN: 'ADMIN',
  LENDER: 'LENDER',
  RENTER: 'RENTER',
};

export const FURNITURE_STATUS = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  REJECTED: 'REJECTED',
  INACTIVE: 'INACTIVE',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

export const ORDER_STATUS_LIST = Object.values(ORDER_STATUS);

// Permission helper functions
export function canBrowse(role) {
  return role === ROLES.RENTER || role === ROLES.LENDER || role === ROLES.ADMIN;
}

export function canUseCart(role) {
  return role === ROLES.RENTER || role === ROLES.LENDER;
}

export function canCheckout(role) {
  return role === ROLES.RENTER || role === ROLES.LENDER;
}

export function canViewOrders(role) {
  return role === ROLES.RENTER || role === ROLES.LENDER || role === ROLES.ADMIN;
}

export function canManageFurniture(role) {
  return role === ROLES.LENDER;
}

export function canManageCategories(role) {
  return role === ROLES.ADMIN;
}

export function canVerifyFurniture(role) {
  return role === ROLES.ADMIN;
}

export function canManageUsers(role) {
  return role === ROLES.ADMIN;
}

export function getLandingRouteForRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.LENDER:
      return '/lender/listings';
    case ROLES.RENTER:
    default:
      return '/';
  }
}
