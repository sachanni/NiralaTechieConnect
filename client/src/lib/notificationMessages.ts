export interface NotificationMessage {
  title: string;
  body: string;
  actionText?: string;
  actionUrl?: string;
  icon?: string;
}

export function getNotificationMessage(type: string, payload: any, actorName?: string): NotificationMessage {
  const actor = actorName || 'Someone';

  switch (type) {
    case 'marketplace_new_item':
      return {
        title: 'New Listing',
        body: `${actor} posted "${payload.itemTitle}" in ${payload.category}`,
        actionText: 'View Item',
        actionUrl: `/marketplace/${payload.itemId}`,
        icon: '🏪',
      };

    case 'marketplace_offer_received':
      return {
        title: 'New Offer',
        body: `${actor} made an offer of ₹${payload.offerAmount} on "${payload.itemTitle}"`,
        actionText: 'View Offer',
        actionUrl: `/marketplace/${payload.itemId}`,
        icon: '💰',
      };

    case 'marketplace_offer_accepted':
      return {
        title: 'Offer Accepted',
        body: `${actor} accepted your offer for "${payload.itemTitle}"`,
        actionText: 'View Details',
        actionUrl: `/marketplace/${payload.itemId}`,
        icon: '✅',
      };

    case 'marketplace_offer_rejected':
      return {
        title: 'Offer Declined',
        body: `${actor} declined your offer for "${payload.itemTitle}"`,
        actionText: 'View Item',
        actionUrl: `/marketplace/${payload.itemId}`,
        icon: '❌',
      };

    case 'job_application_status':
      const statusMessages: Record<string, string> = {
        'accepted': '🎉 Your application was accepted',
        'rejected': 'Your application was not selected',
        'shortlisted': '⭐ You\'ve been shortlisted',
        'under-review': '👀 Your application is under review',
      };
      return {
        title: 'Application Update',
        body: statusMessages[payload.status] || `Application status changed to ${payload.status}`,
        actionText: 'View Job',
        actionUrl: `/jobs/${payload.jobId}`,
        icon: payload.status === 'accepted' || payload.status === 'shortlisted' ? '🎉' : '📋',
      };

    case 'skill_swap_request':
      return {
        title: 'Session Request',
        body: `${actor} requested a session on "${payload.skillTopic}" on ${new Date(payload.sessionDate).toLocaleDateString()}`,
        actionText: 'View Request',
        actionUrl: '/skill-swap',
        icon: '🎓',
      };

    case 'rental_booking_request':
      return {
        title: 'Booking Request',
        body: `${actor} wants to rent "${payload.itemTitle}" from ${new Date(payload.startDate).toLocaleDateString()} to ${new Date(payload.endDate).toLocaleDateString()}`,
        actionText: 'View Booking',
        actionUrl: `/rentals/${payload.itemId}`,
        icon: '📦',
      };

    case 'message_received':
      return {
        title: 'New Message',
        body: `${actor}: ${payload.messagePreview || 'Sent you a message'}`,
        actionText: 'Open Chat',
        actionUrl: '/messages',
        icon: '💬',
      };

    case 'event_reminder':
      return {
        title: 'Event Reminder',
        body: `"${payload.eventTitle}" starts ${payload.timeUntil}`,
        actionText: 'View Event',
        actionUrl: `/events/${payload.eventId}`,
        icon: '📅',
      };

    case 'teammate_request':
      return {
        title: 'Teammate Request',
        body: `${actor} wants to join your project "${payload.projectTitle}"`,
        actionText: 'View Request',
        actionUrl: '/find-teammates',
        icon: '🤝',
      };

    case 'idea_interest':
      return {
        title: 'Idea Interest',
        body: `${actor} is interested in your idea "${payload.ideaTitle}"`,
        actionText: 'View Idea',
        actionUrl: '/ideas',
        icon: '💡',
      };

    case 'announcement_published':
      return {
        title: 'New Announcement',
        body: payload.announcementTitle || 'A new announcement has been published',
        actionText: 'Read More',
        actionUrl: '/announcements',
        icon: '📢',
      };

    case 'lost_item_found':
      return {
        title: 'Item Match',
        body: `${actor} reported finding an item matching "${payload.itemDescription}"`,
        actionText: 'View Report',
        actionUrl: '/lost-and-found',
        icon: '🔍',
      };

    case 'forum_reply':
      return {
        title: 'New Reply',
        body: `${actor} replied to your post "${payload.postTitle}"`,
        actionText: 'View Reply',
        actionUrl: `/forum/${payload.postId}`,
        icon: '💭',
      };

    default:
      return {
        title: 'Notification',
        body: `You have a new notification`,
        actionText: 'View',
        icon: '🔔',
      };
  }
}
