from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

from deep_translator import GoogleTranslator

app = FastAPI()

# ✅ CORS (IMPORTANT for frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🎥 Extract video ID
def get_video_id(url):
    if "v=" in url:
        return url.split("v=")[-1]
    return url

# 🟢 Test route
@app.get("/")
def home():
    return {"message": "API is working"}

# 🧠 Summarize endpoint
@app.post("/summarize")
def summarize_video(url: str, lang: str = "en"):
    try:
        video_id = get_video_id(url)

        transcript = YouTubeTranscriptApi().fetch(
            video_id,
            languages=['en', 'en-GB', 'hi']
        )

        # 🧾 Extract text + timestamps
        text = " ".join([t.text for t in transcript])

        timestamps = [
            {
                "time": round(t.start, 2),
                "text": t.text
            }
            for t in transcript[:10]
        ]

        # 🧠 Summarization
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary_sentences = summarizer(parser.document, 5)

        summary = " ".join([str(sentence) for sentence in summary_sentences])

        # 🌍 REAL TRANSLATION (FIXED)
        if lang == "hi":
            summary = GoogleTranslator(source='auto', target='hi').translate(summary)
        elif lang == "ta":
            summary = GoogleTranslator(source='auto', target='ta').translate(summary)

        return {
            "summary": summary,
            "timestamps": timestamps,
            "word_count": len(summary.split())
        }

    except Exception as e:
        return {"error": str(e)}