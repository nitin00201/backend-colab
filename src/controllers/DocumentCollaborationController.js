import DocumentService from '../services/DocumentService.js';
import ProjectService from '../services/ProjectService.js';

// Update document content in real-time (for collaborative editing)
const updateDocumentContent = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { content } = req.body;
    
    const document = await DocumentService.getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if user has access to the project
    const project = await ProjectService.getProjectById(document.projectId);
    const isMember = project.members.some(member => member._id.toString() === req.user.id) || 
                     project.owner._id.toString() === req.user.id;
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this document' });
    }
    
    const updatedDocument = await DocumentService.updateDocumentContent(documentId, content, req.user.id);
    res.json({ document: updatedDocument });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  updateDocumentContent,
};