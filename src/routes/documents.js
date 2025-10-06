import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createDocument,
  getDocumentsByProject,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentVersions,
  restoreDocumentVersion,
} from '../controllers/DocumentController.js';
import { updateDocumentContent } from '../controllers/DocumentCollaborationController.js';

const router = express.Router();

router.use(authenticate);

// Document routes
router.post('/', createDocument);
router.get('/project/:projectId', getDocumentsByProject);
router.get('/:documentId', getDocumentById);
router.put('/:documentId', updateDocument);
router.delete('/:documentId', deleteDocument);
router.get('/:documentId/versions', getDocumentVersions);
router.post('/:documentId/restore', restoreDocumentVersion);

// Real-time collaboration routes
router.put('/:documentId/content', updateDocumentContent);

export default router;