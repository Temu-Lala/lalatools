"use client"
// components/TextDiff.js
import { useState } from 'react';
import * as Diff from 'diff';

export default function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [summary, setSummary] = useState({ additions: 0, deletions: 0 });
  const [diffMode, setDiffMode] = useState('word'); // 'word' or 'line'

  const wordCount1 = text1.trim().split(/\s+/).filter(Boolean).length;
  const wordCount2 = text2.trim().split(/\s+/).filter(Boolean).length;

  const compareTexts = () => {
    setIsComparing(true);
    const diff = diffMode === 'word' ? Diff.diffWords(text1, text2) : Diff.diffLines(text1, text2);
    let additions = 0;
    let deletions = 0;

    const result = diff.map((part, index) => {
      if (part.added) {
        additions += diffMode === 'word' ? part.value.length : (part.count || 0);
        return { type: 'added', value: part.value, line: index + 1 };
      }
      if (part.removed) {
        deletions += diffMode === 'word' ? part.value.length : (part.count || 0);
        return { type: 'removed', value: part.value, line: index + 1 };
      }
      return { type: 'common', value: part.value, line: index + 1 };
    });

    setDiffResult(result);
    setSummary({ additions, deletions });
    setTimeout(() => setIsComparing(false), 500); // Simulate async for UX
  };

  const clearAll = () => {
    setText1('');
    setText2('');
    setDiffResult([]);
    setSummary({ additions: 0, deletions: 0 });
  };

  const renderDiff = () => {
    if (diffResult.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400">No comparison yet. Click "Compare" to see differences.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-2">Original Text</h4>
          <pre className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-x-auto border border-gray-200 dark:border-gray-700">
            {diffResult.map((part, index) => (
              part.type !== 'added' && (
                <div
                  key={index}
                  className={`flex ${part.type === 'removed' ? 'bg-red-100 dark:bg-red-900/50' : ''}`}
                >
                  <span className="w-8 text-right pr-2 text-gray-500 dark:text-gray-400">{part.line}</span>
                  <span
                    className={`flex-1 ${part.type === 'removed' ? 'text-red-600 dark:text-red-400 bg-red-200/50 dark:bg-red-800/30' : ''} tooltip`}
                    data-tooltip={part.type === 'removed' ? 'Removed text' : ''}
                  >
                    {part.type === 'removed' ? (
                      part.value.split(' ').map((word, i) => (
                        <span key={i} className="bg-red-300 dark:bg-red-700/50 px-1 mx-0.5 rounded">
                          {word}{' '}
                        </span>
                      ))
                    ) : (
                      part.value
                    )}
                  </span>
                </div>
              )
            ))}
          </pre>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Modified Text</h4>
          <pre className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-x-auto border border-gray-200 dark:border-gray-700">
            {diffResult.map((part, index) => (
              part.type !== 'removed' && (
                <div
                  key={index}
                  className={`flex ${part.type === 'added' ? 'bg-green-100 dark:bg-green-900/50' : ''}`}
                >
                  <span className="w-8 text-right pr-2 text-gray-500 dark:text-gray-400">{part.line}</span>
                  <span
                    className={`flex-1 ${part.type === 'added' ? 'text-green-600 dark:text-green-400 bg-green-200/50 dark:bg-green-800/30' : ''} tooltip`}
                    data-tooltip={part.type === 'added' ? 'Added text' : ''}
                  >
                    {part.type === 'added' ? (
                      part.value.split(' ').map((word, i) => (
                        <span key={i} className="bg-green-300 dark:bg-green-700/50 px-1 mx-0.5 rounded">
                          {word}{' '}
                        </span>
                      ))
                    ) : (
                      part.value
                    )}
                  </span>
                </div>
              )
            ))}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Text Diff Checker</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-2 text-lg font-medium">Original Text</label>
          <textarea
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Enter original text here..."
          />
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Characters: {text1.length}</p>
            <p>Words: {wordCount1}</p>
          </div>
        </div>
        <div>
          <label className="block mb-2 text-lg font-medium">Modified Text</label>
          <textarea
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Enter modified text here..."
          />
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Characters: {text2.length}</p>
            <p>Words: {wordCount2}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={compareTexts}
          disabled={isComparing || (!text1 && !text2)}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition"
        >
          {isComparing ? 'Comparing...' : 'Compare'}
        </button>
        <button
          onClick={clearAll}
          className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Clear All
        </button>
        <select
          value={diffMode}
          onChange={(e) => setDiffMode(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
        >
          <option value="word">Word Diff</option>
          <option value="line">Line Diff</option>
        </select>
      </div>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-4">Diff Result</h3>
        <div className="flex gap-4 mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-block w-4 h-4 bg-green-300 dark:bg-green-700/50 mr-2"></span>Added
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-block w-4 h-4 bg-red-300 dark:bg-red-700/50 mr-2"></span>Removed
          </span>
        </div>
        {renderDiff()}
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-4">Summary</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Additions: {summary.additions} {diffMode === 'word' ? 'characters' : 'lines'} | Deletions: {summary.deletions} {diffMode === 'word' ? 'characters' : 'lines'}
        </p>
      </div>
    </div>
  );
}