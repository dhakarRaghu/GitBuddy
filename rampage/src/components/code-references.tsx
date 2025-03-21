// 'use client'

// import React from 'react'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { cn } from '@/lib/utils'
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// interface FileReference {
//   fileName: string
//   sourceCode: string
//   summary: string
// }

// interface CodeReferencesProps {
//   filesReferences: FileReference[]
// }

// const CodeReferences: React.FC<CodeReferencesProps> = ({ filesReferences }) => {
//   const [tab, setTab] = React.useState(filesReferences[0]?.fileName || '')

//   if (filesReferences.length === 0) return null

//   return (
//     <div className="w-full bg-background border rounded-lg shadow-sm">
//       <Tabs value={tab} onValueChange={setTab} className="w-full">
//         <ScrollArea className="w-full">
//           <TabsList className="flex p-1 bg-muted">
//             {filesReferences.map((file) => (
//               <TabsTrigger
//                 key={file.fileName}
//                 value={file.fileName}
//                 className={cn(
//                   'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
//                   'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
//                 )}
//               >
//                 {file.fileName}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </ScrollArea>
//         {filesReferences.map((file) => (
//           <TabsContent key={file.fileName} value={file.fileName} className="mt-2 p-4">
//             <h3 className="text-lg font-semibold mb-2">Summary</h3>
//             <p className="text-sm text-muted-foreground mb-4">{file.summary}</p>
//             <h3 className="text-lg font-semibold mb-2">Source Code</h3>
//             <ScrollArea className="w-full rounded-md border">
//               <SyntaxHighlighter 
//                 language="typescript" 
//                 style={oneDark}
//                 customStyle={{
//                   margin: 0,
//                   padding: '1rem',
//                   borderRadius: '0.5rem',
//                 }}
//               >
//                 {file.sourceCode}
//               </SyntaxHighlighter>
//             </ScrollArea>
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   )
// }

// export default CodeReferences

"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import { MemoizedMarkdown } from "./memorized-markdown";

interface FileReference {
  fileName: string;
  sourceCode: string;
  summary: string;
  score?: number;
}

interface CodeReferencesProps {
  filesReferences: FileReference[];
}

const CodeReferences: React.FC<CodeReferencesProps> = ({ filesReferences }) => {
  const [tab, setTab] = useState(filesReferences[0]?.fileName || "");

  if (filesReferences.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-background border rounded-lg shadow-sm"
    >
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="flex p-1 bg-muted rounded-t-lg border-b">
            {filesReferences.map((file) => (
              <TabsTrigger
                key={file.fileName}
                value={file.fileName}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  "hover:bg-muted-foreground/10",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                )}
              >
                {file.fileName} {file.score ? `(${file.score.toFixed(2)})` : ""}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        {filesReferences.map((file) => (
          <TabsContent key={file.fileName} value={file.fileName} className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Source Code</h3>
            <ScrollArea className="w-full rounded-md border bg-gray-900 max-h-[300px]">
              <SyntaxHighlighter
                language="typescript"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                {file.sourceCode}
              </SyntaxHighlighter>
                <h3 className="text-lg font-semibold text-foreground mb-2">Summary</h3>
                {/* <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{file.summary}</p> */}
    
                 <MemoizedMarkdown content={file.summary} id={file.fileName} />
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
};

export default CodeReferences;