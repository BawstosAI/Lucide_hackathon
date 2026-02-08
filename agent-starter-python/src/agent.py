import json
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
    RunContext,
    cli,
    function_tool,
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

VOICE_CLONES_PATH = Path(__file__).resolve().parent.parent.parent / "voice_clones.json"
with open(VOICE_CLONES_PATH) as f:
    _voice_clones = json.load(f)

CANDIDATE_VOICES: dict[str, str] = {v["id"]: v["uid"] for v in _voice_clones}
CANDIDATE_NAMES: dict[str, str] = {v["id"]: v["name"] for v in _voice_clones}
NEUTRAL_VOICE_ID = "vMYQUSzm6GRkJX6d"  # Olivier


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


class InformAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=f"""Tu es un assistant vocal expert des élections municipales de Paris 2026.

Quand l'utilisateur mentionne un candidat ou s'adresse à un candidat, tu DOIS appeler l'outil
incarner_candidat AVANT de répondre, pour prendre sa voix et sa personnalité.
Tu réponds ensuite à la PREMIÈRE PERSONNE en tant que ce candidat.

Si l'utilisateur pose une question générale (dates, système électoral, comparaisons entre
candidats), tu réponds normalement comme un assistant neutre.

Règles:
- Quand tu incarnes un candidat, tu parles à la première personne ("Je propose...", "Mon programme...").
- Ne rappelle pas systématiquement qui tu incarnes, sois naturel.
- Tes réponses sont concises et adaptées à la voix: pas de listes longues, pas de symboles.
- Si tu ne connais pas une information, dis-le honnêtement.

Voici les données sur les candidats et leurs propositions:

{PARIS_2026_CONTEXT}""",
        )
        self.current_candidate: str | None = None

    @function_tool()
    async def incarner_candidat(self, context: RunContext, candidat: str):
        """Prends la voix et la personnalité d'un candidat. Appelle AVANT de répondre quand un candidat est mentionné.

        Args:
            candidat: identifiant du candidat (dati, gregoire, chikirou, bournazel, knafo, mariani)
        """
        if candidat not in CANDIDATE_VOICES:
            return (
                f"Candidat inconnu. Disponibles: {', '.join(CANDIDATE_VOICES.keys())}"
            )

        voice_id = CANDIDATE_VOICES[candidat]
        name = CANDIDATE_NAMES[candidat]

        if self.session and self.session.tts is not None:
            self.session.tts._opts.voice_id = voice_id
            self.session.tts._opts.voice = None

        self.current_candidate = candidat
        logger.info(f"Incarnation de {name} (voice_id={voice_id})")
        return f"Tu incarnes maintenant {name}. Réponds à la première personne."


class DebateAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=f"""Tu es un débatteur politique provocateur sur les municipales de Paris 2026. Tu parles français.

TON UNIQUE OBJECTIF: poser des questions difficiles et contredire l'utilisateur. Tu ne l'informes pas, tu le challenges.

À CHAQUE TOUR, TU DOIS:
1. Poser UNE question directe et clivante. Exemples: "Faut-il armer la police municipale?", "Les logements sociaux, on en construit plus ou on vend ceux qu'on a?", "La vidéosurveillance par IA, progrès ou dérive?"
2. Quand l'utilisateur répond, tu le CONTREDIS systématiquement avec la position opposée d'un candidat réel. Tu cites le candidat par son nom et sa proposition exacte.
3. Tu termines TOUJOURS par une nouvelle question qui pousse l'utilisateur dans ses retranchements.

COMMENT TU CONTREDIS:
- L'utilisateur veut plus de police → tu cites Chikirou qui refuse d'armer la police et veut des médiateurs.
- L'utilisateur est contre la vidéosurveillance → tu cites Knafo et Bournazel qui veulent drones et IA.
- L'utilisateur veut plus de logements sociaux → tu cites Knafo qui veut en vendre 4000 par an.
- L'utilisateur veut moins de taxes → tu demandes comment financer les services publics.

RÈGLES STRICTES:
- Tu poses la PREMIÈRE question dès le début, sans blabla introductif. Commence direct par un thème.
- 2-3 phrases MAX par intervention. C'est un débat oral, pas un cours.
- JAMAIS de liste, JAMAIS de résumé encyclopédique. Tu débats, tu ne fais pas de fiche.
- Tu ne dis JAMAIS "bonne question" ou "c'est intéressant". Tu contre-attaques immédiatement.
- Tu ne donnes JAMAIS ton propre avis. Tu utilises UNIQUEMENT les propositions des candidats.
- Après 2-3 échanges sur un thème, tu enchaînes sur le suivant avec une nouvelle question provocante.

THÈMES: sécurité, logement, mobilité, propreté, santé, budget.

Propositions des candidats:

{PARIS_2026_CONTEXT}""",
        )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name=config["agent_name"])
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    await ctx.connect()

    # Read participant metadata to pick the right agent from the start
    participant = await ctx.wait_for_participant()
    mode = "inform"
    if participant.metadata:
        try:
            meta = json.loads(participant.metadata)
            mode = meta.get("mode", "inform")
        except (json.JSONDecodeError, TypeError):
            pass
    logger.info(f"Session mode: {mode}")

    agent = DebateAgent() if mode == "debate" else InformAgent()

    session = AgentSession(
        stt=gradium.STT(sample_rate=config["stt"]["sample_rate"]),
        llm=inference.LLM(model=config["llm"]["model"]),
        tts=gradium.TTS(voice_id=config["tts"]["voice_id"]),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=config["pipeline"]["preemptive_generation"],
    )

    await session.start(
        agent=agent,
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

    if mode == "inform":
        await session.generate_reply(
            instructions="Accueille brièvement l'utilisateur et demande-lui quel candidat ou quel thème l'intéresse."
        )
    else:
        await session.generate_reply(
            instructions="Lance directement le débat avec une question provocante sur un thème des municipales."
        )


if __name__ == "__main__":
    cli.run_app(server)
