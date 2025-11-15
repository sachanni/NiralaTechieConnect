import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ACTIVITY_INTERESTS = [
  {
    slug: 'jobs-careers',
    label: 'Jobs & Careers',
    description: 'Job postings, career opportunities, and professional development',
    allowedActivityTypes: ['new_job', 'job_application'],
  },
  {
    slug: 'ideas-innovation',
    label: 'Ideas & Innovation',
    description: 'New project ideas, startup collaborations, and innovation',
    allowedActivityTypes: ['new_idea', 'idea_comment', 'idea_team_request'],
  },
  {
    slug: 'events-meetups',
    label: 'Events & Meetups',
    description: 'Community events, tech meetups, and social gatherings',
    allowedActivityTypes: ['new_event', 'event_registration', 'event_checkin'],
  },
  {
    slug: 'community-news',
    label: 'Community News',
    description: 'General community updates and new member welcomes',
    allowedActivityTypes: ['new_member', 'community_update'],
  },
  {
    slug: 'announcements',
    label: 'Announcements',
    description: 'Important community announcements and notices',
    allowedActivityTypes: ['announcement'],
  },
  {
    slug: 'lost-found',
    label: 'Lost & Found',
    description: 'Lost and found items within the community',
    allowedActivityTypes: ['lost_found'],
  },
  {
    slug: 'marketplace',
    label: 'Marketplace',
    description: 'Buy, sell, and exchange items within the community',
    allowedActivityTypes: ['new_marketplace_item', 'marketplace_offer'],
  },
  {
    slug: 'discussions',
    label: 'Discussions & Forums',
    description: 'Community discussions, forum posts, and conversations',
    allowedActivityTypes: ['new_discussion', 'discussion_comment'],
  },
];

async function seedActivityInterests() {
  console.log('🌱 Seeding activity interest topics...');
  
  try {
    for (const interest of ACTIVITY_INTERESTS) {
      const result = await pool.query(
        `INSERT INTO activity_interest_topics (slug, label, description, allowed_activity_types)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE 
         SET label = EXCLUDED.label,
             description = EXCLUDED.description,
             allowed_activity_types = EXCLUDED.allowed_activity_types
         RETURNING *`,
        [interest.slug, interest.label, interest.description, JSON.stringify(interest.allowedActivityTypes)]
      );
      console.log(`✓ Created/Updated topic: ${interest.label}`);
    }
    
    console.log(`\n✅ Successfully seeded ${ACTIVITY_INTERESTS.length} activity interest topics!`);
  } catch (error) {
    console.error('❌ Error seeding activity interests:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedActivityInterests();
