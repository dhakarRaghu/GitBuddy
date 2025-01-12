//langchain lib for getting the file of that repo

import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { generateEmbedding, summariseCode } from './gemini';
import { db } from '~/server/db';

export const loadGithubRepo = async (githubUrl: string, githubToken: string) => {
    const loader = new GithubRepoLoader(githubUrl,{
        accessToken: githubToken || '', 
        branch: 'main',
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb' , '.next'],
        recursive: true,
        unknown:'warn',
        maxConcurrency: 5
    });
    const docs = await loader.load();
    return docs;
};

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken: string = '') => {
    console.log(`Indexing github repo ${githubUrl}`);
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const allEmbeddings = await generateEmbeddings(docs);
    
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) =>{
        console.log("\n")
        console.log(`Processing ${index + 1} of ${allEmbeddings.length}`);
        if(!embedding) return 

        try {
                // Create SourceCodeEmbedding record
                const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
                    data: {
                        summary: embedding.summary,
                        sourceCode: embedding.sourceCode,
                        fileName: embedding.fileName,
                        projectId,
                    },
                });

                // Update vector embedding using raw SQL
                await db.$executeRaw`
                    UPDATE "SourceCodeEmbedding"
                    SET "summaryEmbedding" = ${embedding.embedding}::vector
                    WHERE "id" = ${sourceCodeEmbedding.id}
                `;
            } catch (error) {
                console.error(`Error processing embedding ${index + 1}:`, error);
            }
    }))
};

const generateEmbeddings = async (docs: Document[]) => {
    const embeddingPromises = docs.map(async (doc) => {
        try {
            const summary = await summariseCode(doc);  // Get the summary of the code
            const embedding = await generateEmbedding(summary);  // Generate the embedding for the summary
            
            return {
                summary,
                embedding,
                sourceCode: doc.pageContent,  // No need for deep cloning unless it's necessary
                fileName: doc.metadata.source
            };
        } catch (error) {
            console.error(`Error generating embedding for ${doc.metadata.source}:`, error);
            return null;  // Return null in case of error, which can be filtered later
        }
    });

    // Wait for all promises to resolve, filter out null results
    const embeddings = await Promise.all(embeddingPromises);
    console.log("Embeddings generated:",embeddings, embeddings.length);
    return embeddings.filter(item => item !== null);  // Filter out failed results
};

// const generateEmbeddings = async (docs: Document[]) => {
//     return await Promise.all(docs.map(async (doc) => {
//         const summary = await summariseCode(doc)
//         const embedding = await generateEmbedding(summary)
//         return {
//             summary,
//             embedding,
//             sourceCode : JSON.parse(JSON.stringify(doc.pageContent)),
//             fileName: doc.metadata.source
//         }
        
//     }));
// };


