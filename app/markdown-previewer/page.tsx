"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText } from "lucide-react"
import { marked } from "marked"

export default function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(
    "# Markdown Preview\n\nThis is a **markdown** _previewer_.\n\n## Features\n\n- Real-time preview\n- Support for basic markdown syntax\n- Easy to use\n\n### Code Example\n\n```js\nfunction hello() {\n  console.log('Hello, world!');\n}\n```\n\n> This is a blockquote\n\n[Link to Google](https://google.com)",
  )
  const [html, setHtml] = useState("")

  useEffect(() => {
    // Convert markdown to HTML
    setHtml(marked(markdown))
  }, [markdown])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle>Markdown Previewer</CardTitle>
            </div>
            <CardDescription>Write and preview Markdown in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="split" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="split">Split View</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="split" className="mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium mb-2">Markdown</div>
                    <textarea
                      value={markdown}
                      onChange={(e) => setMarkdown(e.target.value)}
                      className="w-full h-[500px] p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <div className="font-medium mb-2">Preview</div>
                    <div
                      className="w-full h-[500px] p-3 border rounded-md overflow-auto prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="edit" className="mt-4">
                <div className="font-medium mb-2">Markdown</div>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full h-[600px] p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="font-medium mb-2">Preview</div>
                <div
                  className="w-full min-h-[600px] p-4 border rounded-md overflow-auto prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
