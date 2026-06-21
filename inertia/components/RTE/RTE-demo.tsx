'use client'

import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import TiptapEditor from '~/components/RTE'
import JsonViewer from '~/components/RTE/json-viewer'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { urlFor } from '~/lib/client'

const SAMPLE_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1, textAlign: 'center' },
      content: [{ type: 'text', text: 'Enhanced Tiptap Editor' }],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: 'center' },
      content: [
        { type: 'text', text: 'This is a ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'rich text editor' },
        { type: 'text', text: ' with ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'advanced features' },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'New Features' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This enhanced editor now supports image resizing and a sticky toolbar.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Image Resizing' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Click on any image to select it, then use the resize controls to adjust its dimensions. You can maintain aspect ratio or resize freely.',
        },
      ],
    },
    {
      type: 'image',
      attrs: {
        src: '/assets/media/example/article.png',
        alt: 'Example image',
        title: 'Resizable image example',
        width: 500,
        height: 300,
      },
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Sticky Toolbar' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Scroll down to see the toolbar stick to the top of the screen. This ensures you always have access to formatting controls.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Try scrolling down to see the sticky toolbar in action.',
        },
      ],
    },
    // Add more content to enable scrolling
    ...Array(10)
      .fill(0)
      .map((_, i) => ({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: `This is paragraph ${i + 1} to demonstrate the sticky toolbar. Keep scrolling to see it in action.`,
          },
        ],
      })),
  ],
}

export default function RTEDemo() {
  const [editorContent, setEditorContent] = useState<object>(SAMPLE_CONTENT)

  const handleContentSave = (content: object) => {
    setEditorContent(content)
  }

  const resetContent = () => {
    setEditorContent(SAMPLE_CONTENT)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Enhanced Tiptap Editor Demo</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Editor with Image Resizing & Sticky Toolbar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button variant="outline" size="sm" onClick={resetContent}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Content
                </Button>
              </div>

              <TiptapEditor
                content={editorContent}
                onSave={handleContentSave}
                className="min-h-[500px]"
                stickyToolbar={true}
                getMediaURL={urlFor('api.v1.media.list')}
                uploadMediaURL={urlFor('api.v1.media.upload')}
                deleteMediaURL={urlFor('api.v1.media.destroy')}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="json">
            <TabsList className="mb-4">
              <TabsTrigger value="json">JSON Output</TabsTrigger>
              <TabsTrigger value="info">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="json">
              <JsonViewer data={editorContent} title="Editor Content (JSON)" />
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>New Features</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm">
                  <h3>Image Resizing</h3>
                  <ul>
                    <li>Click on any image to select it</li>
                    <li>Use the resize controls to adjust dimensions</li>
                    <li>Maintain aspect ratio or resize freely</li>
                    <li>Reset to original size or maximize to container width</li>
                  </ul>

                  <h3>Sticky Toolbar</h3>
                  <ul>
                    <li>Toolbar sticks to the top when scrolling</li>
                    <li>Ensures formatting controls are always accessible</li>
                    <li>Smooth transition when becoming sticky</li>
                    <li>Adapts to different screen sizes</li>
                  </ul>

                  <p className="text-xs text-muted-foreground mt-4">
                    Note: For demo purposes, images are stored in localStorage. In a production
                    environment, you would integrate with a proper storage solution.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
