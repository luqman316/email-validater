'use client';

import { useState, ChangeEvent } from 'react';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a CSV file');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      alert('Failed to process file');
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processed_emails.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto my-10 flex flex-col gap-2 justify-center items-center">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="border p-3 text-center"
      />
      <button
        className="border bg-pink-300 p-2"
        onClick={handleUpload}
      >
        Submit & Download
      </button>
    </div>
  );
}
