import asyncio
import json
import os
import gradium

API_KEY = os.environ.get("GRADIUM_API_KEY")

CANDIDATES = [
    {"id": "gregoire", "name": "Emmanuel Grégoire", "sample": "voice_samples/gregoire_sample.wav"},
    {"id": "chikirou", "name": "Sophia Chikirou", "sample": "voice_samples/chikirou_sample.wav"},
    {"id": "bournazel", "name": "Pierre-Yves Bournazel", "sample": "voice_samples/bournazel_sample.wav"},
    {"id": "knafo", "name": "Sarah Knafo", "sample": "voice_samples/knafo_sample.wav"},
    {"id": "mariani", "name": "Thierry Mariani", "sample": "voice_samples/mariani_sample.wav"},
]


async def clone_voice(client, candidate):
    print(f"Cloning {candidate['name']}...")
    try:
        voice = await gradium.voices.create(
            client,
            audio_file=candidate["sample"],
            name=candidate["name"],
            description=f"Candidat municipales Paris 2026 - {candidate['name']}",
        )
        print(f"  -> {candidate['name']}: {json.dumps(voice, indent=2)}")
        return {"id": candidate["id"], "name": candidate["name"], **voice}
    except Exception as e:
        print(f"  -> ERROR {candidate['name']}: {e}")
        return {"id": candidate["id"], "name": candidate["name"], "error": str(e)}


async def main():
    client = gradium.client.GradiumClient(api_key=API_KEY)
    results = []
    for c in CANDIDATES:
        result = await clone_voice(client, c)
        results.append(result)

    print("\n=== RESULTS ===")
    print(json.dumps(results, indent=2, ensure_ascii=False))

    with open("voice_clones.json", "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("\nSaved to voice_clones.json")


if __name__ == "__main__":
    asyncio.run(main())
