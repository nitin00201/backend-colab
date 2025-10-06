import Document from '../models/Document.js';
import DocumentVersion from '../models/DocumentVersion.js';
import { broadcast } from './WebSocketService.js';
import inngest from '../utils/inngest.js';

class DocumentService {
  // Create a new document
  static async createDocument(documentData, userId) {
    const document = new Document({
      ...documentData,
      createdBy: userId,
      updatedBy: userId,
    });
    
    const savedDocument = await document.save();
    
    // Create initial version
    await DocumentService.createVersion(savedDocument, userId);
    
    // Broadcast document creation to WebSocket clients
    broadcast('documentCreated', { document: savedDocument });
    
    // Trigger Inngest event for document creation
    try {
      await inngest.send({
        name: 'doc.created',
        data: {
          document: savedDocument.toObject(),
          userId
        }
      });
    } catch (error) {
      console.error('Failed to send doc.created event to Inngest:', error);
    }
    
    return savedDocument;
  }

  // Get all documents for a project
  static async getDocumentsByProject(projectId) {
    return await Document.find({ projectId, isArchived: false })
      .populate('createdBy', 'firstName lastName email')
      .sort({ updatedAt: -1 });
  }

  // Get document by ID
  static async getDocumentById(documentId) {
    return await Document.findById(documentId)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  // Update document
  static async updateDocument(documentId, updateData, userId) {
    const document = await Document.findById(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Create a new version before updating
    await DocumentService.createVersion(document, userId);
    
    // Update the document
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { 
        ...updateData,
        updatedBy: userId,
        version: document.version + 1,
      },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');
    
    if (updatedDocument) {
      // Broadcast document update to WebSocket clients
      broadcast('documentUpdated', { document: updatedDocument });
      
      // Trigger Inngest event for document update
      try {
        await inngest.send({
          name: 'doc.updated',
          data: {
            document: updatedDocument.toObject(),
            userId
          }
        });
      } catch (error) {
        console.error('Failed to send doc.updated event to Inngest:', error);
      }
    }
    
    return updatedDocument;
  }

  // Delete document (soft delete)
  static async deleteDocument(documentId) {
    const deletedDocument = await Document.findByIdAndUpdate(
      documentId,
      { isArchived: true },
      { new: true }
    );
    
    if (deletedDocument) {
      // Broadcast document deletion to WebSocket clients
      broadcast('documentDeleted', { documentId });
      
      // Trigger Inngest event for document deletion
      try {
        await inngest.send({
          name: 'doc.deleted',
          data: {
            documentId,
            document: deletedDocument.toObject()
          }
        });
      } catch (error) {
        console.error('Failed to send doc.deleted event to Inngest:', error);
      }
    }
    
    return deletedDocument;
  }

  // Create a version snapshot
  static async createVersion(document, userId) {
    const version = new DocumentVersion({
      documentId: document._id,
      title: document.title,
      content: document.content,
      version: document.version,
      createdBy: userId,
    });
    
    return await version.save();
  }

  // Get document versions
  static async getDocumentVersions(documentId) {
    return await DocumentVersion.find({ documentId })
      .populate('createdBy', 'firstName lastName email')
      .sort({ version: -1 });
  }

  // Restore document to a specific version
  static async restoreVersion(documentId, versionNumber, userId) {
    const version = await DocumentVersion.findOne({ documentId, version: versionNumber });
    
    if (!version) {
      throw new Error('Version not found');
    }
    
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      {
        title: version.title,
        content: version.content,
        updatedBy: userId,
        version: version.version + 1,
      },
      { new: true }
    );
    
    if (updatedDocument) {
      // Create a new version after restoration
      await DocumentService.createVersion(updatedDocument, userId);
      
      // Broadcast document update to WebSocket clients
      broadcast('documentUpdated', { document: updatedDocument });
      
      // Trigger Inngest event for document update
      try {
        await inngest.send({
          name: 'doc.updated',
          data: {
            document: updatedDocument.toObject(),
            userId
          }
        });
      } catch (error) {
        console.error('Failed to send doc.updated event to Inngest:', error);
      }
    }
    
    return updatedDocument;
  }
  
  // Update document content in real-time (for collaborative editing)
  static async updateDocumentContent(documentId, content, userId) {
    const document = await Document.findById(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Update only the content field
    document.content = content;
    document.updatedBy = userId;
    document.updatedAt = new Date();
    
    const updatedDocument = await document.save();
    
    // Broadcast real-time update to WebSocket clients
    broadcast('documentContentUpdated', { 
      documentId, 
      content, 
      userId,
      timestamp: new Date() 
    });
    
    // Trigger Inngest event for document content update
    try {
      await inngest.send({
        name: 'doc.content.updated',
        data: {
          documentId,
          content,
          userId,
          document: updatedDocument.toObject()
        }
      });
    } catch (error) {
      console.error('Failed to send doc.content.updated event to Inngest:', error);
    }
    
    return updatedDocument;
  }
}

export default DocumentService;