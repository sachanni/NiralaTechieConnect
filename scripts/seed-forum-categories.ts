import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

// Ensure DATABASE_URL is configured
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set.');
  console.error('   Please configure DATABASE_URL in your .env file or environment.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Default forum categories for Nirala Estate IT Community
const DEFAULT_CATEGORIES = [
  {
    name: 'General Discussion',
    slug: 'general-discussion',
    description: 'Community chat, introductions, and off-topic discussions',
    icon: '💬',
  },
  {
    name: 'Q&A / Tech Help',
    slug: 'qa-tech-help',
    description: 'Ask technical questions, get coding help, and troubleshoot issues',
    icon: '❓',
  },
  {
    name: 'Jobs & Career',
    slug: 'jobs-career',
    description: 'Job postings, career advice, interview tips, and professional development',
    icon: '💼',
  },
  {
    name: 'Project Showcase',
    slug: 'project-showcase',
    description: 'Share your projects, demos, and get feedback from the community',
    icon: '🚀',
  },
  {
    name: 'Announcements',
    slug: 'announcements',
    description: 'Important community updates and official announcements',
    icon: '📢',
  },
  {
    name: 'Events & Meetups',
    slug: 'events-meetups',
    description: 'Discuss upcoming events, plan meetups, and share event experiences',
    icon: '🎉',
  },
  {
    name: 'Architecture Review',
    slug: 'architecture-review',
    description: 'System design discussions, code reviews, and best practices',
    icon: '🏗️',
  },
  {
    name: 'Ideas & Innovation',
    slug: 'ideas-innovation',
    description: 'Startup ideas, tech innovations, collaboration opportunities',
    icon: '💡',
  },
];

async function seedForumCategories() {
  console.log('🌱 Seeding forum categories...\n');
  
  try {
    // Start transaction
    await pool.query('BEGIN');
    
    let successCount = 0;
    let updateCount = 0;
    
    for (const category of DEFAULT_CATEGORIES) {
      const result = await pool.query(
        `INSERT INTO forum_categories (name, slug, description, icon, post_count)
         VALUES ($1, $2, $3, $4, 0)
         ON CONFLICT (slug) 
         DO UPDATE SET 
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           icon = EXCLUDED.icon
         RETURNING id, name, slug, (xmax = 0) AS inserted`,
        [category.name, category.slug, category.description, category.icon]
      );
      
      const row = result.rows[0];
      if (row.inserted) {
        console.log(`✓ Created: ${category.icon} ${category.name}`);
        successCount++;
      } else {
        console.log(`↻ Updated: ${category.icon} ${category.name}`);
        updateCount++;
      }
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    console.log(`\n✅ Successfully seeded forum categories!`);
    console.log(`   - ${successCount} new categories created`);
    console.log(`   - ${updateCount} existing categories updated`);
    console.log(`   - Total: ${DEFAULT_CATEGORIES.length} categories\n`);
    
  } catch (error: any) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('❌ Error seeding forum categories:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute the seed function
seedForumCategories();
