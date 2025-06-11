"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Code, Play, RotateCcw, Download } from "lucide-react"

const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML/CSS Playground</title>
</head>
<body>
    <div class="container">
        <h1>Welcome to the Playground!</h1>
        <p>Edit the HTML and CSS to see live changes.</p>
        <button class="btn">Click me!</button>
    </div>
</body>
</html>`

const defaultCSS = `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2.5em;
}

p {
    color: #666;
    font-size: 1.2em;
    margin-bottom: 30px;
}

.btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1.1em;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn:hover {
    background: #764ba2;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}`

export default function HTMLCSSPlayground() {
  const [htmlCode, setHtmlCode] = useState(defaultHTML)
  const [cssCode, setCssCode] = useState(defaultCSS)
  const [previewContent, setPreviewContent] = useState("")

  const updatePreview = () => {
    const combinedCode = htmlCode.replace("</head>", `<style>${cssCode}</style></head>`)
    setPreviewContent(combinedCode)
  }

  useEffect(() => {
    updatePreview()
  }, [])

  const handleReset = () => {
    setHtmlCode(defaultHTML)
    setCssCode(defaultCSS)
    setTimeout(updatePreview, 100)
  }

  const downloadCode = () => {
    const combinedCode = htmlCode.replace("</head>", `<style>${cssCode}</style></head>`)

    const blob = new Blob([combinedCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "playground.html"
    a.click()
    URL.revokeObjectURL(url)
  }

  const insertTemplate = (template: "card" | "form" | "navbar") => {
    const templates = {
      card: {
        html: `<div class="card">
    <img src="https://via.placeholder.com/300x200" alt="Card image">
    <div class="card-content">
        <h3>Card Title</h3>
        <p>This is a sample card with an image and content.</p>
        <button class="card-btn">Learn More</button>
    </div>
</div>`,
        css: `.card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    overflow: hidden;
    max-width: 300px;
    margin: 20px auto;
}

.card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.card-content {
    padding: 20px;
}

.card h3 {
    margin: 0 0 10px 0;
    color: #333;
}

.card p {
    color: #666;
    margin: 0 0 15px 0;
}

.card-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
}`,
      },
      form: {
        html: `<form class="contact-form">
    <h2>Contact Us</h2>
    <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>
    </div>
    <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
    </div>
    <div class="form-group">
        <label for="message">Message:</label>
        <textarea id="message" name="message" rows="4" required></textarea>
    </div>
    <button type="submit">Send Message</button>
</form>`,
        css: `.contact-form {
    max-width: 400px;
    margin: 20px auto;
    padding: 30px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.contact-form h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    color: #555;
    font-weight: bold;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

.contact-form button {
    width: 100%;
    background: #28a745;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
}`,
      },
      navbar: {
        html: `<nav class="navbar">
    <div class="nav-brand">
        <h2>Brand</h2>
    </div>
    <ul class="nav-menu">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
    </ul>
</nav>
<div class="content">
    <h1>Welcome to our website</h1>
    <p>This is the main content area.</p>
</div>`,
        css: `.navbar {
    background: #333;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand h2 {
    margin: 0;
    color: #fff;
}

.nav-menu {
    list-style: none;
    display: flex;
    gap: 2rem;
    margin: 0;
    padding: 0;
}

.nav-menu a {
    color: white;
    text-decoration: none;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: #007bff;
}

.content {
    padding: 2rem;
    text-align: center;
}`,
      },
    }

    const template_data = templates[template]
    setHtmlCode(template_data.html)
    setCssCode(template_data.css)
    setTimeout(updatePreview, 100)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              <CardTitle>HTML/CSS Playground</CardTitle>
            </div>
            <CardDescription>Write HTML and CSS code and see live results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <Button onClick={updatePreview}>
                    <Play className="mr-2 h-4 w-4" />
                    Run Code
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button onClick={downloadCode} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => insertTemplate("card")} variant="secondary" size="sm">
                    Card Template
                  </Button>
                  <Button onClick={() => insertTemplate("form")} variant="secondary" size="sm">
                    Form Template
                  </Button>
                  <Button onClick={() => insertTemplate("navbar")} variant="secondary" size="sm">
                    Navbar Template
                  </Button>
                </div>
              </div>

              {/* Editor and Preview */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Code Editor */}
                <div className="space-y-4">
                  <Tabs defaultValue="html">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="html">HTML</TabsTrigger>
                      <TabsTrigger value="css">CSS</TabsTrigger>
                    </TabsList>

                    <TabsContent value="html" className="space-y-2">
                      <Label htmlFor="html-editor">HTML Code</Label>
                      <textarea
                        id="html-editor"
                        value={htmlCode}
                        onChange={(e) => setHtmlCode(e.target.value)}
                        className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter your HTML code here..."
                      />
                    </TabsContent>

                    <TabsContent value="css" className="space-y-2">
                      <Label htmlFor="css-editor">CSS Code</Label>
                      <textarea
                        id="css-editor"
                        value={cssCode}
                        onChange={(e) => setCssCode(e.target.value)}
                        className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter your CSS code here..."
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Preview */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Label>Live Preview</Label>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <iframe srcDoc={previewContent} className="w-full h-96" title="Preview" sandbox="allow-scripts" />
                  </div>
                </motion.div>
              </div>

              {/* Tips */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Click "Run Code" to update the preview with your changes</li>
                  <li>Use the template buttons to quickly insert common HTML/CSS patterns</li>
                  <li>The preview is sandboxed for security</li>
                  <li>Download your code as an HTML file when you're done</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
