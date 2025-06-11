"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StickyNote, Plus, Search, Trash2, Edit, Save, X, Tag } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  color: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const noteColors = [
  { name: "Yellow", value: "bg-yellow-200 border-yellow-300", text: "text-yellow-900" },
  { name: "Pink", value: "bg-pink-200 border-pink-300", text: "text-pink-900" },
  { name: "Blue", value: "bg-blue-200 border-blue-300", text: "text-blue-900" },
  { name: "Green", value: "bg-green-200 border-green-300", text: "text-green-900" },
  { name: "Purple", value: "bg-purple-200 border-purple-300", text: "text-purple-900" },
  { name: "Orange", value: "bg-orange-200 border-orange-300", text: "text-orange-900" },
]

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    color: noteColors[0].value,
    tags: [] as string[],
  })
  const [showNewNoteForm, setShowNewNoteForm] = useState(false)
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (e) {
        console.error("Failed to parse notes from localStorage")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  const createNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title || "Untitled",
      content: newNote.content,
      color: newNote.color,
      tags: newNote.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setNotes([note, ...notes])
    setNewNote({ title: "", content: "", color: noteColors[0].value, tags: [] })
    setShowNewNoteForm(false)
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note)),
    )
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const addTag = (noteId: string, tag: string) => {
    if (!tag.trim()) return

    const note = notes.find((n) => n.id === noteId)
    if (note && !note.tags.includes(tag.trim())) {
      updateNote(noteId, { tags: [...note.tags, tag.trim()] })
    }
  }

  const removeTag = (noteId: string, tagToRemove: string) => {
    const note = notes.find((n) => n.id === noteId)
    if (note) {
      updateNote(noteId, { tags: note.tags.filter((tag) => tag !== tagToRemove) })
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <StickyNote className="h-6 w-6 text-primary" />
              <CardTitle>Notes App</CardTitle>
            </div>
            <CardDescription>Create and organize your sticky notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowNewNoteForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setSearchTerm(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Note Form */}
        <AnimatePresence>
          {showNewNoteForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Create New Note</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewNoteForm(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Write your note here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={4}
                  />

                  {/* Color Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color:</label>
                    <div className="flex gap-2">
                      {noteColors.map((color) => (
                        <button
                          key={color.name}
                          className={`w-8 h-8 rounded-full border-2 ${color.value} ${
                            newNote.color === color.value ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setNewNote({ ...newNote, color: color.value })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tags Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags:</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            if (tagInput.trim() && !newNote.tags.includes(tagInput.trim())) {
                              setNewNote({ ...newNote, tags: [...newNote.tags, tagInput.trim()] })
                              setTagInput("")
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (tagInput.trim() && !newNote.tags.includes(tagInput.trim())) {
                            setNewNote({ ...newNote, tags: [...newNote.tags, tagInput.trim()] })
                            setTagInput("")
                          }
                        }}
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    {newNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {newNote.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                            <button
                              onClick={() =>
                                setNewNote({ ...newNote, tags: newNote.tags.filter((_, i) => i !== index) })
                              }
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={createNote}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Note
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewNoteForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 ${note.color} ${
                  noteColors.find((c) => c.value === note.color)?.text || "text-gray-900"
                } shadow-sm hover:shadow-md transition-all duration-200`}
              >
                {editingNote === note.id ? (
                  <div className="space-y-3">
                    <Input
                      value={note.title}
                      onChange={(e) => updateNote(note.id, { title: e.target.value })}
                      className="bg-white/50"
                    />
                    <Textarea
                      value={note.content}
                      onChange={(e) => updateNote(note.id, { content: e.target.value })}
                      rows={4}
                      className="bg-white/50"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setEditingNote(null)}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg leading-tight">{note.title}</h3>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingNote(note.id)}
                          className="h-6 w-6 p-0 hover:bg-white/50"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNote(note.id)}
                          className="h-6 w-6 p-0 hover:bg-white/50 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs bg-white/50">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="text-xs opacity-70">{new Date(note.updatedAt).toLocaleDateString()}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredNotes.length === 0 && (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StickyNote className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? "No notes found matching your search." : "No notes yet. Create your first note!"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
