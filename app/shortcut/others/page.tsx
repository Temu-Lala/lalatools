'use client';

import React, { useState, useMemo } from 'react';

interface ShortcutsPageProps {
  darkMode: boolean; // controlled from parent (navbar)
}

const shortcuts = {
  "Git CLI": {
    "git init": "Initialize new repository",
    "git clone [url]": "Clone a repository",
    "git status": "Show current repo status",
    "git add .": "Stage all changes",
    "git add [file]": "Stage specific file",
    "git commit -m 'message'": "Commit staged changes",
    "git commit --amend": "Modify last commit",
    "git push": "Push commits to remote",
    "git push -u origin [branch]": "Push and set upstream",
    "git pull": "Pull latest from remote",
    "git fetch": "Fetch remote updates",
    "git checkout -b [branch]": "Create and switch to new branch",
    "git checkout [branch]": "Switch branch",
    "git branch": "List branches",
    "git branch -d [branch]": "Delete branch",
    "git merge [branch]": "Merge branch into current",
    "git rebase [branch]": "Rebase current branch",
    "git log": "Show commit history",
    "git log --oneline": "Compact commit history",
    "git diff": "Show unstaged changes",
    "git diff --staged": "Show staged changes",
    "git stash": "Stash changes",
    "git stash list": "List stashes",
    "git stash apply": "Apply stashed changes",
    "git stash pop": "Apply and remove stash",
    "git reset --hard": "Reset working directory",
    "git revert [commit]": "Create undo commit",
    "git remote -v": "Show remote URLs",
    "git cherry-pick [commit]": "Apply specific commit",
    "git rm [file]": "Remove file from tracking"
  },

  "VS Code": {
    "Ctrl+P / Cmd+P": "Quick open files",
    "Ctrl+Shift+P / Cmd+Shift+P": "Command palette",
    "Ctrl+` / Cmd+`": "Toggle integrated terminal",
    "Ctrl+B / Cmd+B": "Toggle sidebar",
    "Ctrl+Shift+N / Cmd+Shift+N": "New window",
    "Ctrl+W / Cmd+W": "Close current tab",
    "Ctrl+F / Cmd+F": "Find in file",
    "Ctrl+H / Cmd+H": "Replace in file",
    "Ctrl+D / Cmd+D": "Select next occurrence",
    "Ctrl+Shift+L / Cmd+Shift+L": "Select all occurrences",
    "Shift+Alt+F / Shift+Option+F": "Format document",
    "F5": "Start debugging",
    "Shift+F5": "Stop debugging",
    "F9": "Toggle breakpoint",
    "F12": "Go to definition",
    "Alt+F12": "Peek definition",
    "Ctrl+K Ctrl+S / Cmd+K Cmd+S": "Open keyboard shortcuts",
    "Ctrl+Shift+O / Cmd+Shift+O": "Go to symbol",
    "Ctrl+Shift+M / Cmd+Shift+M": "Show problems panel",
    "Ctrl+K Z / Cmd+K Z": "Zen mode",
    "Ctrl+/ / Cmd+/": "Toggle line comment",
    "Ctrl+Shift+[/] / Cmd+Option+[/]": "Fold/unfold region",
    "Ctrl+Shift+K / Cmd+Shift+K": "Delete line",
    "Alt+Up/Down / Option+Up/Down": "Move line up/down"
  },

  "Terminal (Linux/macOS)": {
    "Ctrl+C": "Cancel running command",
    "Ctrl+Z": "Suspend process",
    "fg": "Bring suspended process to foreground",
    "Ctrl+L": "Clear screen",
    "Ctrl+R": "Reverse search command history",
    "Tab": "Autocomplete file/folder names",
    "Ctrl+A": "Go to beginning of line",
    "Ctrl+E": "Go to end of line",
    "Ctrl+U": "Delete from cursor to start of line",
    "Ctrl+K": "Delete from cursor to end of line",
    "Ctrl+W": "Delete previous word",
    "Ctrl+Y": "Paste last killed text",
    "Ctrl+Shift+T": "Open new terminal tab",
    "Ctrl+D": "Close terminal tab/window",
    "history": "Show command history",
    "!!": "Repeat last command",
    "!$": "Last argument of previous command",
    "clear": "Clear terminal",
    "exit": "Exit terminal session",
    "mkdir folder": "Create a new folder",
    "cd -": "Go to previous directory",
    "pwd": "Print working directory",
    "ls -la": "List all files including hidden",
    "chmod +x file": "Make file executable",
    "grep pattern file": "Search for pattern in file"
  },

  "Windows OS": {
    "Win + D": "Show desktop",
    "Win + E": "Open File Explorer",
    "Win + L": "Lock computer",
    "Win + V": "Open clipboard history",
    "Win + .": "Open emoji picker",
    "Win + Shift + S": "Screen snip",
    "Win + Tab": "Task view",
    "Win + Ctrl + D": "Create new virtual desktop",
    "Win + Ctrl + F4": "Close current virtual desktop",
    "Win + Ctrl + Left/Right": "Switch between virtual desktops",
    "Alt + Tab": "Switch between apps",
    "Alt + F4": "Close active window",
    "Ctrl + Shift + Esc": "Open Task Manager",
    "Win + I": "Open Settings",
    "Win + S": "Open Search",
    "Win + R": "Open Run dialog",
    "Win + X": "Open quick link menu",
    "Win + P": "Project display options",
    "Win + Number": "Open pinned taskbar app",
    "Ctrl + C": "Copy",
    "Ctrl + V": "Paste",
    "Ctrl + X": "Cut",
    "Ctrl + Z": "Undo",
    "Ctrl + Y": "Redo",
    "Ctrl + A": "Select all",
    "Ctrl + F": "Find",
    "Ctrl + Shift + N": "New folder",
    "F2": "Rename selected item",
    "F5": "Refresh"
  },

  "macOS": {
    "Cmd + Space": "Open Spotlight Search",
    "Cmd + Tab": "Switch between apps",
    "Cmd + `": "Switch between windows of same app",
    "Cmd + C": "Copy",
    "Cmd + V": "Paste",
    "Cmd + X": "Cut",
    "Cmd + Z": "Undo",
    "Cmd + Shift + Z": "Redo",
    "Cmd + Q": "Quit app",
    "Cmd + W": "Close window",
    "Cmd + Option + Esc": "Force quit",
    "Cmd + H": "Hide current app",
    "Cmd + Option + H": "Hide other apps",
    "Cmd + M": "Minimize window",
    "Cmd + Shift + 3": "Screenshot entire screen",
    "Cmd + Shift + 4": "Screenshot selection",
    "Cmd + Shift + 5": "Screenshot options",
    "Cmd + Shift + 4 then Space": "Screenshot window",
    "Cmd + N": "New window/document",
    "Cmd + T": "New tab",
    "Cmd + Option + D": "Show/hide Dock",
    "Cmd + ,": "Open app preferences",
    "Cmd + Shift + .": "Show hidden files in dialogs",
    "Cmd + Option + I": "Show inspector",
    "Ctrl + Cmd + Space": "Open character viewer",
    "Fn + Delete": "Forward delete",
    "Cmd + Delete": "Move to trash",
    "Cmd + Shift + Delete": "Empty trash"
  },

  "Slack": {
    "Ctrl + K / Cmd + K": "Jump to conversation",
    "Ctrl + Shift + M / Cmd + Shift + M": "Open mentions",
    "Ctrl + Shift + A / Cmd + Shift + A": "Open all unreads",
    "Ctrl + / / Cmd + /": "Show keyboard shortcuts",
    "Ctrl + F / Cmd + F": "Search in current channel",
    "Ctrl + Shift + C / Cmd + Shift + C": "Create a new channel",
    "Ctrl + Shift + Y / Cmd + Shift + Y": "Mark all messages as read",
    "Ctrl + B / Cmd + B": "Bold text",
    "Ctrl + I / Cmd + I": "Italicize text",
    "Ctrl + U / Cmd + U": "Underline text",
    "Ctrl + Shift + S / Cmd + Shift + S": "Star a message",
    "Alt + Up/Down / Option + Up/Down": "Navigate messages",
    "Ctrl + Enter / Cmd + Return": "Send message",
    "Ctrl + Shift + X / Cmd + Shift + X": "Open emoji picker",
    "Ctrl + Shift + L / Cmd + Shift + L": "Open channel details",
    "Ctrl + [ / Cmd + [": "Previous channel",
    "Ctrl + ] / Cmd + ]": "Next channel",
    "Ctrl + G / Cmd + G": "Jump to message",
    "Ctrl + Shift + F / Cmd + Shift + F": "Search all messages"
  },

  "Zoom": {
    "Alt + A / Option + A": "Mute/unmute audio",
    "Alt + V / Option + V": "Start/stop video",
    "Alt + S / Option + S": "Start/stop screen sharing",
    "Alt + H / Option + H": "Show/hide chat panel",
    "Alt + Y / Option + Y": "Raise/lower hand",
    "Alt + Q / Option + Q": "Quit meeting",
    "Alt + N / Option + N": "Switch camera",
    "Alt + F / Option + F": "Enter/exit fullscreen",
    "Alt + R / Option + R": "Start/stop local recording",
    "Alt + P / Option + P": "Pause/resume recording",
    "Alt + Shift + R / Option + Shift + R": "Start/stop remote control",
    "Ctrl + Alt + Shift + H": "Show/hide meeting controls",
    "Alt + Shift + T / Option + Shift + T": "Screenshot",
    "Alt + Left/Right / Option + Left/Right": "Switch between shared screens",
    "Alt + I / Option + I": "Invite others",
    "Alt + U / Option + U": "Show/hide participants",
    "Alt + Shift + S / Option + Shift + S": "Start/stop cloud recording",
    "Ctrl + W": "Close current chat",
    "Ctrl + Alt + Shift + M": "Mute all except host"
  },

  "Canva": {
    "Ctrl + Z / Cmd + Z": "Undo",
    "Ctrl + Y / Cmd + Y": "Redo",
    "Ctrl + C / Cmd + C": "Copy",
    "Ctrl + V / Cmd + V": "Paste",
    "Ctrl + X / Cmd + X": "Cut",
    "Ctrl + D / Cmd + D": "Duplicate",
    "Ctrl + G / Cmd + G": "Group elements",
    "Ctrl + Shift + G / Cmd + Shift + G": "Ungroup elements",
    "Ctrl + ] / Cmd + ]": "Bring forward",
    "Ctrl + [ / Cmd + [": "Send backward",
    "Delete / Cmd + Backspace": "Delete element",
    "Arrow keys": "Nudge element",
    "Shift + Arrow keys": "Move element faster",
    "Ctrl + Shift + L / Cmd + Shift + L": "Align left",
    "Ctrl + Shift + R / Cmd + Shift + R": "Align right",
    "Ctrl + Shift + T / Cmd + Shift + T": "Align top",
    "Ctrl + Shift + B / Cmd + Shift + B": "Align bottom",
    "Ctrl + Shift + C / Cmd + Shift + C": "Center horizontally",
    "Ctrl + Shift + E / Cmd + Shift + E": "Center vertically",
    "Ctrl + E / Cmd + E": "Flip horizontal",
    "Ctrl + Shift + E / Cmd + Shift + E": "Flip vertical",
    "Ctrl + K / Cmd + K": "Add link",
    "T": "Text tool",
    "B": "Background color picker"
  },

  "Photoshop": {
    "Ctrl + N / Cmd + N": "New document",
    "Ctrl + O / Cmd + O": "Open document",
    "Ctrl + S / Cmd + S": "Save",
    "Ctrl + Shift + S / Cmd + Shift + S": "Save As",
    "Ctrl + Alt + S / Cmd + Option + S": "Save for Web",
    "Ctrl + Z / Cmd + Z": "Undo/Redo last step",
    "Ctrl + Alt + Z / Cmd + Option + Z": "Step backward",
    "Ctrl + Shift + Z / Cmd + Shift + Z": "Step forward",
    "Ctrl + T / Cmd + T": "Free transform",
    "Ctrl + D / Cmd + D": "Deselect",
    "Ctrl + Shift + D / Cmd + Shift + D": "Reselect",
    "Ctrl + J / Cmd + J": "Duplicate layer",
    "Ctrl + Shift + N / Cmd + Shift + N": "New layer",
    "Ctrl + E / Cmd + E": "Merge layers",
    "Ctrl + Shift + E / Cmd + Shift + E": "Merge visible layers",
    "Ctrl + Shift + I / Cmd + Shift + I": "Invert selection",
    "B": "Brush tool",
    "V": "Move tool",
    "M": "Marquee tools",
    "L": "Lasso tools",
    "W": "Quick Selection/Magic Wand",
    "C": "Crop tool",
    "I": "Eyedropper",
    "G": "Gradient/Paint Bucket",
    "P": "Pen tool",
    "T": "Type tool",
    "U": "Shape tools",
    "H": "Hand tool",
    "Z": "Zoom tool",
    "D": "Default colors",
    "X": "Swap colors",
    "Alt + Backspace / Option + Delete": "Fill with foreground color",
    "Ctrl + Backspace / Cmd + Delete": "Fill with background color",
    "[": "Decrease brush size",
    "]": "Increase brush size",
    "Shift + [": "Decrease brush hardness",
    "Shift + ]": "Increase brush hardness",
    "Space": "Temporarily access Hand tool"
  },

  "Figma": {
    "Ctrl + D / Cmd + D": "Duplicate selection",
    "Ctrl + G / Cmd + G": "Group selection",
    "Ctrl + Shift + G / Cmd + Shift + G": "Ungroup",
    "Ctrl + ] / Cmd + ]": "Bring forward",
    "Ctrl + [ / Cmd + [": "Send backward",
    "Ctrl + Shift + ] / Cmd + Shift + ]": "Bring to front",
    "Ctrl + Shift + [ / Cmd + Shift + [": "Send to back",
    "Ctrl + Shift + K / Cmd + Shift + K": "Show/hide UI",
    "Ctrl + / / Cmd + /": "Quick actions",
    "Ctrl + Enter / Cmd + Return": "Present",
    "Ctrl + P / Cmd + P": "Open file",
    "Ctrl + Shift + O / Cmd + Shift + O": "Outline stroke",
    "Ctrl + Shift + C / Cmd + Shift + C": "Copy properties",
    "Ctrl + Alt + V / Cmd + Option + V": "Paste properties",
    "Alt + Drag / Option + Drag": "Duplicate while dragging",
    "Shift + R": "Rename layers",
    "Ctrl + L / Cmd + L": "Lock selection",
    "Ctrl + Shift + L / Cmd + Shift + L": "Unlock all",
    "Ctrl + E / Cmd + E": "Toggle outline view",
    "Ctrl + Alt + B / Cmd + Option + B": "Toggle boolean operations",
    "Ctrl + Alt + G / Cmd + Option + G": "Create component",
    "Ctrl + Alt + K / Cmd + Option + K": "Detach instance",
    "Ctrl + Shift + H / Cmd + Shift + H": "Flip horizontal",
    "Ctrl + Shift + V / Cmd + Shift + V": "Flip vertical",
    "F": "Frame tool",
    "R": "Rectangle tool",
    "O": "Ellipse tool",
    "L": "Line tool",
    "T": "Text tool",
    "P": "Pen tool",
    "Shift + P": "Pencil tool",
    "H": "Hand tool",
    "Space": "Temporarily access Hand tool",
    "Ctrl + 1 / Cmd + 1": "Zoom to 100%",
    "Ctrl + 0 / Cmd + 0": "Zoom to fit"
  },

  "Google Chrome": {
    "Ctrl + T / Cmd + T": "Open new tab",
    "Ctrl + W / Cmd + W": "Close current tab",
    "Ctrl + Shift + T / Cmd + Shift + T": "Reopen last closed tab",
    "Ctrl + Tab / Cmd + Option + Right": "Switch to next tab",
    "Ctrl + Shift + Tab / Cmd + Option + Left": "Switch to previous tab",
    "Ctrl + 1-8 / Cmd + 1-8": "Switch to specific tab",
    "Ctrl + 9 / Cmd + 9": "Switch to last tab",
    "Ctrl + L / Cmd + L": "Focus address bar",
    "Alt + D / Cmd + L": "Focus address bar",
    "Ctrl + D / Cmd + D": "Bookmark current page",
    "Ctrl + Shift + D / Cmd + Shift + D": "Bookmark all open tabs",
    "Ctrl + Shift + N / Cmd + Shift + N": "Open incognito window",
    "Ctrl + J / Cmd + J": "Open downloads",
    "Ctrl + H / Cmd + H": "Open history",
    "Ctrl + F / Cmd + F": "Find on page",
    "F3": "Find next",
    "Shift + F3": "Find previous",
    "Ctrl + G": "Find next",
    "Ctrl + Shift + G": "Find previous",
    "Ctrl + Shift + Delete / Cmd + Shift + Delete": "Open clear browsing data",
    "Ctrl + R / Cmd + R": "Reload page",
    "Ctrl + Shift + R / Cmd + Shift + R": "Hard reload",
    "F5": "Reload",
    "Ctrl + F5 / Cmd + Shift + R": "Hard reload",
    "F11": "Toggle fullscreen",
    "Ctrl + + / Cmd + +": "Zoom in",
    "Ctrl + - / Cmd + -": "Zoom out",
    "Ctrl + 0 / Cmd + 0": "Reset zoom",
    "Ctrl + Shift + B / Cmd + Shift + B": "Show/hide bookmarks bar",
    "Ctrl + U / Cmd + Option + U": "View page source",
    "Ctrl + Shift + J / Cmd + Option + J": "Open developer tools",
    "Ctrl + Shift + I / Cmd + Option + I": "Open developer tools",
    "F12": "Open developer tools",
    "Esc": "Stop loading/close find bar"
  },

  "Microsoft Excel": {
    "Ctrl + N": "New workbook",
    "Ctrl + O": "Open workbook",
    "Ctrl + S": "Save",
    "F12": "Save As",
    "Ctrl + W": "Close workbook",
    "Ctrl + P": "Print",
    "Ctrl + F": "Find",
    "Ctrl + H": "Replace",
    "Ctrl + Z": "Undo",
    "Ctrl + Y": "Redo",
    "Ctrl + C": "Copy",
    "Ctrl + X": "Cut",
    "Ctrl + V": "Paste",
    "Ctrl + Alt + V": "Paste special",
    "Ctrl + Shift + +": "Insert cells/rows/columns",
    "Ctrl + -": "Delete cells/rows/columns",
    "F2": "Edit active cell",
    "F4": "Repeat last action/toggle references",
    "F5": "Go to",
    "F7": "Spell check",
    "F9": "Calculate all worksheets",
    "Shift + F9": "Calculate active worksheet",
    "Ctrl + ;": "Insert current date",
    "Ctrl + Shift + :": "Insert current time",
    "Ctrl + Arrow keys": "Move to edge of data region",
    "Ctrl + Shift + Arrow keys": "Extend selection",
    "Shift + Space": "Select entire row",
    "Ctrl + Space": "Select entire column",
    "Ctrl + A": "Select entire worksheet",
    "Alt + =": "AutoSum",
    "Ctrl + Shift + L": "Toggle filters",
    "Ctrl + 1": "Format cells dialog",
    "Ctrl + Shift + ~": "General number format",
    "Ctrl + Shift + $": "Currency format",
    "Ctrl + Shift + %": "Percentage format",
    "Ctrl + Shift + #": "Date format",
    "Ctrl + Shift + @": "Time format",
    "Ctrl + B": "Bold",
    "Ctrl + I": "Italic",
    "Ctrl + U": "Underline",
    "Alt + Enter": "New line in same cell"
  },

  "Microsoft Word": {
    "Ctrl + N": "New document",
    "Ctrl + O": "Open document",
    "Ctrl + S": "Save",
    "F12": "Save As",
    "Ctrl + W": "Close document",
    "Ctrl + P": "Print",
    "Ctrl + F": "Find",
    "Ctrl + H": "Replace",
    "Ctrl + Z": "Undo",
    "Ctrl + Y": "Redo",
    "Ctrl + C": "Copy",
    "Ctrl + X": "Cut",
    "Ctrl + V": "Paste",
    "Ctrl + Alt + V": "Paste special",
    "Ctrl + B": "Bold",
    "Ctrl + I": "Italic",
    "Ctrl + U": "Underline",
    "Ctrl + [": "Decrease font size",
    "Ctrl + ]": "Increase font size",
    "Ctrl + E": "Center align",
    "Ctrl + L": "Left align",
    "Ctrl + R": "Right align",
    "Ctrl + J": "Justify",
    "Ctrl + 1": "Single line spacing",
    "Ctrl + 2": "Double line spacing",
    "Ctrl + 5": "1.5 line spacing",
    "Ctrl + Shift + N": "Apply Normal style",
    "Ctrl + Alt + 1": "Apply Heading 1",
    "Ctrl + Alt + 2": "Apply Heading 2",
    "Ctrl + Alt + 3": "Apply Heading 3",
    "Ctrl + Shift + S": "Apply styles",
    "F4": "Repeat last action",
    "Shift + F3": "Change case",
    "Ctrl + Backspace": "Delete previous word",
    "Ctrl + Delete": "Delete next word",
    "Ctrl + Enter": "Page break",
    "Ctrl + Shift + Enter": "Column break",
    "Alt + Shift + D": "Insert date field",
    "Alt + Shift + T": "Insert time field",
    "Ctrl + Shift + C": "Copy formatting",
    "Ctrl + Shift + V": "Paste formatting",
    "Ctrl + K": "Insert hyperlink",
    "Ctrl + M": "Indent paragraph",
    "Ctrl + Shift + M": "Remove indent",
    "Ctrl + T": "Hanging indent",
    "Ctrl + Shift + T": "Remove hanging indent"
  },

  "Adobe Premiere Pro": {
    "Space": "Play/Stop",
    "J": "Play backward",
    "K": "Pause",
    "L": "Play forward",
    "I": "Set in point",
    "O": "Set out point",
    "D": "Select clip at playhead",
    "A": "Track Select Forward",
    "Shift + A": "Track Select Backward",
    "V": "Selection tool",
    "C": "Razor tool",
    "B": "Ripple Edit tool",
    "N": "Rolling Edit tool",
    "X": "Rate Stretch tool",
    "Z": "Zoom tool",
    "H": "Hand tool",
    "Ctrl + A / Cmd + A": "Select all",
    "Ctrl + Z / Cmd + Z": "Undo",
    "Ctrl + S / Cmd + S": "Save",
    "Ctrl + N / Cmd + N": "New project",
    "Ctrl + O / Cmd + O": "Open project",
    "Ctrl + I / Cmd + I": "Import media",
    "Ctrl + M / Cmd + M": "Export media",
    "Ctrl + / / Cmd + /": "New sequence",
    "Q": "Trim to start",
    "W": "Trim to end",
    "E": "Extend selected edit to playhead",
    "F": "Match frame",
    "G": "Go to time",
    "M": "Add marker",
    "Shift + M": "Go to next marker",
    "Ctrl + Shift + M / Cmd + Shift + M": "Go to previous marker",
    "Ctrl + Alt + M / Cmd + Option + M": "Clear marker",
    "Ctrl + Shift + D / Cmd + Shift + D": "Apply default transition",
    "Ctrl + D / Cmd + D": "Video dissolve",
    "Ctrl + Shift + D / Cmd + Shift + D": "Audio crossfade",
    "Shift + 1-8": "Switch workspaces",
    "`": "Maximize panel under cursor",
    "Ctrl + ` / Cmd + `": "Toggle full screen",
    "Up/Down Arrow": "Move to previous/next edit point",
    "Left/Right Arrow": "Move 1 frame backward/forward",
    "Shift + Left/Right Arrow": "Move 5 frames backward/forward"
  },

  "Blender": {
    "G": "Grab/move",
    "R": "Rotate",
    "S": "Scale",
    "X/Y/Z": "Constrain to axis",
    "Shift + X/Y/Z": "Constrain to other axes",
    "Tab": "Toggle Edit/Object mode",
    "Ctrl + Tab": "Mesh select mode",
    "Shift + A": "Add menu",
    "Ctrl + A": "Apply transformations",
    "Ctrl + Z": "Undo",
    "Ctrl + Shift + Z": "Redo",
    "Ctrl + S": "Save",
    "Ctrl + N": "New",
    "Ctrl + O": "Open",
    "Shift + D": "Duplicate",
    "Alt + D": "Linked duplicate",
    "M": "Move to collection",
    "P": "Separate",
    "Ctrl + J": "Join objects",
    "Ctrl + P": "Set parent",
    "Alt + P": "Clear parent",
    "1/2/3": "Vertex/Edge/Face select",
    "Shift + 1/2/3": "Expand selection",
    "Ctrl + 1/2/3": "Add/remove selection",
    "A": "Select/deselect all",
    "B": "Box select",
    "C": "Circle select",
    "L": "Select linked",
    "Ctrl + L": "Select linked all",
    "H": "Hide selected",
    "Alt + H": "Unhide all",
    "Shift + H": "Hide unselected",
    "N": "Toggle sidebar",
    "T": "Toggle tools panel",
    "Ctrl + Space": "Maximize area",
    "Shift + Space": "Toggle fullscreen",
    "Ctrl + Alt + Q": "Toggle quad view",
    "Z": "Toggle wireframe/solid",
    "Shift + Z": "Toggle rendered view",
    "Alt + Z": "Toggle x-ray",
    "Ctrl + B": "Bevel",
    "Ctrl + R": "Loop cut",
    "K": "Knife tool",
    "E": "Extrude",
    "F": "Make face/edge",
    "W": "Special menu",
    "Shift + S": "Snap menu",
    "Alt + S": "Shrink/fatten",
    "Ctrl + I": "Invert selection",
    "Alt + Left/Right": "Next/previous keyframe",
    "Space": "Play animation",
    "Shift + Left/Right": "Frame forward/back",
    "Ctrl + Left/Right": "Jump to start/end"
  },

  "Notion": {
    "Ctrl + N / Cmd + N": "New page",
    "Ctrl + Shift + N / Cmd + Shift + N": "New window",
    "Ctrl + P / Cmd + P": "Quick find",
    "Ctrl + / / Cmd + /": "Open block menu",
    "Ctrl + [ / Cmd + [": "Indent left",
    "Ctrl + ] / Cmd + ]": "Indent right",
    "Ctrl + Enter / Cmd + Return": "Open page",
    "Ctrl + Shift + H / Cmd + Shift + H": "Toggle sidebar",
    "Ctrl + Shift + L / Cmd + Shift + L": "Toggle dark mode",
    "Ctrl + Shift + U / Cmd + Shift + U": "Make uppercase",
    "Ctrl + B / Cmd + B": "Bold",
    "Ctrl + I / Cmd + I": "Italic",
    "Ctrl + U / Cmd + U": "Underline",
    "Ctrl + K / Cmd + K": "Link",
    "Ctrl + E / Cmd + E": "Align center",
    "Ctrl + L / Cmd + L": "Align left",
    "Ctrl + R / Cmd + R": "Align right",
    "Ctrl + Shift + 1-6 / Cmd + Shift + 1-6": "Heading 1-6",
    "Ctrl + Alt + 1-3 / Cmd + Option + 1-3": "Toggle list type",
    "Ctrl + Shift + M / Cmd + Shift + M": "Comment",
    "Ctrl + Shift + T / Cmd + Shift + T": "Toggle checked",
    "Enter": "New block",
    "Shift + Enter": "Line break",
    "Tab": "Indent",
    "Shift + Tab": "Unindent",
    "Ctrl + Alt + T / Cmd + Option + T": "Insert table",
    "Ctrl + Alt + C / Cmd + Option + C": "Insert code block",
    "Ctrl + Alt + L / Cmd + Option + L": "Insert numbered list",
    "Ctrl + Alt + B / Cmd + Option + B": "Insert bullet list",
    "Ctrl + Alt + Q / Cmd + Option + Q": "Insert quote",
    "Ctrl + Alt + H / Cmd + Option + H": "Insert divider",
    "Ctrl + Shift + 0 / Cmd + Shift + 0": "Convert to text",
    "Ctrl + Shift + 7 / Cmd + Shift + 7": "Toggle checkbox",
    "Ctrl + Shift + 8 / Cmd + Shift + 8": "Toggle bullet list",
    "Ctrl + Shift + 9 / Cmd + Shift + 9": "Toggle numbered list"
  },

  "Postman": {
    "Ctrl + N / Cmd + N": "New request",
    "Ctrl + O / Cmd + O": "Open collection",
    "Ctrl + S / Cmd + S": "Save",
    "Ctrl + Shift + S / Cmd + Shift + S": "Save As",
    "Ctrl + W / Cmd + W": "Close tab",
    "Ctrl + Tab / Cmd + Option + Right": "Next tab",
    "Ctrl + Shift + Tab / Cmd + Option + Left": "Previous tab",
    "Ctrl + 1-9 / Cmd + 1-9": "Switch to tab",
    "Ctrl + T / Cmd + T": "New tab",
    "Ctrl + K / Cmd + K": "Focus search",
    "Ctrl + F / Cmd + F": "Find in request",
    "Ctrl + Enter / Cmd + Return": "Send request",
    "Ctrl + Alt + C / Cmd + Option + C": "Copy as cURL",
    "Ctrl + Alt + R / Cmd + Option + R": "Replay request",
    "Ctrl + Shift + B / Cmd + Shift + B": "Toggle sidebar",
    "Ctrl + Shift + C / Cmd + Shift + C": "Open console",
    "Ctrl + Shift + R / Cmd + Shift + R": "Reload app",
    "Ctrl + , / Cmd + ,": "Open settings",
    "Ctrl + Shift + P / Cmd + Shift + P": "Toggle proxy",
    "Ctrl + Shift + E / Cmd + Shift + E": "Open environment",
    "Ctrl + Shift + M / Cmd + Shift + M": "Open mock server",
    "Ctrl + Shift + N / Cmd + Shift + N": "New monitor",
    "Ctrl + Shift + L / Cmd + Shift + L": "Open history",
    "Ctrl + Alt + 1-6 / Cmd + Option + 1-6": "Switch panes",
    "F5": "Refresh collection",
    "F11": "Toggle fullscreen",
    "F12": "Open DevTools"
  },

  "Docker": {
    "docker ps": "List running containers",
    "docker ps -a": "List all containers",
    "docker images": "List images",
    "docker pull [image]": "Pull an image",
    "docker run [image]": "Run a container",
    "docker run -it [image]": "Run interactively",
    "docker run -d [image]": "Run in detached mode",
    "docker run -p [host]:[cont]": "Port mapping",
    "docker run -v [host]:[cont]": "Volume mapping",
    "docker stop [container]": "Stop container",
    "docker start [container]": "Start container",
    "docker restart [container]": "Restart container",
    "docker rm [container]": "Remove container",
    "docker rmi [image]": "Remove image",
    "docker exec -it [cont] [cmd]": "Execute command in container",
    "docker logs [container]": "View container logs",
    "docker build -t [tag] .": "Build image from Dockerfile",
    "docker-compose up": "Start services",
    "docker-compose down": "Stop services",
    "docker-compose build": "Build services",
    "docker-compose logs": "View service logs",
    "docker system prune": "Remove unused data",
    "docker volume ls": "List volumes",
    "docker network ls": "List networks",
    "docker inspect [object]": "Show details",
    "docker stats": "Show live container stats",
    "docker login": "Log in to registry",
    "docker push [image]": "Push image to registry"
  },

  "AWS CLI": {
    "aws configure": "Configure credentials",
    "aws s3 ls": "List S3 buckets",
    "aws s3 cp [src] [dest]": "Copy to/from S3",
    "aws s3 sync [src] [dest]": "Sync directories with S3",
    "aws ec2 describe-instances": "List EC2 instances",
    "aws ec2 start-instances --ids [id]": "Start EC2 instance",
    "aws ec2 stop-instances --ids [id]": "Stop EC2 instance",
    "aws lambda list-functions": "List Lambda functions",
    "aws dynamodb list-tables": "List DynamoDB tables",
    "aws rds describe-db-instances": "List RDS instances",
    "aws iam list-users": "List IAM users",
    "aws cloudformation list-stacks": "List CloudFormation stacks",
    "aws logs describe-log-groups": "List CloudWatch log groups",
    "aws sts get-caller-identity": "Show current IAM identity",
    "aws help": "Show help",
    "aws [service] help": "Service-specific help",
    "aws --version": "Show CLI version",
    "aws --region [region]": "Specify region",
    "aws --profile [profile]": "Use named profile",
    "aws --output [format]": "Set output format",
    "aws ec2 describe-images --owners amazon": "List AMIs",
    "aws s3 mb s3://[bucket]": "Create bucket",
    "aws s3 rb s3://[bucket]": "Delete bucket",
    "aws ec2 create-key-pair --key-name [name]": "Create key pair",
    "aws cloudwatch get-metric-statistics": "Get metrics"
  },

  "Kubernetes (kubectl)": {
    "kubectl get pods": "List pods",
    "kubectl get pods -A": "List all pods",
    "kubectl get nodes": "List nodes",
    "kubectl get services": "List services",
    "kubectl get deployments": "List deployments",
    "kubectl get namespaces": "List namespaces",
    "kubectl describe pod [name]": "Show pod details",
    "kubectl logs [pod]": "Show pod logs",
    "kubectl logs -f [pod]": "Follow logs",
    "kubectl exec -it [pod] -- [cmd]": "Execute command in pod",
    "kubectl apply -f [file]": "Apply configuration",
    "kubectl delete -f [file]": "Delete from configuration",
    "kubectl create deployment [name] --image=[img]": "Create deployment",
    "kubectl expose deployment [name] --port=[p]": "Expose deployment",
    "kubectl scale deployment [name] --replicas=[n]": "Scale deployment",
    "kubectl rollout status deployment/[name]": "Check rollout status",
    "kubectl rollout undo deployment/[name]": "Rollback deployment",
    "kubectl port-forward [pod] [local]:[remote]": "Port forward",
    "kubectl config view": "Show config",
    "kubectl config use-context [name]": "Switch context",
    "kubectl get events": "Show events",
    "kubectl top pods": "Show pod metrics",
    "kubectl top nodes": "Show node metrics",
    "kubectl cluster-info": "Show cluster info",
    "kubectl api-resources": "List API resources",
    "kubectl explain [resource]": "Show resource documentation",
    "kubectl get [resource] -o yaml": "Show resource YAML",
    "kubectl edit [resource]/[name]": "Edit resource",
    "kubectl label [resource] [name] [key]=[value]": "Add label",
    "kubectl taint nodes [node] [key]=[value]:NoSchedule": "Add taint"
  },

  "Jira": {
    "C": "Create issue",
    "E": "Edit issue",
    "I": "Assign to me",
    "A": "Assign to",
    "M": "Move issue",
    "L": "Add label",
    "D": "Delete issue",
    "F": "Create subtask",
    "S": "Start progress",
    "O": "Stop progress",
    "P": "Change priority",
    "R": "Resolve issue",
    "Ctrl + Enter / Cmd + Return": "Submit form",
    "/": "Quick search",
    "Ctrl + F / Cmd + F": "Find on page",
    "Ctrl + K / Cmd + K": "Issue navigator",
    "Ctrl + Shift + A / Cmd + Shift + A": "Quick assign",
    "Ctrl + Shift + E / Cmd + Shift + E": "Bulk edit",
    "Ctrl + Shift + M / Cmd + Shift + M": "Bulk move",
    "Ctrl + Shift + D / Cmd + Shift + D": "Bulk delete",
    "Ctrl + Alt + S / Cmd + Option + S": "Advanced search",
    "Ctrl + Alt + C / Cmd + Option + C": "Create subtask",
    "Ctrl + Alt + R / Cmd + Option + R": "Report issue",
    "Shift + I": "Import issues",
    "Shift + E": "Export issues",
    "Shift + B": "Backlog view",
    "Shift + S": "Sprint view",
    "Shift + R": "Roadmap view",
    "Shift + D": "Dashboard view",
    "Shift + C": "Board configuration",
    "Shift + P": "Project settings"
  },

  "Trello": {
    "N": "Add new card",
    "E": "Edit card title",
    "Enter": "Save card",
    "Esc": "Cancel editing",
    "C": "Archive card",
    "D": "Set due date",
    "M": "Change members",
    "L": "Change label",
    "S": "Watch card",
    "F": "Quick filter",
    "Space": "Assign/unassign yourself",
    "1-9": "Add label (if configured)",
    "B": "Open board menu",
    "T": "Toggle labels",
    "W": "Toggle board background",
    "Q": "Filter cards assigned to you",
    "R": "Refresh board",
    "P": "Open power-ups",
    "?": "Show keyboard shortcuts",
    "Ctrl + Enter / Cmd + Return": "Add checklist item",
    "Ctrl + Shift + N / Cmd + Shift + N": "New board",
    "Ctrl + Shift + E / Cmd + Shift + E": "Edit board",
    "Ctrl + Arrow keys / Cmd + Arrow keys": "Move between lists",
    "Ctrl + Shift + Arrow keys / Cmd + Shift + Arrow keys": "Reorder lists",
    "Ctrl + F / Cmd + F": "Search cards",
    "Ctrl + / / Cmd + /": "Quick card navigation",
    "Ctrl + Alt + Enter / Cmd + Option + Return": "Complete checklist item",
    "Shift + Enter": "Add new line in description"
  },

  "Google Docs": {
    "Ctrl + C / Cmd + C": "Copy",
    "Ctrl + V / Cmd + V": "Paste",
    "Ctrl + X / Cmd + X": "Cut",
    "Ctrl + Z / Cmd + Z": "Undo",
    "Ctrl + Y / Cmd + Y": "Redo",
    "Ctrl + F / Cmd + F": "Find",
    "Ctrl + H / Cmd + H": "Find and replace",
    "Ctrl + B / Cmd + B": "Bold",
    "Ctrl + I / Cmd + I": "Italic",
    "Ctrl + U / Cmd + U": "Underline",
    "Ctrl + K / Cmd + K": "Insert link",
    "Ctrl + Shift + C / Cmd + Shift + C": "Copy formatting",
    "Ctrl + Shift + V / Cmd + Shift + V": "Paste formatting",
    "Ctrl + Enter / Cmd + Return": "Page break",
    "Ctrl + Shift + Enter / Cmd + Shift + Return": "Column break",
    "Ctrl + Alt + M / Cmd + Option + M": "Insert comment",
    "Ctrl + Alt + C / Cmd + Option + C": "Word count",
    "Ctrl + Shift + 1-6 / Cmd + Shift + 1-6": "Heading 1-6",
    "Ctrl + Alt + 1-5 / Cmd + Option + 1-5": "Apply list style",
    "Alt + Shift + 5 / Option + Shift + 5": "Strikethrough",
    "Alt + Shift + 7 / Option + Shift + 7": "Numbered list",
    "Alt + Shift + 8 / Option + Shift + 8": "Bulleted list",
    "Alt + Shift + 9 / Option + Shift + 9": "Block quote",
    "Ctrl + / / Cmd + /": "Show keyboard shortcuts",
    "Ctrl + Alt + F / Cmd + Option + F": "Insert footnote",
    "Ctrl + Shift + F / Cmd + Shift + F": "Full screen",
    "Ctrl + Shift + Y / Cmd + Shift + Y": "Dictionary",
    "Ctrl + Shift + K / Cmd + Shift + K": "Compact controls",
    "Alt + Up/Down / Option + Up/Down": "Move paragraph up/down",
    "Ctrl + Shift + Up/Down / Cmd + Shift + Up/Down": "Move to previous/next heading"
  },

  "Google Sheets": {
    "Ctrl + C / Cmd + C": "Copy",
    "Ctrl + V / Cmd + V": "Paste",
    "Ctrl + X / Cmd + X": "Cut",
    "Ctrl + Z / Cmd + Z": "Undo",
    "Ctrl + Y / Cmd + Y": "Redo",
    "Ctrl + F / Cmd + F": "Find",
    "Ctrl + H / Cmd + H": "Find and replace",
    "Ctrl + K / Cmd + K": "Insert link",
    "Ctrl + ; / Cmd + ;": "Insert current date",
    "Ctrl + Shift + : / Cmd + Shift + :": "Insert current time",
    "Ctrl + D / Cmd + D": "Fill down",
    "Ctrl + R / Cmd + R": "Fill right",
    "Ctrl + Enter / Cmd + Return": "Enter in same cell",
    "Ctrl + Alt + Enter / Cmd + Option + Return": "Array formula",
    "Ctrl + Shift + Enter / Cmd + Shift + Return": "Array formula",
    "F2": "Edit cell",
    "F4": "Toggle references",
    "Alt + Enter / Option + Return": "New line in cell",
    "Ctrl + Arrow keys / Cmd + Arrow keys": "Move to edge",
    "Shift + Arrow keys": "Extend selection",
    "Ctrl + Space / Cmd + Space": "Select column",
    "Shift + Space": "Select row",
    "Ctrl + A / Cmd + A": "Select all",
    "Ctrl + Shift + + / Cmd + Shift + +": "Insert rows/columns",
    "Ctrl + - / Cmd + -": "Delete rows/columns",
    "Ctrl + 1 / Cmd + 1": "Format cells",
    "Ctrl + Shift + 1 / Cmd + Shift + 1": "Number format",
    "Ctrl + Shift + 2 / Cmd + Shift + 2": "Time format",
    "Ctrl + Shift + 3 / Cmd + Shift + 3": "Date format",
    "Ctrl + Shift + 4 / Cmd + Shift + 4": "Currency format",
    "Ctrl + Shift + 5 / Cmd + Shift + 5": "Percent format",
    "Ctrl + Shift + 7 / Cmd + Shift + 7": "Borders",
    "Ctrl + B / Cmd + B": "Bold",
    "Ctrl + I / Cmd + I": "Italic",
    "Ctrl + U / Cmd + U": "Underline",
    "Alt + Shift + 1 / Option + Shift + 1": "Sum",
    "Alt + = / Option + =": "AutoSum"
  },

  "Google Slides": {
    "Ctrl + C / Cmd + C": "Copy",
    "Ctrl + V / Cmd + V": "Paste",
    "Ctrl + X / Cmd + X": "Cut",
    "Ctrl + Z / Cmd + Z": "Undo",
    "Ctrl + Y / Cmd + Y": "Redo",
    "Ctrl + F / Cmd + F": "Find",
    "Ctrl + K / Cmd + K": "Insert link",
    "Ctrl + D / Cmd + D": "Duplicate",
    "Ctrl + M / Cmd + M": "New slide",
    "Ctrl + Enter / Cmd + Return": "Present",
    "Ctrl + Shift + Enter / Cmd + Shift + Return": "Present from start",
    "Ctrl + Alt + F / Cmd + Option + F": "Full screen",
    "Ctrl + Alt + Shift + F / Cmd + Option + Shift + F": "Compact controls",
    "Ctrl + / / Cmd + /": "Show keyboard shortcuts",
    "Ctrl + B / Cmd + B": "Bold",
    "Ctrl + I / Cmd + I": "Italic",
    "Ctrl + U / Cmd + U": "Underline",
    "Ctrl + [ / Cmd + [": "Decrease font size",
    "Ctrl + ] / Cmd + ]": "Increase font size",
    "Ctrl + Shift + C / Cmd + Shift + C": "Copy formatting",
    "Ctrl + Shift + V / Cmd + Shift + V": "Paste formatting",
    "Ctrl + Shift + Up/Down / Cmd + Shift + Up/Down": "Move slide up/down",
    "Ctrl + Alt + M / Cmd + Option + M": "Insert comment",
    "Ctrl + Alt + Shift + B / Cmd + Option + Shift + B": "Hide/show speaker notes",
    "Ctrl + Alt + Shift + C / Cmd + Option + Shift + C": "Word count",
    "Ctrl + . / Cmd + .": "Advance to next slide",
    "Ctrl + , / Cmd + ,": "Go to previous slide",
    "Ctrl + Shift + . / Cmd + Shift + .": "Skip to next animation",
    "Ctrl + Shift + , / Cmd + Shift + ,": "Skip to previous animation"
  }
};

const ShortcutsPage: React.FC<ShortcutsPageProps> = ({ darkMode }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(false);

  // Filter shortcuts by search term (case insensitive)
  const filteredShortcuts = useMemo(() => {
    if (!searchTerm.trim()) return shortcuts;

    const filtered: typeof shortcuts = {};
    for (const [category, cmds] of Object.entries(shortcuts)) {
      const filteredCmds = Object.fromEntries(
        Object.entries(cmds).filter(([shortcut, desc]) =>
          shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
          desc.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      if (Object.keys(filteredCmds).length > 0) filtered[category] = filteredCmds;
    }
    return filtered;
  }, [searchTerm]);

  // Handle expand/collapse single category
  const toggleCategory = (category: string) => {
    if (expandAll) setExpandAll(false);
    setOpenCategory(openCategory === category ? null : category);
  };

  // Handle copy shortcut text to clipboard with feedback
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`Copied: ${text}`);
    } catch {
      alert('Failed to copy');
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} min-h-screen`}>
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Search bar */}
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="search"
            placeholder="Search shortcuts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-grow px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500
              ${darkMode ? 'bg-gray-800 border-gray-700 placeholder-gray-400 text-gray-100' : 'bg-gray-100 border-gray-300 placeholder-gray-600 text-gray-900'}`}
          />
          <button
            onClick={() => {
              if (expandAll) {
                setExpandAll(false);
                setOpenCategory(null);
              } else {
                setExpandAll(true);
                setOpenCategory(null);
              }
            }}
            className={`px-4 py-2 rounded font-semibold
              ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-400 hover:bg-blue-500 text-white'}`}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
              
        {/* Shortcut categories */}
        {Object.entries(filteredShortcuts).length === 0 ? (
          <p className="text-center text-gray-500">No shortcuts found for "{searchTerm}"</p>
        ) : (
          Object.entries(filteredShortcuts).map(([category, commands]) => {
            const isOpen = expandAll || openCategory === category;
            return (
              <section
                key={category}
                className={`border rounded-lg transition-colors duration-300
                  ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className={`w-full text-left px-5 py-3 font-semibold text-lg flex justify-between items-center
                    ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
                    focus:outline-none`}
                  aria-expanded={isOpen}
                  aria-controls={`${category}-content`}
                >
                  <span>{category}</span>
                  <span className="text-2xl select-none">{isOpen ? '−' : '+'}</span>
                </button>

                <ul
                  id={`${category}-content`}
                  className={`overflow-hidden transition-[max-height,padding] duration-500 ease-in-out
                    ${isOpen ? 'max-h-screen p-4' : 'max-h-0 p-0'}`}
                >
                  {Object.entries(commands).map(([shortcut, description]) => (
                    <li
                      key={shortcut}
                      className={`flex justify-between items-center border-b last:border-0 py-2
                        ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    >
                      <div>
                        <code
                          className={`font-mono rounded px-2 py-0.5
                          ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                        >
                          {shortcut}
                        </code>
                        <span className="ml-4">{description}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(shortcut)}
                        className={`ml-4 px-2 py-1 rounded text-sm font-medium
                          ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-400 hover:bg-blue-500 text-white'}`}
                        aria-label={`Copy shortcut ${shortcut} to clipboard`}
                      >
                        Copy
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </main>

    
    </div>
  );
};

export default ShortcutsPage;
