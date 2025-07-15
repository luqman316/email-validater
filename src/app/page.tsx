"use client";

import { Download, Inbox, Loader2 } from "lucide-react";
import { ChangeEvent, useState } from "react";

export default function EmailValidatorUI() {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  // const [results, setResults] = useState({
  //   total: Number,
  //   valid: Number,
  //   invalid: Number,
  //   duplicates: Number,
  // });
  // const [results, setResults] = useState<{
  //   total: number;
  //   valid: number;
  //   invalid: number;
  //   duplicates: number;
  // } | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  // const handleUpload = async () => {
  //   if (!file) return alert("Please select a CSV file");
  //   setIsValidating(true);

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   const res = await fetch("/api/upload", {
  //     method: "POST",
  //     body: formData,
  //   });

  //   if (!res.ok) {
  //     alert("Failed to process file");
  //     setIsValidating(false);
  //     return;
  //   }

  //   const blob = await res.blob();
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "processed_emails.csv";
  //   document.body.appendChild(a);
  //   a.click();
  //   a.remove();
  //   URL.revokeObjectURL(url);

  //   setResults({
  //     total: 300,
  //     valid: 250,
  //     invalid: 34,
  //     duplicates: 16,
  //   });

  //   setIsValidating(false);
  // };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file");
    setIsValidating(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Failed to process file");
      setIsValidating(false);
      return;
    }

    // const total = parseInt(res.headers.get("X-Result-Total") || "0");
    // const valid = parseInt(res.headers.get("X-Result-Valid") || "0");
    // const invalid = parseInt(res.headers.get("X-Result-Invalid") || "0");
    // const duplicates = parseInt(res.headers.get("X-Result-Duplicates") || "0");

    // setResults({ total, valid, invalid, duplicates });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processed_emails.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setIsValidating(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Verify Emails. Build Trust.
      </h1>
      <p className="text-gray-500 mb-6">
        Bulk validate email addresses with precision and speed.
      </p>

      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md border">
        <div className="border-dashed border-2 border-gray-300 rounded-xl p-6 text-center mb-4">
          <Inbox className="mx-auto text-gray-400 w-10 h-10 mb-2" />
          <p className="text-sm text-gray-500">Drag and drop a file here, or</p>
          <label className="cursor-pointer inline-block mt-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
              Choose File
            </span>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
          </label>
          {file && (
            <p className="text-xs text-gray-600 mt-2">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded shadow hover:opacity-90 transition"
            onClick={handleUpload}
            disabled={isValidating}
          >
            {isValidating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" /> Validating...
              </div>
            ) : (
              "Validate"
            )}
          </button>

          <button
            className="bg-gray-100 text-gray-800 px-5 py-2 rounded shadow hover:bg-gray-200 transition flex items-center gap-2"
            disabled
          >
            <Download className="h-4 w-4" /> Download Results
          </button>
        </div>

        {isValidating && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Validating...
          </p>
        )}
        {/* {!isValidating && results && (
          <div className="mt-6 grid grid-cols-4 gap-4 text-center text-sm font-semibold text-gray-700">
            <div>
              <p className="text-xl font-bold">{results.total}</p>
              <p>Total</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">
                {results.valid}
              </p>
              <p>Valid</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">
                {results.invalid}
              </p>
              <p>Invalid</p>
            </div>
            <div>
              <p className="text-xl font-bold text-yellow-500">
                {results.duplicates}
              </p>
              <p>Duplicates</p>
            </div>
          </div>
        )} */}
      </div>

      <footer className="text-xs text-gray-400 mt-10">
        Privacy Policy · by{" "}
        <span className="font-semibold text-gray-500">Luqman</span>
      </footer>
    </div>
  );
}
