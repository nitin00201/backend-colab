import DocumentService from '../services/DocumentService.js';
import ProjectService from '../services/ProjectService.js';

// Create a new document
const createDocument = async (req, res) => {
  try {
    const { projectId } = req.body;
    
    // Check if project exists and user has access
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is member of the project
    const isMember = project.members.some(member => member.user?._id.toString() === req.user.id) || 
                     project.owner._id.toString() === req.user.id;
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }
    
    const document = await DocumentService.createDocument(req.body, req.user.id);
    res.status(201).json({ document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all documents for a project
const getDocumentsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists and user has access
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is member of the project
    const isMember = project.members.some(member => member.user?._id.toString() === req.user.id) || 
                     project.owner._id.toString() === req.user.id;
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }
    
    const documents = await DocumentService.getDocumentsByProject(projectId);
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;
    
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
    
    res.json({ document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
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
    
    // Check if user is the creator or project owner
    const canEdit = document.createdBy._id.toString() === req.user.id ||
                    project.owner._id.toString() === req.user.id;
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Permission denied to update this document' });
    }
    
    const updatedDocument = await DocumentService.updateDocument(documentId, req.body, req.user.id);
    res.json({ document: updatedDocument });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete document (soft delete)
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
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
    
    // Check if user is the creator or project owner
    const canDelete = document.createdBy._id.toString() === req.user.id ||
                      project.owner._id.toString() === req.user.id;
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Permission denied to delete this document' });
    }
    
    await DocumentService.deleteDocument(documentId);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get document versions
const getDocumentVersions = async (req, res) => {
  try {
    const { documentId } = req.params;
    
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
    
    const versions = await DocumentService.getDocumentVersions(documentId);
    res.json({ versions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restore document to a specific version
const restoreDocumentVersion = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { version } = req.body;
    
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
    
    // Check if user is the creator or project owner
    const canEdit = document.createdBy._id.toString() === req.user.id ||
                    project.owner._id.toString() === req.user.id;
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Permission denied to restore this document' });
    }
    
    const restoredDocument = await DocumentService.restoreVersion(documentId, version, req.user.id);
    res.json({ document: restoredDocument });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createDocument,
  getDocumentsByProject,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentVersions,
  restoreDocumentVersion,
};