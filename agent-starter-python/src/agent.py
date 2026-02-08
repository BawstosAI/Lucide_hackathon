import logging
from pathlib import Path

import yaml
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    room_io,
)
from livekit.plugins import gradium, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv()

CONFIG_PATH = Path(__file__).resolve().parent.parent.parent / "config.yaml"
with open(CONFIG_PATH) as f:
    config = yaml.safe_load(f)


PARIS_2026_CONTEXT = """
ELECTIONS MUNICIPALES PARIS 2026 - 15 et 22 mars 2026
Nouveau système: deux bulletins séparés (conseillers d'arrondissement + conseillers de Paris).
Anne Hidalgo (maire sortante PS) ne se représente pas.

=== CANDIDATS ===

1. RACHIDA DATI (LR / Modem / UDI)
Sécurité: 5000 policiers municipaux armés, présence 24h/24. 8000 caméras autour des écoles. Fermer le Champ-de-Mars la nuit. Police montée dans les parcs. Centre de surveillance par arrondissement. Patrouilles civiles dans les collèges.
Logement: Priorité familles et travailleurs pour le logement social. 100M euros/an pour rénover le parc social. Fin des préemptions municipales.
Propreté: Modernisation avec IA pour identifier les zones prioritaires. Brigade de propreté rapide. Lutte anti-rats (glace sèche, pièges connectés).
Mobilité: Plan mobilité global. Accès prioritaire soignants. Zones piétonnes élargies. Vélib' régional. Parking résidentiel abordable. Métro accessible (ligne 6). Parkings-relais en périphérie. Réaménagement rue de Rivoli.
Santé: Valoriser les métiers petite enfance. Plus de places en crèche. Lutte contre l'isolement des seniors.
Budget: Réduire les dépenses de fonctionnement. Arrêter les projets d'investissement non bénéfiques. Réduire les postes administratifs. Taxe touriste contre le surtourisme.

2. EMMANUEL GREGOIRE (PS / PCF / Ecologistes - Union de la gauche hors LFI)
Sécurité: Recruter 1000 agents supplémentaires (total ~5000). Présence 24h/24. Améliorer éclairage public pour les femmes. Boutons d'alerte aux arrêts de bus. 500 caméras tactiques. Unités spécialisées: anti-incivilités, mobile, nocturne, montée. Priorité violences faites aux femmes. Créer des "lieux sûrs".
Logement: Interdire les locations touristiques permanentes. 60000 logements sociaux/intermédiaires. Rénovation massive du parc privé. Utiliser les logements vacants.
Propreté: Maintenir le service public (pas de privatisation). Moderniser la flotte. Amendes contre les incivilités.
Mobilité: Assistance mobilité personnes handicapées. Métro 24h/24. Vélo-partage métropolitain. Réseau de voies bus rapides.
Budget: Pas de propositions financières détaillées publiées.

3. SOPHIA CHIKIROU (La France Insoumise / Nouveau Paris Populaire) - ~12% dans les sondages
Sécurité: Charte municipale anti-discrimination. Centres juridiques mobiles. Maisons de quartier (police + médiateurs + éducateurs + travailleurs sociaux). 3500 agents. Refus d'armer la police municipale. Doubler les éducateurs spécialisés d'ici 2029.
Logement: "Brigade du droit au logement" contre les logements vacants. Convertir les meublés touristiques. Moratoire sur les nouveaux meublés touristiques. Gel des loyers sociaux. Plan de rénovation énergétique. Etat d'urgence du logement.
Propreté: Services municipaux de propreté par quartier. Gestion directe par les conseils locaux.
Mobilité: Restreindre les horaires de livraison. Feux intelligents.
Santé: Centres de santé municipaux pluridisciplinaires (1 par arrondissement d'ici 2032). Unités mobiles de prévention. 5 cliniques de garde soir/weekend. Bus santé mobile. Psychologues municipaux. "Chèque psychologie". Visites pédiatriques à domicile.
Budget: Pas de propositions financières détaillées.

4. PIERRE-YVES BOURNAZEL (Horizons / Renaissance) - 48 ans, élu du 18e
Sécurité: Tripler la police municipale de 2200 à 6000 agents armés. Police 24h/24 avec hotline. Drones de surveillance. Vidéosurveillance algorithmique. Caméras devant les écoles. Unité canine anti-trafic. Police dans les parties communes HLM.
Logement: Récupérer 60000 logements (incitations propriétaires). 15000 logements sociaux/intermédiaires par an. Location touristique max 30 nuits/an. 3 quartiers étudiants (~7000 logements d'ici 2030). Quadrupler le rythme de rénovation. Fusionner 3 bailleurs publics (540M d'économies). Priorité travailleurs essentiels.
Propreté: Déléguer le nettoyage au privé. IA pour optimiser la collecte. 130M euros en équipement (poubelles anti-rats, autolaveuses).
Mobilité: Bus digitalisés aux carrefours. Métro accessible. Pénaliser les retards de chantier. Immatriculation des fatbikes.
Budget: Réduire les dépenses des élus. Supprimer les voitures de fonction. Réduire de 50% les adjoints et le personnel.

5. SARAH KNAFO (Reconquête) - 32 ans, eurodéputée
Sécurité: Doubler la police municipale à 8000 agents armés. Politique systématique d'arrestation/amende. IA pour vidéosurveillance. Police montée. Unité canine. Présence permanente zones sensibles. Lampadaires intelligents anti-agression.
Logement: Supprimer l'encadrement des loyers. Moratoire sur le logement social. Vendre ~4000 logements sociaux/an. Diviser par 2 les taxes foncières. Réduire de 10% les droits de mutation. Accélerer les permis de construire.
Propreté: Privatiser la collecte des déchets ménagers.
Mobilité: Rouvrir les voies sur berges aux voitures. 80 km/h sur le périphérique. Feux intelligents IA. Tarif unique parking. Parking gratuit midi-2h. 15000 places de parking supplémentaires. Réaménager rue de Rivoli. Fret fluvial.
Santé: Parking gratuit 1h pour infirmières à domicile. Doubler le soutien au dépistage cancer. Financer la recherche (cancer, Alzheimer). Rénover les EHPAD municipaux.
Budget: Plan d'économies de 10 milliards sur le mandat. Diviser par 2 les taxes foncières. Réduire de 50% les effectifs de la mairie en 10 ans. Privatiser la collecte des déchets. Réduire la dette de 50%.

6. THIERRY MARIANI (Rassemblement National) - Eurodéputé
Sécurité: Augmenter la police municipale avec patrouilles 24h/24. Unités spécialisées: anti-squat, anti-drogue, camps illégaux, transports, brigade rapide. Tolérance zéro. Doubler les effectifs et armer la police.
Logement: Baisser les taxes foncières. Logement social prioritaire pour résidents/familles/travailleurs. Logement intergénérationnel.
Propreté: Réaffecter le personnel municipal à la propreté. Externaliser la collecte des déchets.
Mobilité: Fluidifier les livraisons commerces. Supprimer le stationnement par zones. Couverture partielle du périphérique (ceinture verte). Faire respecter le code de la route.
Budget: Stopper la hausse des taxes foncières. Plan d'économies. Réduire la dette dès le début du mandat.

7. BLANDINE CHAUVEL (NPA) et MARIELLE SAULNIER (Lutte Ouvrière) - Peu de propositions détaillées publiées.
"""


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=f"""Tu es un assistant vocal expert des élections municipales de Paris 2026. Tu parles français.
Tu aides les citoyens parisiens à comprendre les propositions des différents candidats de manière neutre et factuelle.

Règles:
- Tu restes strictement neutre et objectif. Tu ne prends jamais parti pour un candidat.
- Tu cites les propositions précises des candidats quand on te pose une question sur un thème.
- Si on te demande de comparer, tu présentes les positions de chaque candidat côte à côte.
- Tu peux expliquer le contexte (nouveau système électoral, dates, etc.).
- Tes réponses sont concises et adaptées à la voix: pas de listes longues, pas de formatage complexe, pas de symboles.
- Si tu ne connais pas une information, dis-le honnêtement.
- Les dates du scrutin sont les 15 et 22 mars 2026.

Voici les données sur les candidats et leurs propositions:

{PARIS_2026_CONTEXT}""",
        )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name=config["agent_name"])
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using OpenAI, Cartesia, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=gradium.STT(sample_rate=config["stt"]["sample_rate"]),
        llm=inference.LLM(model=config["llm"]["model"]),
        tts=gradium.TTS(voice_id=config["tts"]["voice_id"]),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=config["pipeline"]["preemptive_generation"],
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
