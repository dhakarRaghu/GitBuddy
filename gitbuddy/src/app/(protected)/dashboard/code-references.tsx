'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { ScrollArea } from '~/components/ui/scroll-area'
import { cn } from '~/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface FileReference {
  fileName: string
  sourceCode: string
  summary: string
}

interface CodeReferencesProps {
  filesReferences: FileReference[]
}

const CodeReferences: React.FC<CodeReferencesProps> = ({ filesReferences }) => {
  const [tab, setTab] = React.useState(filesReferences[0]?.fileName || '')

  if (filesReferences.length === 0) return null

  return (
    <div className="w-full bg-background border rounded-lg shadow-sm">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="flex p-1 bg-muted">
            {filesReferences.map((file) => (
              <TabsTrigger
                key={file.fileName}
                value={file.fileName}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                )}
              >
                {file.fileName}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        {filesReferences.map((file) => (
          <TabsContent key={file.fileName} value={file.fileName} className="mt-2 p-4">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">{file.summary}</p>
            <h3 className="text-lg font-semibold mb-2">Source Code</h3>
            <ScrollArea className="w-full rounded-md border">
              <SyntaxHighlighter 
                language="typescript" 
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  borderRadius: '0.5rem',
                }}
              >
                {file.sourceCode}
              </SyntaxHighlighter>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default CodeReferences

