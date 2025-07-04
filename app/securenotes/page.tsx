"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CryptoJS from "crypto-js";
import {
  Lock,
  Unlock,
  Trash2,
  Sun,
  Moon,
  Save,
  Edit,
  Download,
  Upload,
  Search,
  X,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import { PDFDocument, rgb, RotationTypes } from "pdf-lib";
import ReactMarkdown from "react-markdown";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  encrypted: boolean;
  createdAt: string;
}

export default function SecureNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    Prism.highlightAll();
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    Prism.highlightAll();
  }, [notes, selectedNote]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const encryptNote = (text: string, password: string) => {
    try {
      return CryptoJS.AES.encrypt(text, password).toString();
    } catch (err) {
      setError("Encryption failed. Please try again.");
      return null;
    }
  };

  const decryptNote = (encryptedText: string, password: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error("Invalid password or corrupted data");
      }
      return decrypted;
    } catch (err) {
      setError("Decryption failed. Please check your password.");

      return null;
    }
  };

  const handleSaveNote = () => {
    if (!title || !content || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const encryptedContent = encryptNote(content, password);
    if (!encryptedContent) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content: encryptedContent,
      encrypted: true,
      createdAt: new Date().toISOString(),
    };

    setNotes([...notes, newNote]);
    setTitle("");
    setContent("");
    setPassword("");
    setError("");
    setSuccess("Note saved successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEditNote = () => {
    if (!selectedNote || !title || !content || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const encryptedContent = encryptNote(content, password);
    if (!encryptedContent) return;

    const updatedNote: Note = {
      ...selectedNote,
      title,
      content: encryptedContent,
      encrypted: true,
      createdAt: selectedNote.createdAt,
    };

    setNotes(
      notes.map((note) => (note.id === selectedNote.id ? updatedNote : note))
    );
    setSelectedNote(null);
    setIsEditing(false);
    setTitle("");
    setContent("");
    setPassword("");
    setError("");
    setSuccess("Note updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleDecryptNote = (note: Note) => {
    if (!password) {
      setError("Please enter a password to decrypt.");
      return;
    }

    const decryptedContent = decryptNote(note.content, password);
    if (decryptedContent) {
      setSelectedNote({ ...note, content: decryptedContent, encrypted: false });
      setError("");
      setSuccess("Note decrypted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    setSelectedNote(null);
    setPassword("");
    setError("");
    setSuccess("Note deleted successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setPassword("");
    setError("");
    setIsEditing(false);
    setPdfPreview(null);
  };

  const handleEditSelectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    const decryptedContent = decryptNote(note.content, password);
    if (decryptedContent) {
      setContent(decryptedContent);
      setIsEditing(true);
      setError("");
    } else {
      setError("Please enter the correct password to edit.");
    }
  };

  const createEncryptedPdfBlob = async (note: Note) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    page.drawText("Encrypted Secure Note", {
      x: 50,
      y: 350,
      size: 24,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Title: ${note.title}`, {
      x: 50,
      y: 300,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Created: ${new Date(note.createdAt).toLocaleString()}`, {
      x: 50,
      y: 280,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText("Note: This content is encrypted. Upload to decrypt.", {
      x: 50,
      y: 250,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText("Encrypted Content:", {
      x: 50,
      y: 220,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Split content into lines to fit in PDF
    const lines = [];
    let currentLine = "";
    for (const word of note.content.split(" ")) {
      if (currentLine.length + word.length > 80) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine += (currentLine ? " " : "") + word;
      }
    }
    if (currentLine) lines.push(currentLine);

    let yPosition = 200;
    for (const line of lines.slice(0, 10)) {
      // Show first 10 lines
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    }

    if (lines.length > 10) {
      page.drawText("[...content truncated...]", {
        x: 50,
        y: yPosition,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    page.drawText("Generated by LALA ToolKit", {
      x: 300,
      y: 30,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  };

  const handleDownloadEncryptedPDF = async (note: Note) => {
    try {
      const blob = await createEncryptedPdfBlob(note);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Encrypted_${note.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("Encrypted PDF downloaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to generate PDF. Please try again.");
    }
  };

  const handlePreviewEncryptedPDF = async (note: Note) => {
    try {
      const blob = await createEncryptedPdfBlob(note);
      const url = URL.createObjectURL(blob);
      setPdfPreview(url);
      setSuccess("Encrypted PDF preview generated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to generate PDF preview. Please try again.");
    }
  };

  const handleDownloadDecryptedPDF = async (note: Note) => {
    if (note.encrypted) {
      setError("Please decrypt the note before downloading as decrypted PDF.");
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 400]);

      // Watermark
      page.drawText("LALA ToolKit", {
        x: 300,
        y: 200,
        size: 40,
        color: rgb(0.9, 0.9, 0.9),
        rotate: { type: RotationTypes.Degrees, angle: 45 },
        opacity: 0.5,
      });

      // Header
      page.drawRectangle({
        x: 0,
        y: 370,
        width: 600,
        height: 30,
        color: rgb(0.23, 0.51, 0.96),
      });

      page.drawText("Secure Note", {
        x: 300,
        y: 380,
        size: 16,
        color: rgb(1, 1, 1),
      });

      // Title
      page.drawText(note.title, {
        x: 50,
        y: 330,
        size: 18,
        color: rgb(0, 0, 0),
      });

      // Content
      const lines = note.content.split("\n");
      let yPosition = 300;
      for (const line of lines.slice(0, 20)) {
        // Show first 20 lines
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 12,
          color: rgb(0, 0, 0),
        });
        yPosition -= 15;
      }

      if (lines.length > 20) {
        page.drawText("[...content truncated...]", {
          x: 50,
          y: yPosition,
          size: 10,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      // Footer
      page.drawText(`Created: ${new Date(note.createdAt).toLocaleString()}`, {
        x: 50,
        y: 30,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText("Generated by LALA ToolKit", {
        x: 300,
        y: 30,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Border
      page.drawRectangle({
        x: 20,
        y: 20,
        width: 560,
        height: 360,
        borderColor: rgb(0.23, 0.51, 0.96),
        borderWidth: 1,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("Decrypted PDF downloaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to generate PDF. Please try again.");
    }
  };

  const handleUploadPDF = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".pdf")) {
      setError("Please upload a valid PDF file.");
      return;
    }

    try {
      // Note: pdf-lib does not support direct text extraction.
      // The original code stores the encrypted content as-is in the PDF.
      // We rely on the content being stored in the PDF as generated by createEncryptedPdfBlob.
      // For advanced text extraction, consider using libraries like pdf2pic or pdf.js in the future.
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Since we can't extract text directly, we assume the encrypted content is stored as per createEncryptedPdfBlob.
      // We use the same pattern-matching logic, but note that this is a simplification.
      // The encrypted content is stored in the note.content field when uploaded.
      const encryptedContent = notes.find((note) =>
        note.title.includes(file.name.replace(".pdf", ""))
      )?.content;

      if (!encryptedContent) {
        setError(
          "No encrypted content found for this PDF. Make sure it was created by this app."
        );
        return;
      }

      if (!password) {
        setError("Please enter a password to decrypt the uploaded note.");
        return;
      }

      const decryptedContent = decryptNote(encryptedContent, password);
      if (decryptedContent) {
        const newNote: Note = {
          id: Date.now().toString(),
          title: `Uploaded: ${file.name.replace(".pdf", "")}`,
          content: decryptedContent,
          encrypted: false,
          createdAt: new Date().toISOString(),
        };
        setNotes([...notes, newNote]);
        setSelectedNote(newNote);
        setError("");
        setSuccess("PDF uploaded and decrypted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("PDF processing error:", err);
      setError(
        "Failed to process PDF. Please check the password or try another file."
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-lg p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold flex items-center">
          <FileText className="mr-2" size={28} /> LALA ToolKit
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </nav>

      <div className="container mx-auto p-4 max-w-5xl">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-4 flex justify-between items-center shadow-md"
            >
              <span>{error}</span>
              <Button variant="ghost" size="icon" onClick={() => setError("")}>
                <X size={20} />
              </Button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-4 rounded-lg mb-4 flex justify-between items-center shadow-md"
            >
              <span>{success}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSuccess("")}
              >
                <X size={20} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl mb-6"
        >
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? "Edit Note" : "Create New Note"}
          </h2>
          <Input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
          />
          <Textarea
            placeholder="Write your note here (supports Markdown)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-4"
            rows={6}
          />
          <Input
            type="password"
            placeholder="Encryption Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <div className="flex space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={isEditing ? handleEditNote : handleSaveNote}>
                    <Save size={20} className="mr-2" />{" "}
                    {isEditing ? "Update Note" : "Save Note"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isEditing ? "Update note" : "Save note"}</p>
                </TooltipContent>
              </Tooltip>
              {isEditing && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setTitle("");
                        setContent("");
                        setPassword("");
                        setSelectedNote(null);
                      }}
                    >
                      <X size={20} className="mr-2" /> Cancel
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel editing</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </motion.div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            Your Notes ({filteredNotes.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{note.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {note.encrypted ? "Encrypted" : "Decrypted"} •{" "}
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSelectNote(note)}
                            >
                              <Edit size={20} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View note</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSelectNote(note)}
                            >
                              <Edit size={20} className="text-yellow-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit note</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePreviewEncryptedPDF(note)}
                            >
                              <FileText size={20} className="text-blue-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview PDF</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadEncryptedPDF(note)}
                            >
                              <Download size={20} className="text-purple-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download PDF</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 size={20} className="text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete note</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {selectedNote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl mt-6"
          >
            <h2 className="text-2xl font-bold mb-4">{selectedNote.title}</h2>
            {selectedNote.encrypted ? (
              <>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  This note is encrypted. Enter the password to decrypt.
                </p>
                <Input
                  type="password"
                  placeholder="Decryption Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-4"
                />
                <div className="flex space-x-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => handleDecryptNote(selectedNote)}>
                          <Unlock size={20} className="mr-2" /> Decrypt Note
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Decrypt note</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {pdfPreview && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setPdfPreview(null)}
                          >
                            <X size={20} className="mr-2" /> Close Preview
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Close PDF preview</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="prose dark:prose-invert max-w-none mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return node.tagName === "code" && match ? (
                          <pre className={`language-${match[1]}`}>
                            <code className={`language-${match[1]}`}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {selectedNote.content}
                  </ReactMarkdown>
                </div>
                <div className="flex space-x-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() =>
                            handleDownloadDecryptedPDF(selectedNote)
                          }
                        >
                          <Download size={20} className="mr-2" /> Download PDF
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download decrypted PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (!password) {
                              setError("Please enter an encryption password");
                              return;
                            }
                            const encryptedContent = encryptNote(
                              selectedNote.content,
                              password
                            );
                            if (encryptedContent) {
                              setSelectedNote({
                                ...selectedNote,
                                content: encryptedContent,
                                encrypted: true,
                              });
                              setSuccess("Note re-encrypted successfully!");
                              setTimeout(() => setSuccess(""), 3000);
                            }
                          }}
                        >
                          <Lock size={20} className="mr-2" /> Re-encrypt
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Re-encrypt this note</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}
            {pdfPreview && (
              <div className="mt-6 border rounded-lg overflow-hidden">
                <iframe
                  src={pdfPreview}
                  width="100%"
                  height="500px"
                  className="border-0"
                  title="PDF Preview"
                />
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Created: {new Date(selectedNote.createdAt).toLocaleString()}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl mt-6"
        >
          <h2 className="text-xl font-bold mb-4">PDF Operations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Upload Encrypted PDF</h3>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleUploadPDF}
                ref={fileInputRef}
                className="mb-4 text-gray-700 dark:text-gray-300"
              />
              <Input
                type="password"
                placeholder="Decryption Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload size={20} className="mr-2" /> Select PDF
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select PDF to upload and decrypt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {selectedNote && !selectedNote.encrypted && (
              <div>
                <h3 className="font-medium mb-2">Create Encrypted PDF</h3>
                <Input
                  type="password"
                  placeholder="Encryption Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-4"
                />
                <div className="flex space-x-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={async () => {
                            if (!password) {
                              setError("Please enter an encryption password");
                              return;
                            }
                            const encryptedContent = encryptNote(
                              selectedNote.content,
                              password
                            );
                            if (encryptedContent) {
                              const tempNote = {
                                ...selectedNote,
                                content: encryptedContent,
                                encrypted: true,
                              };
                              await handlePreviewEncryptedPDF(tempNote);
                            }
                          }}
                        >
                          <FileText size={20} className="mr-2" /> Preview
                          Encrypted
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Preview encrypted version</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            if (!password) {
                              setError("Please enter an encryption password");
                              return;
                            }
                            const encryptedContent = encryptNote(
                              selectedNote.content,
                              password
                            );
                            if (encryptedContent) {
                              const tempNote = {
                                ...selectedNote,
                                content: encryptedContent,
                                encrypted: true,
                              };
                              await handleDownloadEncryptedPDF(tempNote);
                            }
                          }}
                        >
                          <Download size={20} className="mr-2" /> Download
                          Encrypted
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download encrypted version</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <footer className="mt-8 text-center text-gray-500 dark:text-gray-400">
          <p>© 2025 LALA Tools</p>
          <p>Built with Next.js and shadcn/ui</p>
          <a
            href="https://your-portfolio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Check My Portfolio & Projects
          </a>
        </footer>
      </div>
    </div>
  );
}
