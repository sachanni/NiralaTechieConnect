export const NOTIFICATION_CATEGORIES = {
  COMMUNICATIONS: 'communications',
  MARKETPLACE: 'marketplace',
  JOBS: 'jobs',
  COMMUNITY: 'community',
  RENTALS: 'rentals',
  LOST_FOUND: 'lost_found',
} as const;

export const NOTIFICATION_TYPES = {
  MESSAGE_RECEIVED: 'message_received',
  COMMENT_ON_POST: 'comment_on_post',
  MENTION: 'mention',
  
  MARKETPLACE_OFFER_RECEIVED: 'marketplace_offer_received',
  MARKETPLACE_OFFER_ACCEPTED: 'marketplace_offer_accepted',
  MARKETPLACE_OFFER_REJECTED: 'marketplace_offer_rejected',
  MARKETPLACE_NEW_ITEM: 'marketplace_new_item',
  MARKETPLACE_ITEM_SOLD: 'marketplace_item_sold',
  
  JOB_APPLICATION_STATUS: 'job_application_status',
  JOB_NEW_MATCH: 'job_new_match',
  JOB_NEW_APPLICATION: 'job_new_application',
  
  SKILL_SWAP_REQUEST: 'skill_swap_request',
  SKILL_SWAP_CONFIRMED: 'skill_swap_confirmed',
  SKILL_SWAP_CANCELLED: 'skill_swap_cancelled',
  SKILL_SWAP_REMINDER: 'skill_swap_reminder',
  
  TEAMMATE_REQUEST: 'teammate_request',
  TEAMMATE_ACCEPTED: 'teammate_accepted',
  TEAMMATE_REJECTED: 'teammate_rejected',
  IDEA_INTEREST: 'idea_interest',
  
  EVENT_REMINDER: 'event_reminder',
  EVENT_UPDATED: 'event_updated',
  EVENT_CANCELLED: 'event_cancelled',
  EVENT_NEW: 'event_new',
  
  ADMIN_ANNOUNCEMENT: 'admin_announcement',
  
  RENTAL_BOOKING_REQUEST: 'rental_booking_request',
  RENTAL_BOOKING_CONFIRMED: 'rental_booking_confirmed',
  RENTAL_BOOKING_REJECTED: 'rental_booking_rejected',
  RENTAL_DUE_REMINDER: 'rental_due_reminder',
  
  LOST_FOUND_MATCH: 'lost_found_match',
  LOST_FOUND_CLAIMED: 'lost_found_claimed',
} as const;

export const NOTIFICATION_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export interface NotificationConfig {
  category: string;
  priority: string;
  realtime: boolean;
  batchable: boolean;
  requiresInterest: boolean;
  defaultEnabled: boolean;
}

export const NOTIFICATION_CONFIG: Record<string, NotificationConfig> = {
  [NOTIFICATION_TYPES.MESSAGE_RECEIVED]: {
    category: NOTIFICATION_CATEGORIES.COMMUNICATIONS,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.COMMENT_ON_POST]: {
    category: NOTIFICATION_CATEGORIES.COMMUNICATIONS,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: false,
    batchable: true,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.MENTION]: {
    category: NOTIFICATION_CATEGORIES.COMMUNICATIONS,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  
  [NOTIFICATION_TYPES.MARKETPLACE_OFFER_RECEIVED]: {
    category: NOTIFICATION_CATEGORIES.MARKETPLACE,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.MARKETPLACE_OFFER_ACCEPTED]: {
    category: NOTIFICATION_CATEGORIES.MARKETPLACE,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.MARKETPLACE_OFFER_REJECTED]: {
    category: NOTIFICATION_CATEGORIES.MARKETPLACE,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.MARKETPLACE_NEW_ITEM]: {
    category: NOTIFICATION_CATEGORIES.MARKETPLACE,
    priority: NOTIFICATION_PRIORITY.LOW,
    realtime: false,
    batchable: true,
    requiresInterest: true,
    defaultEnabled: false,
  },
  [NOTIFICATION_TYPES.MARKETPLACE_ITEM_SOLD]: {
    category: NOTIFICATION_CATEGORIES.MARKETPLACE,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  
  [NOTIFICATION_TYPES.JOB_APPLICATION_STATUS]: {
    category: NOTIFICATION_CATEGORIES.JOBS,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.JOB_NEW_MATCH]: {
    category: NOTIFICATION_CATEGORIES.JOBS,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: false,
    batchable: true,
    requiresInterest: true,
    defaultEnabled: false,
  },
  [NOTIFICATION_TYPES.JOB_NEW_APPLICATION]: {
    category: NOTIFICATION_CATEGORIES.JOBS,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  
  [NOTIFICATION_TYPES.SKILL_SWAP_REQUEST]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.SKILL_SWAP_CONFIRMED]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.SKILL_SWAP_CANCELLED]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.SKILL_SWAP_REMINDER]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  
  [NOTIFICATION_TYPES.TEAMMATE_REQUEST]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.TEAMMATE_ACCEPTED]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.TEAMMATE_REJECTED]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.LOW,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.IDEA_INTEREST]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  
  [NOTIFICATION_TYPES.EVENT_REMINDER]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.EVENT_UPDATED]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.EVENT_CANCELLED]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.EVENT_NEW]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.LOW,
    realtime: false,
    batchable: true,
    requiresInterest: true,
    defaultEnabled: false,
  },
  
  [NOTIFICATION_TYPES.ADMIN_ANNOUNCEMENT]: {
    category: NOTIFICATION_CATEGORIES.COMMUNITY,
    priority: NOTIFICATION_PRIORITY.CRITICAL,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  
  [NOTIFICATION_TYPES.RENTAL_BOOKING_REQUEST]: {
    category: NOTIFICATION_CATEGORIES.RENTALS,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.RENTAL_BOOKING_CONFIRMED]: {
    category: NOTIFICATION_CATEGORIES.RENTALS,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.RENTAL_BOOKING_REJECTED]: {
    category: NOTIFICATION_CATEGORIES.RENTALS,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.RENTAL_DUE_REMINDER]: {
    category: NOTIFICATION_CATEGORIES.RENTALS,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  
  [NOTIFICATION_TYPES.LOST_FOUND_MATCH]: {
    category: NOTIFICATION_CATEGORIES.LOST_FOUND,
    priority: NOTIFICATION_PRIORITY.HIGH,
    realtime: true,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
  [NOTIFICATION_TYPES.LOST_FOUND_CLAIMED]: {
    category: NOTIFICATION_CATEGORIES.LOST_FOUND,
    priority: NOTIFICATION_PRIORITY.MEDIUM,
    realtime: false,
    batchable: false,
    requiresInterest: false,
    defaultEnabled: true,
  },
};

export const DEFAULT_SUBCATEGORY = 'general';
