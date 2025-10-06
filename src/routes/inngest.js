import express from 'express';
import { serve } from 'inngest/express';
import inngest from '../utils/inngest.js';
import functions from '../functions/index.js';

const router = express.Router();

// Serve the Inngest endpoint
router.use('/api/inngest', serve({ client: inngest, functions, streaming: 'allow' }));


export default router;