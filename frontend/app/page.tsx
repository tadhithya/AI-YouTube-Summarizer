"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [timestamps, setTimestamps] = useState<any[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("en"); // 🌍 LANGUAGE

  const sampleVideo = "https://www.youtube.com/watch?v=3JZ_D3ELwOQ";

  // 💾 Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") setDark(false);
  }, []);

  const handleSummarize = async (customUrl?: string) => {
    const finalUrl = customUrl || url;

    if (!finalUrl.includes("youtube.com")) {
      setError("⚠️ Enter valid YouTube URL");
      return;
    }

    const id = new URL(finalUrl).searchParams.get("v") || "";
    setVideoId(id);

    setLoading(true);
    setSummary("");
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/summarize",
        null,
        { params: { url: finalUrl, lang } } // 🌍 PASS LANGUAGE
      );

      if (res.data.error) {
        setError(res.data.error);
      } else {
        setSummary(res.data.summary);
        setTimestamps(res.data.timestamps || []);
        setWordCount(res.data.word_count || 0);
      }
    } catch {
      setError("❌ Backend connection failed");
    }

    setLoading(false);
  };

  const downloadSummary = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "summary.txt";
    link.click();
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
  };

  return (
    <div
      className={`min-h-screen ${
        dark
          ? "bg-gradient-to-br from-gray-950 to-black text-white"
          : "bg-gray-100 text-black"
      }`}
    >

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-10 h-10 rounded-full" />
          <h1 className="text-xl font-bold">YT Insight AI</h1>
        </div>

        <div className="flex gap-4 items-center text-sm">

          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>

          {/* 🌍 LANGUAGE SELECT */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-gray-800 text-white px-2 py-1 rounded"
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="ta">TA</option>
          </select>

          {/* 🌙 THEME */}
          <button
            onClick={() => {
              const newTheme = !dark;
              setDark(newTheme);
              localStorage.setItem("theme", newTheme ? "dark" : "light");
            }}
            className="border px-3 py-1 rounded"
          >
            {dark ? "🌙" : "☀️"}
          </button>
        </div>
      </nav>

      {/* HOME */}
      <div id="home" className="flex flex-col items-center px-6 py-10 text-center">
        <h1 className="text-4xl font-bold mb-2">
          🎥 YouTube AI Summarizer
        </h1>

        <p className="text-gray-400 mb-6">
          Turn long videos into quick insights 🚀
        </p>

        <button
          onClick={() => {
            setUrl(sampleVideo);
            handleSummarize(sampleVideo);
          }}
          className="bg-purple-600 px-5 py-2 rounded-lg mb-6"
        >
          ▶ Try Sample Video
        </button>

        <div className="w-full max-w-xl flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Paste YouTube URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`flex-1 p-3 rounded-lg ${
              dark
                ? "bg-gray-800 text-white"
                : "bg-white text-black border"
            }`}
          />

          <button
            onClick={() => handleSummarize()}
            className="bg-blue-600 px-6 py-3 rounded-lg text-white"
          >
            Summarize
          </button>
        </div>

        {error && <p className="text-red-400 mt-3">{error}</p>}
      </div>

      {/* VIDEO */}
      {videoId && (
        <div className="max-w-3xl mx-auto px-6">
          <iframe
            className="w-full h-64 rounded-xl"
            src={`https://www.youtube.com/embed/${videoId}`}
          />
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-center mt-6 text-yellow-400">
          ⏳ Generating summary...
        </p>
      )}

      {/* SUMMARY */}
      {summary && (
        <div className={`max-w-3xl mx-auto mt-6 p-6 rounded-xl border ${
          dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-300"
        }`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Summary</h2>

            <div className="flex gap-2">
              <button onClick={copySummary} className="bg-blue-500 px-3 py-1 rounded text-white">
                Copy
              </button>

              <button onClick={downloadSummary} className="bg-green-600 px-3 py-1 rounded text-white">
                Download
              </button>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-line">{summary}</p>

          <p className="text-sm mt-2">📊 {wordCount} words</p>
        </div>
      )}

      {/* TIMESTAMPS */}
      {timestamps.length > 0 && (
        <div className={`max-w-3xl mx-auto mt-6 p-6 rounded-xl border ${
          dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-300"
        }`}>
          <h3 className="text-lg font-semibold mb-3">⏱️ Key Moments</h3>

          {timestamps.map((t, i) => {
            const link = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(t.time)}s`;

            return (
              <p key={i}>
                <a href={link} target="_blank" className="text-blue-500 underline">
                  {Math.floor(t.time)}s
                </a>{" "}
                — {t.text}
              </p>
            );
          })}
        </div>
      )}

      {/* FEATURES */}
      <div id="features" className="max-w-4xl mx-auto mt-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-8">🚀 Features</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 border rounded-xl">🎥 Instant Summaries</div>
          <div className="p-5 border rounded-xl">⏱️ Timestamps</div>
          <div className="p-5 border rounded-xl">📄 Download</div>
          <div className="p-5 border rounded-xl">🌍 Multi-language</div>
        </div>
      </div>

      {/* ABOUT */}
      <div id="about" className="max-w-3xl mx-auto mt-16 px-6 text-center mb-10">
        <h2 className="text-2xl font-bold mb-4">💼 About</h2>
        <p>YT Insight AI helps users quickly understand YouTube videos using AI.</p>
      </div>
    </div>
  );
}