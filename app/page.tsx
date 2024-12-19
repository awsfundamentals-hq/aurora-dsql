'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const clusterIdentifier = process.env.NEXT_PUBLIC_CLUSTER_IDENTIFIER!;
const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}api/notes`);
      const data = await response.json();
      setNotes(data);
      setIsLoading(false);
    };
    fetchNotes();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newNote.title.trim() === '' || newNote.content.trim() === '') {
      return;
    }
    setIsCreating(true);
    const response = await fetch(`${apiUrl}api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNote),
    });
    const data = await response.json();
    setNotes([...notes, data]);
    setNewNote({ title: '', content: '' });
    setShowForm(false);
    setIsCreating(false);
    fetchNotes();
  };

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    await fetch(`${apiUrl}api/notes/${id}`, {
      method: 'DELETE',
    });
    setNotes(notes.filter((note) => note.id !== id));
    setIsDeletingId(null);
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    const response = await fetch(`${apiUrl}api/notes`);
    const data = await response.json();
    setNotes(data);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <nav className="w-full flex items-center justify-between py-4 px-8 bg-[#242E41]">
        <Image src="/logo.png" alt="Logo" width={60} height={60} />
        <div className="flex items-center">
          <Image
            src="/aurora-logo.jpeg"
            alt="Aurora Logo"
            width={60}
            height={60}
            className="mx-2 rounded-full shadow-md"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Aurora DSQL</h1>
            <p className="text-sm font-semibold text-gray-300">
              Fully-Managed Serverless SQL on AWS
            </p>
          </div>
        </div>
      </nav>
      <div className="flex flex-col items-center pt-20">
        <div className="mt-8 flex items-center justify-center">
          <a
            href={`https://us-east-1.console.aws.amazon.com/dsql/clusters/${clusterIdentifier}/home?region=us-east-1`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#4B6AED] text-white px-4 py-2 rounded-md shadow-md flex items-center"
          >
            <Image
              src="/bookmark.svg"
              alt="Bookmark"
              width={20}
              height={20}
              className="mr-2"
            />
            Open Aurora Console
          </a>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md ml-4"
            onClick={() => setShowForm(true)}
            disabled={isCreating}
          >
            {isCreating ? (
              <div className="w-4 h-4 border-2 border-white rounded-full animate-spin"></div>
            ) : (
              '+'
            )}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              placeholder="Title"
              value={newNote.title}
              onChange={(e) =>
                setNewNote({ ...newNote, title: e.target.value })
              }
              className="border border-gray-300 rounded-md px-4 py-2 mr-2"
            />
            <input
              type="text"
              placeholder="Content"
              value={newNote.content}
              onChange={(e) =>
                setNewNote({ ...newNote, content: e.target.value })
              }
              className="border border-gray-300 rounded-md px-4 py-2 mr-2"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md"
              disabled={isCreating}
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white rounded-full animate-spin"></div>
              ) : (
                'Add Note'
              )}
            </button>
          </form>
        )}
        <div className="mt-8 flex flex-col items-center">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-400 rounded-full animate-spin"></div>
            </div>
          ) : notes.length === 0 ? (
            <p>No notes created yet</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white shadow-md rounded-md p-4 mb-4 relative"
              >
                <button
                  className="absolute top-2 right-2"
                  onClick={() => handleDelete(note.id)}
                  disabled={isDeletingId === note.id}
                >
                  {isDeletingId === note.id ? (
                    <div className="w-4 h-4 border-2 border-gray-400 rounded-full animate-spin"></div>
                  ) : (
                    <Image
                      src="/trash.svg"
                      alt="Delete"
                      width={20}
                      height={20}
                    />
                  )}
                </button>
                <h2 className="text-xl font-bold">{note.title}</h2>
                <p className="text-gray-600">{note.content}</p>
                <p className="text-gray-500 text-sm">
                  Created at: {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
