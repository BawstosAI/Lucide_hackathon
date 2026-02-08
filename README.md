# Municipales Paris 2026 — Voice AI Assistant

An interactive voice assistant that helps citizens explore the 2026 Paris municipal elections. Ask questions about candidates and their platforms, or debate directly with a candidate's cloned voice.

Built at the **Lucide Hackathon**.

## How it works

Users choose between two modes:

- **S'informer** — Ask questions about the 6 candidates, their programs, and the election. The agent answers using public sources.
- **Débattre** — Argue your ideas against a simulated candidate who speaks with a cloned voice.

## Architecture

| Layer | Technology | Role |
|-------|-----------|------|
| **LLM** | **OpenAI** GPT-4.1 Mini | Reasoning, conversation, candidate knowledge |
| **Speech (STT + TTS)** | **Gradium** | French speech-to-text and text-to-speech, including cloned candidate voices |
| **Voice infrastructure** | LiveKit | Real-time audio transport, agent orchestration |
| **Frontend** | Next.js 15 / React 19 | Web UI with candidate dashboard and live transcript |

### Role of OpenAI

OpenAI provides the language model (GPT-4.1 Mini) that powers the agent's reasoning. It understands user questions, retrieves relevant candidate information from its context, and generates informed responses in French.

### Role of Gradium

Gradium handles all speech processing:

- **Speech-to-Text** — Transcribes the user's spoken French into text for the LLM.
- **Text-to-Speech** — Converts the agent's responses back to natural French speech.
- **Voice cloning** — Each candidate has a cloned voice built from real speech samples. In debate mode, the agent speaks as the selected candidate.

## Project structure

```
agent-starter-python/   # Python voice agent (LiveKit + OpenAI + Gradium)
agent-starter-react/    # Next.js frontend
config.yaml             # Agent configuration (model, voices, STT settings)
voice_clones.json       # Cloned voice IDs per candidate
clone_voices.py         # Script to create voice clones via Gradium API
```

## Setup

### Agent

```bash
cd agent-starter-python
uv sync
cp .env.example .env.local  # fill in LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
uv run python src/agent.py download-files
uv run python src/agent.py dev
```

### Frontend

```bash
cd agent-starter-react
pnpm install
pnpm dev
```

## License

MIT
