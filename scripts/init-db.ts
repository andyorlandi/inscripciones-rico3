import { initDb } from '../lib/db';

// Initialize app state
initDb().then(() => {
  console.log('✅ Database initialized successfully');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error initializing database:', error);
  process.exit(1);
});
