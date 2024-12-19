'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';

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

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const diffSeconds = Math.floor(diff / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''} ago`;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const assertResponse = async (response: Response, action: string) => {
    if (!response.ok) {
      const errorMessage = await response.text();
      toast.error(`Error ${action}: ${response.status} - ${errorMessage}`);
      throw new Error(`Error ${action}: ${response.status}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newNote.title.trim() === '' || newNote.content.trim() === '') {
      return;
    }
    setIsCreating(true);
    try {
      const response = await fetch(`${apiUrl}api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });
      await assertResponse(response, 'creating note');
      const data = await response.json();
      setNotes([...notes, data]);
      setNewNote({ title: '', content: '' });
      setShowForm(false);
    } finally {
      setIsCreating(false);
      fetchNotes();
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      const response = await fetch(`${apiUrl}api/notes/${id}`, {
        method: 'DELETE',
      });
      await assertResponse(response, 'deleting note');
      setNotes(notes.filter((note) => note.id !== id));
    } finally {
      setIsDeletingId(null);
    }
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}api/notes`);
      await assertResponse(response, 'fetching notes');
      const data = await response.json();
      setNotes(data);
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingAnimation = () => (
    <div className="relative w-8 h-8 rounded-full flex items-center justify-center">
      <div className="w-3 h-3 rounded-full bg-[#242E41] animate-ping"></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <div>
        <Toaster />
      </div>
      <nav className="w-full flex items-center justify-between py-4 px-8 bg-[#242E41]">
        <Image src="/logo.png" alt="Logo" width={60} height={60} />
        <div id="title" className="flex items-center mx-auto">
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
              Fully-Managed Serverless SQL on{' '}
              <span className="text-[#FF9900] font-bold">AWS</span>
            </p>
          </div>
        </div>
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
      </nav>
      <div className="flex flex-col items-center pt-10">
        <div className="mt-8 flex items-center justify-center">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md ml-4"
            onClick={() => setShowForm(true)}
            disabled={isCreating}
          >
            {isCreating ? <LoadingAnimation /> : 'Add Note'}
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
              {isCreating ? <LoadingAnimation /> : 'Add Note'}
            </button>
          </form>
        )}
        <div className="mt-8 flex flex-col items-center">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingAnimation />
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
                    <LoadingAnimation />
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
                  Created {formatRelativeTime(note.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-[#242E41] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <a
              href="https://awsfundamentals.com/newsletter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center font-semibold text-white hover:text-green-300 transition-colors"
            >
              <Image
                src="/envelope.png"
                alt="Newsletter"
                width={48}
                height={48}
                className="mr-2"
              />
              9,300+ AWS Builders Are Already Leveling Up – Are You Next?
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
