import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type PadelLevel = "Débutant" | "P25" | "P50" | "P100" | "P250" | "P500" | "P1000+";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  birthDate: string;
  level: PadelLevel;
  role: "admin" | "user";
  createdAt: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: RegisterData) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (data: Partial<Pick<User, "firstName" | "lastName" | "email" | "address" | "birthDate" | "level" | "credits">>) => { success: boolean; error?: string };
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  birthDate: string;
  level: PadelLevel;
}

const ADMIN: User = {
  id: "admin-001",
  firstName: "Admin",
  lastName: "Garden",
  email: "admin@gardenpadel.fr",
  address: "Six-Fours-Les-Plages, Var (83)",
  birthDate: "1989-01-01",
  level: "P500",
  role: "admin",
  createdAt: new Date().toISOString(),
  credits: 10,
};

const ADMIN_PASSWORD = "Admin2026!";
const STORAGE_USERS = "gp_users";
const STORAGE_PASSWORDS = "gp_passwords";
const STORAGE_SESSION = "gp_session";
const STORAGE_EVENTS = "gp_admin_events";

// ── Seed badges (synchrone, au chargement du module) ─────────────────────
;(() => {
  const STORAGE_BADGES = "gp_badges";
  const stored: { id: string }[] = JSON.parse(localStorage.getItem(STORAGE_BADGES) || "[]");
  const seeds = [
    { id: "badge-coach",   name: "Coach",             emoji: "🎾", color: "#6ab5db", permissions: ["book_free", "manage_coaching", "view_planning"],                                    createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "badge-admin",   name: "Administrateur",    emoji: "⚙️", color: "#e98eaa", permissions: ["book_free", "manage_coaching", "manage_soirees", "view_planning", "admin_access"], createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "badge-vip",     name: "VIP",               emoji: "⭐", color: "#f59e0b", permissions: ["book_free"],                                                                        createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "badge-animateur", name: "Animateur Soirée", emoji: "🎉", color: "#a855f7", permissions: ["manage_soirees", "view_planning"],                                               createdAt: "2026-01-01T00:00:00.000Z" },
  ];
  const seedIds = new Set(seeds.map(s => s.id));
  // Les badges seeds sont toujours écrasés avec les dernières permissions ; les badges custom sont préservés
  const customBadges = stored.filter((b) => !seedIds.has(b.id));
  localStorage.setItem(STORAGE_BADGES, JSON.stringify([...seeds, ...customBadges]));
})();

// ── Seed événements (synchrone, au chargement du module) ──────────────────
;(() => {
  const stored: { id: string; date: string }[] = JSON.parse(localStorage.getItem(STORAGE_EVENTS) || "[]");
  const existingIds = new Set(stored.map(e => e.id));
  const seeds = [
    // ── Tournois ───────────────────────────────────────────────────────────
    { id:"ev-seed-001", type:"tournoi",   title:"Open Garden Printemps — J1",          date:"2026-04-18", slot:"09h – 20h",       courtIds:[], desc:"P25 à P100 · Mixte · 32 équipes · Phase de poules",         createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-002", type:"tournoi",   title:"Open Garden Printemps — Finale",       date:"2026-04-19", slot:"10h – 18h",       courtIds:[], desc:"Demi-finales & Finale · Dotation 500 €",                     createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-003", type:"tournoi",   title:"Tournoi Dames & Juniors — J1",         date:"2026-05-09", slot:"09h – 19h",       courtIds:[], desc:"Tous niveaux · Dames / -18 ans · 24 équipes",                createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-004", type:"tournoi",   title:"Tournoi Dames & Juniors — Finale",     date:"2026-05-10", slot:"10h – 17h",       courtIds:[], desc:"Remise des trophées & cadeaux",                              createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-005", type:"tournoi",   title:"Garden Summer Champ. — J1",            date:"2026-06-13", slot:"08h30 – 21h",     courtIds:[], desc:"P100+ · Open · 48 équipes · Phase de groupes",               createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-006", type:"tournoi",   title:"Garden Summer Champ. — Finale",        date:"2026-06-14", slot:"10h – 19h",       courtIds:[], desc:"Quarts, demis & grande finale · Dotation 1 500 €",           createdAt:"2026-01-01T00:00:00.000Z" },
    // ── Soirées ───────────────────────────────────────────────────────────
    { id:"ev-seed-007", type:"soiree",    title:"Soirée Match de Foot ⚽",               date:"2026-04-11", slot:"19h – Minuit",    courtIds:[], desc:"UEFA Champions League en direct · Bar ouvert",                createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-008", type:"soiree",    title:"Padel by Night 🌙",                     date:"2026-04-17", slot:"20h – 01h",       courtIds:[], desc:"Tournoi nocturne LED · DJ set · Terrasse",                   createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-009", type:"soiree",    title:"Soirée Pizza & Padel 🍕",               date:"2026-04-25", slot:"19h – 23h",       courtIds:[], desc:"Formule dîner + 1h30 de jeu inclus",                        createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-010", type:"soiree",    title:"Fiesta Cinco de Mayo 🇲🇽",              date:"2026-05-02", slot:"19h30 – Minuit",  courtIds:[], desc:"Soirée mexicaine · Cocktails & tapas · Animations",           createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-011", type:"soiree",    title:"Afterwork DJ Set 🎧",                   date:"2026-05-16", slot:"18h – 23h",       courtIds:[], desc:"Live DJ · Bar & terrasse · Entrée libre",                    createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-012", type:"soiree",    title:"Soirée Roland-Garros 🎾",               date:"2026-05-30", slot:"19h – 23h",       courtIds:[], desc:"Retransmission live · Apéro dinatoire",                      createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-013", type:"soiree",    title:"Garden Summer Party ☀️",                date:"2026-06-20", slot:"18h – 02h",       courtIds:[], desc:"Fête de l'été · Concert live · BBQ & cocktails",             createdAt:"2026-01-01T00:00:00.000Z" },
    // ── Séminaires ────────────────────────────────────────────────────────
    { id:"ev-seed-014", type:"seminaire", title:"Séminaire TotalEnergies",               date:"2026-04-15", slot:"09h – 18h",       courtIds:[1,2],   desc:"Terrains 1 & 2 réservés · Repas d'entreprise inclus",    createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-015", type:"seminaire", title:"Team Building Bouygues",                date:"2026-04-22", slot:"14h – 19h",       courtIds:[3],     desc:"Terrain 3 réservé · Coach encadrant",                    createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-016", type:"seminaire", title:"Séminaire Airbus",                      date:"2026-05-06", slot:"08h – 20h",       courtIds:[1,2,3], desc:"Tous les terrains réservés · Journée complète",           createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-017", type:"seminaire", title:"Team Building Orange",                  date:"2026-05-20", slot:"13h – 18h",       courtIds:[2],     desc:"Terrain 2 réservé · Initiation padel",                   createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-018", type:"seminaire", title:"Séminaire SNCF",                        date:"2026-06-03", slot:"09h – 17h",       courtIds:[1,2],   desc:"Terrains 1 & 2 réservés · Lunch sur place",              createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-019", type:"seminaire", title:"Team Building CMA CGM",                 date:"2026-06-10", slot:"10h – 18h",       courtIds:[3],     desc:"Terrain 3 réservé · Tournoi interne entreprise",         createdAt:"2026-01-01T00:00:00.000Z" },
    // ── Coachings ────────────────────────────────────────────────────────
    { id:"ev-seed-020", type:"coaching",  title:"Coaching Débutants — Cours 1",          date:"2026-04-10", slot:"09:30 – 11:00",   courtIds:[3], desc:"Initiation : prise de raquette, service et déplacements",  maxPlaces:6,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-021", type:"coaching",  title:"Coaching Perfectionnement",              date:"2026-04-10", slot:"14:00 – 15:30",   courtIds:[1], desc:"Améliorer la régularité et le jeu de fond de court",       maxPlaces:4,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-022", type:"coaching",  title:"Coaching Technique — Coup droit",        date:"2026-04-14", slot:"17:00 – 18:30",   courtIds:[2], desc:"Travail spécifique coup droit & montée au filet",           maxPlaces:4,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-023", type:"coaching",  title:"Coaching Compétition P100+",             date:"2026-04-16", slot:"09:30 – 11:00",   courtIds:[1], desc:"Préparation match · Tactique et gestion du stress",         maxPlaces:4,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-024", type:"coaching",  title:"Coaching Débutants — Cours 2",           date:"2026-04-21", slot:"09:30 – 11:00",   courtIds:[3], desc:"Service, position et déplacements en match",               maxPlaces:6,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-025", type:"coaching",  title:"Coaching Smash & Volée",                 date:"2026-04-23", slot:"14:00 – 15:30",   courtIds:[2], desc:"Maîtriser la volée haute et le smash offensif",             maxPlaces:4,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-026", type:"coaching",  title:"Coaching Débutants — Cours 3",           date:"2026-04-28", slot:"09:30 – 11:00",   courtIds:[3], desc:"Échanges et régularité · Mise en situation",               maxPlaces:6,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-027", type:"coaching",  title:"Coaching Tactique — Gestion du match",   date:"2026-04-30", slot:"17:00 – 18:30",   courtIds:[1], desc:"Analyse tactique et exercices de décision",                 maxPlaces:4,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-028", type:"coaching",  title:"Coaching Débutants — Cours 4",           date:"2026-05-05", slot:"09:30 – 11:00",   courtIds:[3], desc:"Jeux en situation réelle · Bilan de la session",            maxPlaces:6,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-029", type:"coaching",  title:"Coaching Revers & Lob",                  date:"2026-05-07", slot:"14:00 – 15:30",   courtIds:[2], desc:"Revers à 2 mains et utilisation du lob défensif",           maxPlaces:4,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-030", type:"coaching",  title:"Coaching Préparation Tournoi",            date:"2026-05-12", slot:"09:30 – 11:00",   courtIds:[1], desc:"Simulation matchs · Stratégie de tournoi Garden Padel",    maxPlaces:8,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-031", type:"coaching",  title:"Coaching Perfectionnement Niveau P",      date:"2026-05-19", slot:"14:00 – 15:30",   courtIds:[2], desc:"Pour joueurs P100 à P500 · Travail technique ciblé",        maxPlaces:4,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-032", type:"coaching",  title:"Coaching Jeunes — -18 ans",               date:"2026-05-26", slot:"09:30 – 11:00",   courtIds:[3], desc:"Stage découverte pour les jeunes talents du club",          maxPlaces:8,  createdAt:"2026-01-01T00:00:00.000Z" },
    { id:"ev-seed-033", type:"coaching",  title:"Coaching Pré-estival",                    date:"2026-06-02", slot:"17:00 – 18:30",   courtIds:[1], desc:"Se préparer pour l'été · Tous niveaux bienvenus",           maxPlaces:6,  createdAt:"2026-01-01T00:00:00.000Z" },
  ];
  const toAdd = seeds.filter(s => !existingIds.has(s.id));
  if (toAdd.length > 0) {
    const merged = [...stored, ...toAdd].sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(STORAGE_EVENTS, JSON.stringify(merged));
  }
})();

// ── Seed réservations terrain (synchrone) ─────────────────────────────────
;(() => {
  const STORAGE_RES = "gp_reservations";
  const stored: { id: string }[] = JSON.parse(localStorage.getItem(STORAGE_RES) || "[]");
  const existingIds = new Set(stored.map((r) => r.id));
  const u = (id: string, fn: string, ln: string) => ({ id, firstName: fn, lastName: ln });
  const seeds = [
    // ── Avril 2026 ──────────────────────────────────────────────────────
    { id:"res-seed-001", courtId:1, courtName:"Le Jardin Bleu",    date:"2026-04-09", slot:"11:00 – 12:30", userId:"user-seed-001", userFirstName:"Sophie",  userLastName:"Martin",    userEmail:"sophie.martin@email.fr",    players:[u("user-seed-001","Sophie","Martin"),   u("user-seed-002","Lucas","Bernardi"),  u("user-seed-003","Camille","Rousseau"), u("user-seed-004","Thomas","Dupuis")],    createdAt:"2026-04-09T09:00:00.000Z" },
    { id:"res-seed-002", courtId:2, courtName:"La Rose des Vents", date:"2026-04-09", slot:"14:00 – 15:30", userId:"user-seed-005", userFirstName:"Léa",     userLastName:"Fabre",     userEmail:"lea.fabre@email.fr",         players:[u("user-seed-005","Léa","Fabre"),       u("user-seed-006","Antoine","Girard"),  u("user-seed-007","Marie","Leclerc"),    u("user-seed-008","Nicolas","Moreau")],   createdAt:"2026-04-09T09:10:00.000Z" },
    { id:"res-seed-003", courtId:3, courtName:"La Terrasse Rose",  date:"2026-04-09", slot:"18:30 – 20:00", userId:"user-seed-009", userFirstName:"Chloé",   userLastName:"Petit",     userEmail:"chloe.petit@email.fr",       players:[u("user-seed-009","Chloé","Petit"),     u("user-seed-010","Romain","Blanchard"),u("user-seed-001","Sophie","Martin"),    u("user-seed-002","Lucas","Bernardi")],   createdAt:"2026-04-09T09:20:00.000Z" },
    { id:"res-seed-004", courtId:1, courtName:"Le Jardin Bleu",    date:"2026-04-10", slot:"11:00 – 12:30", userId:"user-seed-002", userFirstName:"Lucas",   userLastName:"Bernardi",  userEmail:"lucas.bernardi@email.fr",    players:[u("user-seed-002","Lucas","Bernardi"),  u("user-seed-004","Thomas","Dupuis"),   u("user-seed-006","Antoine","Girard"),   u("user-seed-008","Nicolas","Moreau")],   createdAt:"2026-04-09T14:00:00.000Z" },
    { id:"res-seed-005", courtId:2, courtName:"La Rose des Vents", date:"2026-04-10", slot:"18:30 – 20:00", userId:"user-seed-003", userFirstName:"Camille", userLastName:"Rousseau",  userEmail:"camille.rousseau@email.fr",  players:[u("user-seed-003","Camille","Rousseau"),u("user-seed-007","Marie","Leclerc"),   u("user-seed-009","Chloé","Petit"),      u("user-seed-010","Romain","Blanchard")], createdAt:"2026-04-09T14:10:00.000Z" },
    { id:"res-seed-006", courtId:2, courtName:"La Rose des Vents", date:"2026-04-11", slot:"09:30 – 11:00", userId:"user-seed-006", userFirstName:"Antoine", userLastName:"Girard",    userEmail:"antoine.girard@email.fr",   players:[u("user-seed-006","Antoine","Girard"),  u("user-seed-001","Sophie","Martin"),   u("user-seed-008","Nicolas","Moreau"),   u("user-seed-009","Chloé","Petit")],      createdAt:"2026-04-10T10:00:00.000Z" },
    { id:"res-seed-007", courtId:1, courtName:"Le Jardin Bleu",    date:"2026-04-11", slot:"15:30 – 17:00", userId:"user-seed-005", userFirstName:"Léa",     userLastName:"Fabre",     userEmail:"lea.fabre@email.fr",         players:[u("user-seed-005","Léa","Fabre"),       u("user-seed-002","Lucas","Bernardi"),  u("user-seed-007","Marie","Leclerc"),    u("user-seed-010","Romain","Blanchard")], createdAt:"2026-04-10T10:20:00.000Z" },
    { id:"res-seed-008", courtId:3, courtName:"La Terrasse Rose",  date:"2026-04-13", slot:"11:00 – 12:30", userId:"user-seed-003", userFirstName:"Camille", userLastName:"Rousseau",  userEmail:"camille.rousseau@email.fr",  players:[u("user-seed-003","Camille","Rousseau"),u("user-seed-007","Marie","Leclerc"),   u("user-seed-009","Chloé","Petit"),      u("user-seed-010","Romain","Blanchard")], createdAt:"2026-04-12T18:00:00.000Z" },
    { id:"res-seed-009", courtId:1, courtName:"Le Jardin Bleu",    date:"2026-04-13", slot:"17:00 – 18:30", userId:"user-seed-008", userFirstName:"Nicolas", userLastName:"Moreau",    userEmail:"nicolas.moreau@email.fr",   players:[u("user-seed-008","Nicolas","Moreau"),  u("user-seed-005","Léa","Fabre"),       u("user-seed-006","Antoine","Girard"),   u("user-seed-007","Marie","Leclerc")],    createdAt:"2026-04-12T18:30:00.000Z" },
    { id:"res-seed-010", courtId:1, courtName:"Le Jardin Bleu",    date:"2026-04-14", slot:"09:30 – 11:00", userId:"user-seed-001", userFirstName:"Sophie",  userLastName:"Martin",    userEmail:"sophie.martin@email.fr",    players:[u("user-seed-001","Sophie","Martin"),   u("user-seed-003","Camille","Rousseau"),u("user-seed-005","Léa","Fabre"),        u("user-seed-010","Romain","Blanchard")], createdAt:"2026-04-13T09:00:00.000Z" },
    { id:"res-seed-011", courtId:2, courtName:"La Rose des Vents", date:"2026-04-15", slot:"14:00 – 15:30", userId:"user-seed-006", userFirstName:"Antoine", userLastName:"Girard",    userEmail:"antoine.girard@email.fr",   players:[u("user-seed-006","Antoine","Girard"),  u("user-seed-002","Lucas","Bernardi"),  u("user-seed-004","Thomas","Dupuis"),    u("user-seed-008","Nicolas","Moreau")],   createdAt:"2026-04-14T11:00:00.000Z" },
    { id:"res-seed-012", courtId:3, courtName:"La Terrasse Rose",  date:"2026-04-15", slot:"20:00 – 21:30", userId:"user-seed-007", userFirstName:"Marie",   userLastName:"Leclerc",   userEmail:"marie.leclerc@email.fr",    players:[u("user-seed-007","Marie","Leclerc"),   u("user-seed-001","Sophie","Martin"),   u("user-seed-005","Léa","Fabre"),        u("user-seed-009","Chloé","Petit")],      createdAt:"2026-04-14T11:20:00.000Z" },
    { id:"res-seed-013", courtId:2, courtName:"La Rose des Vents", date:"2026-04-16", slot:"14:00 – 15:30", userId:"user-seed-010", userFirstName:"Romain",  userLastName:"Blanchard", userEmail:"romain.blanchard@email.fr", players:[u("user-seed-010","Romain","Blanchard"),u("user-seed-003","Camille","Rousseau"),u("user-seed-005","Léa","Fabre"),        u("user-seed-007","Marie","Leclerc")],    createdAt:"2026-04-15T16:00:00.000Z" },
    { id:"res-seed-014", courtId:1, courtName:"Le Jardin Bleu",    date:"2026-04-17", slot:"09:30 – 11:00", userId:"user-seed-004", userFirstName:"Thomas",  userLastName:"Dupuis",    userEmail:"thomas.dupuis@email.fr",    players:[u("user-seed-004","Thomas","Dupuis"),   u("user-seed-001","Sophie","Martin"),   u("user-seed-006","Antoine","Girard"),   u("user-seed-008","Nicolas","Moreau")],   createdAt:"2026-04-16T09:00:00.000Z" },
    { id:"res-seed-015", courtId:3, courtName:"La Terrasse Rose",  date:"2026-04-17", slot:"18:30 – 20:00", userId:"user-seed-005", userFirstName:"Léa",     userLastName:"Fabre",     userEmail:"lea.fabre@email.fr",         players:[u("user-seed-005","Léa","Fabre"),       u("user-seed-002","Lucas","Bernardi"),  u("user-seed-009","Chloé","Petit"),      u("user-seed-010","Romain","Blanchard")], createdAt:"2026-04-16T09:30:00.000Z" },
    // ── Mai 2026 ────────────────────────────────────────────────────────
    { id:"res-seed-016", courtId:1, courtName:"Le Jardin Bleu",    date:"2026-05-02", slot:"11:00 – 12:30", userId:"user-seed-001", userFirstName:"Sophie",  userLastName:"Martin",    userEmail:"sophie.martin@email.fr",    players:[u("user-seed-001","Sophie","Martin"),   u("user-seed-002","Lucas","Bernardi"),  u("user-seed-006","Antoine","Girard"),   u("user-seed-007","Marie","Leclerc")],    createdAt:"2026-04-30T10:00:00.000Z" },
    { id:"res-seed-017", courtId:3, courtName:"La Terrasse Rose",  date:"2026-05-02", slot:"17:00 – 18:30", userId:"user-seed-008", userFirstName:"Nicolas", userLastName:"Moreau",    userEmail:"nicolas.moreau@email.fr",   players:[u("user-seed-008","Nicolas","Moreau"),  u("user-seed-003","Camille","Rousseau"),u("user-seed-004","Thomas","Dupuis"),    u("user-seed-009","Chloé","Petit")],      createdAt:"2026-04-30T10:20:00.000Z" },
    { id:"res-seed-018", courtId:2, courtName:"La Rose des Vents", date:"2026-05-04", slot:"09:30 – 11:00", userId:"user-seed-005", userFirstName:"Léa",     userLastName:"Fabre",     userEmail:"lea.fabre@email.fr",         players:[u("user-seed-005","Léa","Fabre"),       u("user-seed-001","Sophie","Martin"),   u("user-seed-006","Antoine","Girard"),   u("user-seed-010","Romain","Blanchard")], createdAt:"2026-05-03T09:00:00.000Z" },
    { id:"res-seed-019", courtId:1, courtName:"Le Jardin Bleu",    date:"2026-05-05", slot:"14:00 – 15:30", userId:"user-seed-004", userFirstName:"Thomas",  userLastName:"Dupuis",    userEmail:"thomas.dupuis@email.fr",    players:[u("user-seed-004","Thomas","Dupuis"),   u("user-seed-002","Lucas","Bernardi"),  u("user-seed-007","Marie","Leclerc"),    u("user-seed-008","Nicolas","Moreau")],   createdAt:"2026-05-04T11:00:00.000Z" },
    { id:"res-seed-020", courtId:2, courtName:"La Rose des Vents", date:"2026-05-06", slot:"11:00 – 12:30", userId:"user-seed-003", userFirstName:"Camille", userLastName:"Rousseau",  userEmail:"camille.rousseau@email.fr",  players:[u("user-seed-003","Camille","Rousseau"),u("user-seed-006","Antoine","Girard"),  u("user-seed-009","Chloé","Petit"),      u("user-seed-010","Romain","Blanchard")], createdAt:"2026-05-05T14:00:00.000Z" },
    { id:"res-seed-021", courtId:1, courtName:"Le Jardin Bleu",    date:"2026-05-07", slot:"09:30 – 11:00", userId:"user-seed-001", userFirstName:"Sophie",  userLastName:"Martin",    userEmail:"sophie.martin@email.fr",    players:[u("user-seed-001","Sophie","Martin"),   u("user-seed-004","Thomas","Dupuis"),   u("user-seed-005","Léa","Fabre"),        u("user-seed-008","Nicolas","Moreau")],   createdAt:"2026-05-06T09:00:00.000Z" },
    { id:"res-seed-022", courtId:3, courtName:"La Terrasse Rose",  date:"2026-05-08", slot:"15:30 – 17:00", userId:"user-seed-007", userFirstName:"Marie",   userLastName:"Leclerc",   userEmail:"marie.leclerc@email.fr",    players:[u("user-seed-007","Marie","Leclerc"),   u("user-seed-002","Lucas","Bernardi"),  u("user-seed-006","Antoine","Girard"),   u("user-seed-010","Romain","Blanchard")], createdAt:"2026-05-07T10:00:00.000Z" },
    { id:"res-seed-023", courtId:2, courtName:"La Rose des Vents", date:"2026-05-11", slot:"09:30 – 11:00", userId:"user-seed-009", userFirstName:"Chloé",   userLastName:"Petit",     userEmail:"chloe.petit@email.fr",       players:[u("user-seed-009","Chloé","Petit"),     u("user-seed-001","Sophie","Martin"),   u("user-seed-003","Camille","Rousseau"), u("user-seed-007","Marie","Leclerc")],    createdAt:"2026-05-10T18:00:00.000Z" },
    { id:"res-seed-024", courtId:2, courtName:"La Rose des Vents", date:"2026-05-12", slot:"14:00 – 15:30", userId:"user-seed-002", userFirstName:"Lucas",   userLastName:"Bernardi",  userEmail:"lucas.bernardi@email.fr",   players:[u("user-seed-002","Lucas","Bernardi"),  u("user-seed-003","Camille","Rousseau"),u("user-seed-005","Léa","Fabre"),        u("user-seed-009","Chloé","Petit")],      createdAt:"2026-05-11T09:00:00.000Z" },
    { id:"res-seed-025", courtId:3, courtName:"La Terrasse Rose",  date:"2026-05-13", slot:"17:00 – 18:30", userId:"user-seed-006", userFirstName:"Antoine", userLastName:"Girard",    userEmail:"antoine.girard@email.fr",   players:[u("user-seed-006","Antoine","Girard"),  u("user-seed-001","Sophie","Martin"),   u("user-seed-004","Thomas","Dupuis"),    u("user-seed-007","Marie","Leclerc")],    createdAt:"2026-05-12T16:00:00.000Z" },
  ];
  const toAdd = seeds.filter(s => !existingIds.has(s.id));
  if (toAdd.length > 0) {
    localStorage.setItem(STORAGE_RES, JSON.stringify([...stored, ...toAdd]));
  }
})();

// ── Seed inscriptions coaching (synchrone) ────────────────────────────────
;(() => {
  const STORAGE_REG = "gp_tournament_registrations";
  const stored: { eventKey: string; userId: string }[] = JSON.parse(localStorage.getItem(STORAGE_REG) || "[]");
  // Seed déjà injecté si le premier marqueur est présent
  const SEED_MARKER_KEY = "2026-04-10__Coaching Débutants — Cours 1";
  const SEED_MARKER_UID = "user-seed-001";
  if (stored.some(r => r.eventKey === SEED_MARKER_KEY && r.userId === SEED_MARKER_UID)) return;
  const reg = (date: string, title: string, userId: string, at: string) =>
    ({ eventKey: `${date}__${title}`, userId, registeredAt: at });
  const seeds = [
    // ev-seed-020 · Coaching Débutants Cours 1 · max 6 → 4 inscrits
    reg("2026-04-10","Coaching Débutants — Cours 1","user-seed-001","2026-04-05T10:00:00.000Z"),
    reg("2026-04-10","Coaching Débutants — Cours 1","user-seed-003","2026-04-05T10:05:00.000Z"),
    reg("2026-04-10","Coaching Débutants — Cours 1","user-seed-009","2026-04-05T10:10:00.000Z"),
    reg("2026-04-10","Coaching Débutants — Cours 1","user-seed-005","2026-04-05T10:15:00.000Z"),
    // ev-seed-021 · Coaching Perfectionnement · max 4 → 3 inscrits
    reg("2026-04-10","Coaching Perfectionnement","user-seed-002","2026-04-05T11:00:00.000Z"),
    reg("2026-04-10","Coaching Perfectionnement","user-seed-004","2026-04-05T11:05:00.000Z"),
    reg("2026-04-10","Coaching Perfectionnement","user-seed-006","2026-04-05T11:10:00.000Z"),
    // ev-seed-022 · Coaching Technique Coup droit · max 4 → 2 inscrits
    reg("2026-04-14","Coaching Technique — Coup droit","user-seed-008","2026-04-08T09:00:00.000Z"),
    reg("2026-04-14","Coaching Technique — Coup droit","user-seed-010","2026-04-08T09:05:00.000Z"),
    // ev-seed-023 · Coaching Compétition P100+ · max 4 → COMPLET (4 inscrits)
    reg("2026-04-16","Coaching Compétition P100+","user-seed-001","2026-04-09T08:00:00.000Z"),
    reg("2026-04-16","Coaching Compétition P100+","user-seed-002","2026-04-09T08:05:00.000Z"),
    reg("2026-04-16","Coaching Compétition P100+","user-seed-004","2026-04-09T08:10:00.000Z"),
    reg("2026-04-16","Coaching Compétition P100+","user-seed-008","2026-04-09T08:15:00.000Z"),
    // ev-seed-024 · Coaching Débutants Cours 2 · max 6 → 3 inscrits
    reg("2026-04-21","Coaching Débutants — Cours 2","user-seed-003","2026-04-15T10:00:00.000Z"),
    reg("2026-04-21","Coaching Débutants — Cours 2","user-seed-005","2026-04-15T10:05:00.000Z"),
    reg("2026-04-21","Coaching Débutants — Cours 2","user-seed-009","2026-04-15T10:10:00.000Z"),
    // ev-seed-025 · Coaching Smash & Volée · max 4 → COMPLET (4 inscrits)
    reg("2026-04-23","Coaching Smash & Volée","user-seed-001","2026-04-16T09:00:00.000Z"),
    reg("2026-04-23","Coaching Smash & Volée","user-seed-006","2026-04-16T09:05:00.000Z"),
    reg("2026-04-23","Coaching Smash & Volée","user-seed-007","2026-04-16T09:10:00.000Z"),
    reg("2026-04-23","Coaching Smash & Volée","user-seed-010","2026-04-16T09:15:00.000Z"),
    // ev-seed-026 · Coaching Débutants Cours 3 · max 6 → 2 inscrits
    reg("2026-04-28","Coaching Débutants — Cours 3","user-seed-003","2026-04-22T11:00:00.000Z"),
    reg("2026-04-28","Coaching Débutants — Cours 3","user-seed-009","2026-04-22T11:05:00.000Z"),
    // ev-seed-027 · Coaching Tactique · max 4 → 1 inscrit
    reg("2026-04-30","Coaching Tactique — Gestion du match","user-seed-002","2026-04-24T14:00:00.000Z"),
    // ev-seed-028 · Coaching Débutants Cours 4 · max 6 → 3 inscrits
    reg("2026-05-05","Coaching Débutants — Cours 4","user-seed-003","2026-04-29T09:00:00.000Z"),
    reg("2026-05-05","Coaching Débutants — Cours 4","user-seed-005","2026-04-29T09:05:00.000Z"),
    reg("2026-05-05","Coaching Débutants — Cours 4","user-seed-007","2026-04-29T09:10:00.000Z"),
    // ev-seed-029 · Coaching Revers & Lob · max 4 → 2 inscrits
    reg("2026-05-07","Coaching Revers & Lob","user-seed-008","2026-05-01T10:00:00.000Z"),
    reg("2026-05-07","Coaching Revers & Lob","user-seed-010","2026-05-01T10:05:00.000Z"),
    // ev-seed-030 · Coaching Préparation Tournoi · max 8 → 5 inscrits
    reg("2026-05-12","Coaching Préparation Tournoi","user-seed-001","2026-05-05T09:00:00.000Z"),
    reg("2026-05-12","Coaching Préparation Tournoi","user-seed-002","2026-05-05T09:05:00.000Z"),
    reg("2026-05-12","Coaching Préparation Tournoi","user-seed-004","2026-05-05T09:10:00.000Z"),
    reg("2026-05-12","Coaching Préparation Tournoi","user-seed-006","2026-05-05T09:15:00.000Z"),
    reg("2026-05-12","Coaching Préparation Tournoi","user-seed-008","2026-05-05T09:20:00.000Z"),
    // ev-seed-031 · Coaching Perfectionnement Niveau P · max 4 → 3 inscrits
    reg("2026-05-19","Coaching Perfectionnement Niveau P","user-seed-004","2026-05-12T10:00:00.000Z"),
    reg("2026-05-19","Coaching Perfectionnement Niveau P","user-seed-007","2026-05-12T10:05:00.000Z"),
    reg("2026-05-19","Coaching Perfectionnement Niveau P","user-seed-010","2026-05-12T10:10:00.000Z"),
    // ev-seed-032 · Coaching Jeunes · max 8 → 2 inscrits
    reg("2026-05-26","Coaching Jeunes — -18 ans","user-seed-003","2026-05-19T11:00:00.000Z"),
    reg("2026-05-26","Coaching Jeunes — -18 ans","user-seed-009","2026-05-19T11:05:00.000Z"),
    // ev-seed-033 · Coaching Pré-estival · max 6 → 1 inscrit
    reg("2026-06-02","Coaching Pré-estival","user-seed-001","2026-05-26T09:00:00.000Z"),
  ];
  localStorage.setItem(STORAGE_REG, JSON.stringify([...stored, ...seeds]));
})();

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Charger les données au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_USERS);
    let parsedUsers: User[] = stored ? JSON.parse(stored) : [];

    // Seed complet — merge par ID pour ne jamais écraser les existants
    const allSeeds: User[] = [
      { id: "user-seed-001", firstName: "Sophie",   lastName: "Martin",    email: "sophie.martin@email.fr",    address: "14 rue des Mimosas, 83140 Six-Fours",          birthDate: "1992-03-15", level: "P100",    role: "user", createdAt: new Date("2026-03-01").toISOString(), credits: 5 },
      { id: "user-seed-002", firstName: "Lucas",    lastName: "Bernardi",  email: "lucas.bernardi@email.fr",   address: "3 avenue du Var, 83110 Sanary-sur-Mer",        birthDate: "1988-07-22", level: "P250",    role: "user", createdAt: new Date("2026-03-12").toISOString(), credits: 3 },
      { id: "user-seed-003", firstName: "Camille",  lastName: "Rousseau",  email: "camille.rousseau@email.fr", address: "27 chemin des Oliviers, 83190 Ollioules",       birthDate: "2001-11-08", level: "Débutant",role: "user", createdAt: new Date("2026-04-01").toISOString(), credits: 8 },
      { id: "user-seed-004", firstName: "Thomas",   lastName: "Dupuis",    email: "thomas.dupuis@email.fr",    address: "8 boulevard de la Mer, 83140 Six-Fours",        birthDate: "1985-05-30", level: "P500",    role: "user", createdAt: new Date("2026-02-15").toISOString(), credits: 6 },
      { id: "user-seed-005", firstName: "Léa",      lastName: "Fabre",     email: "lea.fabre@email.fr",        address: "19 rue des Pins, 83000 Toulon",                 birthDate: "1997-09-12", level: "P50",     role: "user", createdAt: new Date("2026-02-20").toISOString(), credits: 4 },
      { id: "user-seed-006", firstName: "Antoine",  lastName: "Girard",    email: "antoine.girard@email.fr",   address: "5 impasse du Mistral, 83140 Six-Fours",         birthDate: "1990-01-18", level: "P250",    role: "user", createdAt: new Date("2026-01-10").toISOString(), credits: 7 },
      { id: "user-seed-007", firstName: "Marie",    lastName: "Leclerc",   email: "marie.leclerc@email.fr",    address: "32 avenue du Soleil, 83110 Sanary-sur-Mer",     birthDate: "1995-06-25", level: "P100",    role: "user", createdAt: new Date("2026-01-22").toISOString(), credits: 2 },
      { id: "user-seed-008", firstName: "Nicolas",  lastName: "Moreau",    email: "nicolas.moreau@email.fr",   address: "11 rue de la Fontaine, 83190 Ollioules",        birthDate: "1983-11-03", level: "P1000+",  role: "user", createdAt: new Date("2025-12-05").toISOString(), credits: 10 },
      { id: "user-seed-009", firstName: "Chloé",    lastName: "Petit",     email: "chloe.petit@email.fr",      address: "7 chemin des Lavandes, 83140 Six-Fours",        birthDate: "2003-04-17", level: "Débutant",role: "user", createdAt: new Date("2026-03-28").toISOString(), credits: 5 },
      { id: "user-seed-010", firstName: "Romain",   lastName: "Blanchard", email: "romain.blanchard@email.fr", address: "45 boulevard du Port, 83000 Toulon",            birthDate: "1993-08-09", level: "P25",     role: "user", createdAt: new Date("2026-04-02").toISOString(), credits: 3 },
    ];
    const seedPasswords: Record<string, string> = {
      "user-seed-001": "Sophie2026!",   "user-seed-002": "Lucas2026!",
      "user-seed-003": "Camille2026!",  "user-seed-004": "Thomas2026!",
      "user-seed-005": "Lea2026!",      "user-seed-006": "Antoine2026!",
      "user-seed-007": "Marie2026!",    "user-seed-008": "Nicolas2026!",
      "user-seed-009": "Chloe2026!",    "user-seed-010": "Romain2026!",
    };
    const existingIds = new Set(parsedUsers.map(u => u.id));
    const toAdd = allSeeds.filter(s => !existingIds.has(s.id));
    if (toAdd.length > 0) {
      parsedUsers = [...parsedUsers, ...toAdd];
      const storedPasswords: Record<string, string> = JSON.parse(localStorage.getItem(STORAGE_PASSWORDS) || "{}");
      toAdd.forEach(u => { if (!storedPasswords[u.id]) storedPasswords[u.id] = seedPasswords[u.id]; });
      localStorage.setItem(STORAGE_PASSWORDS, JSON.stringify(storedPasswords));
    }

    // Migration : ajouter credits si absent
    parsedUsers = parsedUsers.map(u => u.credits !== undefined ? u : { ...u, credits: 5 });
    localStorage.setItem(STORAGE_USERS, JSON.stringify(parsedUsers));

    setUsers(parsedUsers);

    const session = localStorage.getItem(STORAGE_SESSION);
    if (session) {
      const sessionData = JSON.parse(session);
      if (sessionData.email === ADMIN.email) {
        setUser(ADMIN);
      } else {
        const storedUsers: User[] = stored ? JSON.parse(stored) : [];
        const found = storedUsers.find(u => u.id === sessionData.id);
        if (found) setUser(found);
      }
    }
  }, []);

  const login = (email: string, password: string) => {
    // Admin
    if (email === ADMIN.email && password === ADMIN_PASSWORD) {
      setUser(ADMIN);
      localStorage.setItem(STORAGE_SESSION, JSON.stringify({ email: ADMIN.email }));
      return { success: true };
    }

    // Utilisateurs
    const storedUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
    const found = storedUsers.find(u => u.email === email);
    if (!found) return { success: false, error: "Aucun compte trouvé avec cet email." };

    const passwords: Record<string, string> = JSON.parse(localStorage.getItem(STORAGE_PASSWORDS) || "{}");
    if (passwords[found.id] !== password) return { success: false, error: "Mot de passe incorrect." };

    setUser(found);
    localStorage.setItem(STORAGE_SESSION, JSON.stringify({ id: found.id }));
    return { success: true };
  };

  const register = (data: RegisterData) => {
    const storedUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
    if (storedUsers.find(u => u.email === data.email) || data.email === ADMIN.email) {
      return { success: false, error: "Cet email est déjà utilisé." };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      address: data.address,
      birthDate: data.birthDate,
      level: data.level,
      role: "user",
      createdAt: new Date().toISOString(),
      credits: 5,
    };

    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem(STORAGE_USERS, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    const passwords: Record<string, string> = JSON.parse(localStorage.getItem(STORAGE_PASSWORDS) || "{}");
    passwords[newUser.id] = data.password;
    localStorage.setItem(STORAGE_PASSWORDS, JSON.stringify(passwords));

    setUser(newUser);
    localStorage.setItem(STORAGE_SESSION, JSON.stringify({ id: newUser.id }));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_SESSION);
  };

  const updateUser = (data: Partial<Pick<User, "firstName" | "lastName" | "email" | "address" | "birthDate" | "level" | "credits">>) => {
    if (!user) return { success: false, error: "Non connecté." };

    // Check email conflict
    if (data.email && data.email !== user.email) {
      const storedUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
      if (storedUsers.find(u => u.email === data.email) || data.email === ADMIN.email) {
        return { success: false, error: "Cet email est déjà utilisé." };
      }
    }

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    if (user.role !== "admin") {
      const storedUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
      const updatedUsers = storedUsers.map(u => u.id === user.id ? updatedUser : u);
      localStorage.setItem(STORAGE_USERS, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
