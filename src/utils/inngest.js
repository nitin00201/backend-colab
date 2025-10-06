import { Inngest } from 'inngest';

// Create a new Inngest client
const inngest = new Inngest({
  id: 'monolith-app',
  // In production, you would use process.env.INNGEST_SIGNING_KEY
  signingKey: process.env.INNGEST_SIGNING_KEY || 'test-signing-key'
});

export default inngest;