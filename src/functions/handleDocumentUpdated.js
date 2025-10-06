import inngest from '../utils/inngest.js';

// Inngest function for document updates
const handleDocumentUpdated = inngest.createFunction(
  { id: 'handle-document-updated' },
  { event: 'doc.updated' },
  async ({ event, step }) => {
    const { document, userId, updaterName } = event.data;
    
    // Log the document update
    await step.run('log-document-update', async () => {
      console.log(`Document updated: ${document.title} by user ${userId}`);
    });
    
    // Schedule LLM summarization if document is large enough
    if (document.content && document.content.length > 1000) {
      await step.sleep('wait-before-summarization', '5s');
      
      // Perform LLM summarization
      const summary = await step.run('llm-summarization', async () => {
        // In a real implementation, you would integrate with an LLM service
        console.log(`Generating summary for document: ${document.title}`);
        return `This is a summary of the document "${document.title}"...`;
      });
      
      console.log(`Document summary generated: ${summary}`);
    }
    
    return { success: true };
  }
);

export default handleDocumentUpdated;