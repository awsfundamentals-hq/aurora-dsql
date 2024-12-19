'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await fetch(`${apiUrl}/api/notes`);
      const data = await response.json();
      setNotes(data);
    };
    fetchNotes();
  }, []);

  return (
    <div className="flex flex-col items-center pt-20">
      <Image
        src="/aurora-logo.jpeg"
        alt="Aurora Logo"
        width={200}
        height={200}
        className="rounded-full shadow-md"
      />
      <h1 className="text-4xl font-bold mt-4 text-[#4B6AED]">Aurora DSQL</h1>
      <p className="text-xl mt-4 font-semibold text-gray-600">
        Fully-Managed Serverless SQL on AWS
      </p>
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
      </div>
      <div className="mt-8 flex flex-col items-center">
        {notes.length === 0 ? (
          <p>No notes created yet</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-white shadow-md rounded-md p-4 mb-4"
            >
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
  );
}
