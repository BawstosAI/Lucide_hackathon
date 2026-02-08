export interface Candidate {
  id: string;
  name: string;
  lastName: string;
  party: string;
  partyShort: string;
  color: string;
  initials: string;
  photo: string;
  themes: string[];
}

export const candidates: Candidate[] = [
  {
    id: 'gregoire',
    name: 'Emmanuel Grégoire',
    lastName: 'Grégoire',
    party: 'Nouveau Front Populaire',
    partyShort: 'NFP',
    color: '#E4003B',
    initials: 'EG',
    photo: '/candidates/gregoire.jpg',
    themes: ['Climat', 'Logement', 'Services publics'],
  },
  {
    id: 'dati',
    name: 'Rachida Dati',
    lastName: 'Dati',
    party: 'Les Républicains',
    partyShort: 'LR',
    color: '#0066CC',
    initials: 'RD',
    photo: '/candidates/dati.jpg',
    themes: ['Sécurité', 'Culture', 'Propreté'],
  },
  {
    id: 'bournazel',
    name: 'Pierre-Yves Bournazel',
    lastName: 'Bournazel',
    party: 'Horizons / Ensemble',
    partyShort: 'HOR',
    color: '#FFD600',
    initials: 'PB',
    photo: '/candidates/bournazel.jpg',
    themes: ['Propreté', 'Finances', 'Vie de quartier'],
  },
  {
    id: 'chikirou',
    name: 'Sophia Chikirou',
    lastName: 'Chikirou',
    party: 'La France Insoumise',
    partyShort: 'LFI',
    color: '#CC2443',
    initials: 'SC',
    photo: '/candidates/chikirou.jpg',
    themes: ['Logement', 'Justice sociale', 'Services publics'],
  },
  {
    id: 'knafo',
    name: 'Sarah Knafo',
    lastName: 'Knafo',
    party: 'Reconquête',
    partyShort: 'REC',
    color: '#0D2240',
    initials: 'SK',
    photo: '/candidates/knafo.jpg',
    themes: ['Sécurité', 'Immigration', 'Identité'],
  },
  {
    id: 'mariani',
    name: 'Thierry Mariani',
    lastName: 'Mariani',
    party: 'Rassemblement National',
    partyShort: 'RN',
    color: '#1A2B4A',
    initials: 'TM',
    photo: '/candidates/mariani.jpg',
    themes: ['Sécurité', 'Immigration', "Pouvoir d'achat"],
  },
];

export function getCandidateById(id: string): Candidate | undefined {
  return candidates.find((c) => c.id === id);
}
