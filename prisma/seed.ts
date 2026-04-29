import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// Budapest mid-May:
//   Sunrise ≈ 05:18  ·  Sunset ≈ 20:14  ·  Civil dusk ≈ 20:48
//   Astronomical night begins ≈ 22:30. So "de nuit" = après ~21:00.

async function main() {
  await prisma.place.deleteMany();
  await prisma.day.deleteMany();
  await prisma.trip.deleteMany();

  const password = "budapest25";
  const passwordHash = await bcrypt.hash(password, 10);

  const trip = await prisma.trip.create({
    data: {
      slug: "budapest-mai-2025",
      name: "Budapest, Mai 2025",
      city: "Budapest",
      country: "Hongrie",
      coverEmoji: "🛁",
      accentFrom: "#f59e0b",
      accentTo: "#ec4899",
      startDate: new Date("2025-05-12"),
      endDate: new Date("2025-05-15"),
      passwordHash,
      notes:
        "Coucher du soleil ~20h14 / nuit pleine ~21h. Mardi arrivée 9h30, vendredi décollage 13h00.",
    },
  });

  const dArr = await prisma.day.create({
    data: {
      tripId: trip.id,
      index: 0,
      date: new Date("2025-05-12"),
      label: "Mardi 12 — Arrivée",
      subtitle: "On pose les valises et on respire le Danube",
      colorFrom: "#fb923c",
      colorTo: "#f43f5e",
    },
  });
  const dWed = await prisma.day.create({
    data: {
      tripId: trip.id,
      index: 1,
      date: new Date("2025-05-13"),
      label: "Mercredi 13 — Buda & Parlement",
      subtitle: "Funiculaire à l'aube, Parlement en pleine lumière",
      colorFrom: "#6366f1",
      colorTo: "#22d3ee",
    },
  });
  const dThu = await prisma.day.create({
    data: {
      tripId: trip.id,
      index: 2,
      date: new Date("2025-05-14"),
      label: "Jeudi 14 — Pest, thermes & nuit magique",
      subtitle: "Halles → Citadelle au soleil → Thermes/Place des Héros/Fontaine au crépuscule",
      colorFrom: "#10b981",
      colorTo: "#a3e635",
    },
  });
  const dFri = await prisma.day.create({
    data: {
      tripId: trip.id,
      index: 3,
      date: new Date("2025-05-15"),
      label: "Vendredi 15 — Départ (jour OFF)",
      subtitle: "Dernier café, dernier au revoir au Danube",
      colorFrom: "#f472b6",
      colorTo: "#a78bfa",
      isOff: true,
    },
  });

  // ==== Day 0 — Mardi 12 ====
  await prisma.place.createMany({
    data: [
      {
        tripId: trip.id,
        dayId: dArr.id,
        name: "New York Café",
        category: "cafe",
        emoji: "☕",
        lat: 47.4953,
        lng: 19.0717,
        address: "Erzsébet krt. 9-11, 1073 Budapest",
        description:
          "Le « plus beau café du monde ». Inauguré 1894, refuge des écrivains hongrois (on dit qu'ils y jetaient leur stylo dans le Danube en sortant pour ne plus pouvoir écrire ailleurs). Marbre Carrare, fresques de Lotz, lustres en bronze, pianiste l'après-midi.",
        humorComment:
          "Tu rentres pour un café, tu sors avec une posture droite et un compte en banque qui pleure.",
        tip: "RÉSERVE en ligne (newyorkcafe.hu). En walk-in compter 45-90 min de file. Le mardi après-midi est le moins blindé.",
        openingHours: "Tous les jours 8h00 – 00h00",
        suggestedStart: "14h30",
        suggestedEnd: "16h00",
        durationMinutes: 90,
        segment: "afternoon",
        orderInDay: 1,
        priceInfo: "Café ~5€, gâteau 12-18€, plat 25-35€",
        crowdLevel: "very_busy",
        crowdNote: "Très bondé 10h-13h (brunch) et 17h-19h. Mardi 14h30 = créneau le plus calme.",
        bookingUrl: "https://newyorkcafe.hu/en/reservation",
        funFact:
          "Le jour de l'inauguration en 1894, l'écrivain Ferenc Molnár a jeté la clef du café dans le Danube — pour qu'il ne ferme jamais. Spoiler : ça a marché 130 ans.",
      },
      {
        tripId: trip.id,
        dayId: dArr.id,
        name: "Place Vörösmarty & Pâtisserie Gerbeaud",
        category: "cafe",
        emoji: "🍰",
        lat: 47.4961,
        lng: 19.0518,
        address: "Vörösmarty tér 7-8, 1051 Budapest",
        description:
          "Pâtisserie 1858 sur la plus mondaine des places. Dobos torte (caramel), Eszterházy (noisette), Krémes. Trois salles : grand salon Belle Époque, atrium, terrasse. Café à 8 sortes de grains.",
        humorComment:
          "Le seul endroit de Pest où la cuillère pèse plus lourd que ton bagage cabine.",
        tip: "Pâtisserie à emporter au comptoir 50% moins cher que le service à table. La Dobos torte = signature.",
        openingHours: "Tous les jours 9h00 – 21h00",
        suggestedStart: "16h30",
        suggestedEnd: "17h30",
        durationMinutes: 60,
        segment: "afternoon",
        orderInDay: 2,
        priceInfo: "Café 1 500-2 500 HUF / Pâtisserie 2 200-3 500 HUF (table)",
        crowdLevel: "busy",
        crowdNote: "Calme à l'ouverture 9h, file dès 10h30.",
        funFact:
          "Emil Gerbeaud a inventé le « konyakos meggy » : une cerise à l'eau-de-vie enrobée de chocolat. Tout le secret tient dans une seule règle : la cerise doit être marinée 3 mois minimum dans le cognac. C'est servi ici depuis 1884, le même protocole jamais changé.",
      },
      {
        tripId: trip.id,
        dayId: dArr.id,
        name: "Deák Ferenc tér",
        category: "monument",
        emoji: "🚇",
        lat: 47.4972,
        lng: 19.0552,
        address: "Deák Ferenc tér, 1052 Budapest",
        description:
          "Le carrefour de Pest : 3 lignes de métro (M1, M2, M3) se croisent ici, plus le bus 100E pour l'aéroport. Place piétonne, terrasses, statue de Ferenc Deák. À 5 min à pied de Gerbeaud, sur le chemin du Pont des Chaînes.",
        humorComment:
          "Toutes les routes mènent à Deák Ferenc tér. Même celles qui n'y vont pas.",
        tip: "Pile entre Vörösmarty et le Pont — passage naturel. Bus 100E pour l'aéroport part d'ici (2 200 HUF, 30 min). M1 = ligne UNESCO, à essayer au moins une station.",
        openingHours: "24h/24",
        suggestedStart: "17h45",
        suggestedEnd: "18h00",
        durationMinutes: 15,
        segment: "afternoon",
        orderInDay: 3,
        priceInfo: "Gratuit / Bus 100E aéroport 2 200 HUF",
        crowdLevel: "very_busy",
        crowdNote: "Très animé toute la journée — c'est le hub.",
        funFact:
          "La ligne M1 sous Deák est la plus vieille ligne de métro d'Europe continentale (1896), 2e après Londres. Wagons jaunes d'origine, plafond à 3 m. C'est un site UNESCO. Tu prends un métro vintage sans le savoir.",
      },
      {
        tripId: trip.id,
        dayId: dArr.id,
        name: "Pont des Chaînes (Lánchíd)",
        category: "monument",
        emoji: "🌉",
        lat: 47.4988,
        lng: 19.0432,
        address: "Széchenyi Lánchíd, Budapest",
        description:
          "Premier pont permanent entre Buda et Pest (1849), gardé par 4 lions de pierre. Réouvert en 2023 après 2 ans de rénovation. Spectaculaire à l'heure dorée (~19h45 en mai) et illuminé après 21h.",
        humorComment:
          "Les lions n'ont pas de langue. Légende : leur sculpteur s'est jeté du pont de honte. Spoiler : c'est faux, mais l'histoire tient à table.",
        tip: "Heure dorée ≈ 19h30-20h15. Illumination dorée allumée à la tombée de la nuit (~20h45 en mai).",
        openingHours: "Accessible 24h/24",
        suggestedStart: "19h30",
        suggestedEnd: "20h45",
        durationMinutes: 60,
        segment: "evening",
        orderInDay: 4,
        priceInfo: "Gratuit",
        crowdLevel: "medium",
        crowdNote: "Affluence stable jour et nuit ; le côté Buda (Clark Ádám tér) est plus calme.",
        funFact:
          "Pendant la guerre, les nazis ont fait sauter le pont en 1945. Au moment du dynamitage, 4 ouvriers hongrois étaient encore dessus pour une dernière inspection. Aucun n'a survécu. Reconstruit à l'identique en 1949.",
      },
      {
        tripId: trip.id,
        dayId: dArr.id,
        name: "Chaussures au bord du Danube",
        category: "monument",
        emoji: "👞",
        lat: 47.5024,
        lng: 19.0451,
        address: "Id. Antall József rkp., Budapest",
        description:
          "Mémorial bouleversant (Can Togay & Gyula Pauer, 2005) : 60 paires de chaussures en fonte sur 40 m de quai. Hommage aux 3 500 Juifs hongrois fusillés ici par les Croix Fléchées en 1944-45 — leurs chaussures, marchandise rare, étaient retirées avant.",
        humorComment:
          "Le seul endroit de Budapest où on ne fait pas de blague. On se tait, on regarde, on n'oublie pas.",
        tip: "Mieux à l'heure bleue (20h45-21h30 en mai), bougies souvent allumées par les visiteurs.",
        openingHours: "Accessible 24h/24",
        suggestedStart: "20h45",
        suggestedEnd: "21h30",
        durationMinutes: 30,
        segment: "evening",
        orderInDay: 5,
        priceInfo: "Gratuit",
        crowdLevel: "medium",
        crowdNote: "Affluence régulière mais l'atmosphère reste recueillie. Soir = encore plus solennel.",
        funFact:
          "Les chaussures sont coulées en 60 paires différentes — des hommes, des femmes, et 6 paires d'enfants. Chaque paire est un modèle réaliste des années 40 en Hongrie. Aucune n'est identique.",
      },
    ],
  });

  // ==== Day 1 — Mercredi 13 — Buda + Parlement ====
  await prisma.place.createMany({
    data: [
      {
        tripId: trip.id,
        dayId: dWed.id,
        name: "Funiculaire du Château (Sikló)",
        category: "viewpoint",
        emoji: "🚠",
        lat: 47.4979,
        lng: 19.0398,
        address: "Clark Ádám tér, 1013 Budapest",
        description:
          "Funiculaire en bois de 1870, 95 mètres de dénivelé en 90 secondes. Détruit en 1944, rouvert 1986. Cabines en chêne d'origine.",
        humorComment:
          "Plus court qu'une story Insta, mais bien plus stylé. Tes mollets te remercieront.",
        tip: "8h-9h = aucune file. Après 10h compter 30 min d'attente. Mieux : aller en funi, redescendre par les ruelles côté Várfok lépcső.",
        openingHours: "Tous les jours 8h00 – 22h00",
        suggestedStart: "8h30",
        suggestedEnd: "9h00",
        durationMinutes: 25,
        segment: "morning",
        orderInDay: 1,
        priceInfo: "Aller simple 1 600 HUF (~4€), AR 2 500 HUF (~6€)",
        crowdLevel: "busy",
        crowdNote: "Très bondé 10h-16h ; 8h-9h = quasiment vide.",
        funFact:
          "Le funi a été inventé pour que les fonctionnaires arrivent au Château sans transpirer leur uniforme. C'est littéralement le premier ascenseur professionnel d'Europe centrale (1870).",
      },
      {
        tripId: trip.id,
        dayId: dWed.id,
        name: "Bastion des Pêcheurs",
        category: "viewpoint",
        emoji: "🏰",
        lat: 47.5018,
        lng: 19.0334,
        address: "Szentháromság tér, 1014 Budapest",
        description:
          "Sept tourelles néo-romanes (Schulek, 1902) pour les sept tribus magyares. Construit en hommage à la guilde des pêcheurs qui défendait ce bastion au Moyen Âge. Vue panoramique imbattable sur Pest et le Danube.",
        humorComment:
          "On l'appelle « bastion des pêcheurs » mais aucun poisson n'a jamais été pêché là. Marketing médiéval, déjà.",
        tip: "Niveau bas 100% gratuit + même vue. Niveau supérieur (payant) = mieux pour les photos. Avant 9h c'est gratuit ET désert ; après 10h tu bagarres pour ton selfie.",
        openingHours:
          "Niveau supérieur 9h-19h (mar-oct, payant) / Terrasses inférieures 24h/24 gratuites",
        suggestedStart: "9h00",
        suggestedEnd: "10h00",
        durationMinutes: 60,
        segment: "morning",
        orderInDay: 2,
        priceInfo: "Niveau supérieur 1 500 HUF (~3,80€) ; bas gratuit",
        crowdLevel: "very_busy",
        crowdNote: "Vide avant 9h, plein dès 10h, foule continue jusqu'à 17h.",
        funFact:
          "Les 7 tourelles ne sont PAS médiévales : c'est un faux bastion construit en 1902, juste pour la déco. Personne ne s'est jamais battu là. C'est l'équivalent architectural d'un set de cinéma — sauf qu'il a 120 ans.",
      },
      {
        tripId: trip.id,
        dayId: dWed.id,
        name: "Palais Royal de Buda",
        category: "monument",
        emoji: "👑",
        lat: 47.4961,
        lng: 19.0399,
        address: "Szent György tér 2, 1014 Budapest",
        description:
          "Palais des rois de Hongrie depuis le 13e siècle. Abrite la Galerie Nationale Hongroise et le Musée d'Histoire de Budapest. Cours intérieures librement accessibles, statues des Hunyadi, fontaine Mátyás.",
        humorComment:
          "Un palais qui a plus de vies qu'un chat sous catnip. À chaque guerre, on le rase, on le rebâtit. Solide.",
        tip: "Cours, statues et terrasses : gratuites. Galerie Nationale (intérieurs) : payante mais riche en peinture hongroise. Pour cette journée, on reste dehors.",
        openingHours: "Cours/extérieurs 24h / Galerie Nationale 10h-18h (lun fermé)",
        suggestedStart: "10h00",
        suggestedEnd: "11h30",
        durationMinutes: 90,
        segment: "morning",
        orderInDay: 3,
        priceInfo: "Extérieurs gratuits / Galerie Nationale 4 800 HUF (~12€)",
        crowdLevel: "medium",
        crowdNote: "Cours souvent calmes même en haute saison, l'espace est immense.",
        funFact:
          "Sous le palais, il y a 1,2 km de galeries souterraines reliées entre elles. Pendant la Seconde Guerre, l'état-major hongrois y a tenu un siège de 51 jours contre l'Armée rouge. L'eau et la nourriture étaient acheminées via le funi.",
        // orderInDay 3 (after Bastion 2)
      },
      {
        tripId: trip.id,
        dayId: dWed.id,
        name: "Labyrinthe du Château",
        category: "monument",
        emoji: "🕯️",
        lat: 47.5011,
        lng: 19.0317,
        address: "Úri u. 9, 1014 Budapest",
        description:
          "Galeries souterraines naturelles sous la colline de Buda, utilisées par Vlad III « l'Empaleur » comme cachot (1462-1474). Aujourd'hui scénographie évocatrice : brume, statues, lanternes. ~1,2 km de tunnels.",
        humorComment:
          "Si tu cherches le frisson sans bouger plus loin que le Château : ici, à 16°C même en plein été. Climatisation médiévale.",
        tip: "Compter 45-60 min. Pas de billet en ligne, achat sur place. Parfait pour digérer au frais.",
        openingHours: "Tous les jours 10h-19h (dernière entrée 18h)",
        suggestedStart: "11h30",
        suggestedEnd: "12h30",
        durationMinutes: 60,
        segment: "morning",
        orderInDay: 4,
        priceInfo: "3 500 HUF (~9€)",
        crowdLevel: "calm",
        crowdNote: "Rarement bondé, atmosphère spacieuse même par flux touristique.",
        funFact:
          "Vlad III « l'Empaleur » (oui, le vrai Dracula) a été emprisonné ici de 1462 à 1474 par le roi Matthias. Une légende dit qu'il y a continué ses « activités » sur les rats. Bram Stoker a recyclé Buda dans son roman.",
      },
      {
        tripId: trip.id,
        dayId: dWed.id,
        name: "Parlement Hongrois",
        category: "monument",
        emoji: "🏛️",
        lat: 47.5072,
        lng: 19.0455,
        address: "Kossuth Lajos tér 1-3, 1055 Budapest",
        description:
          "Néo-gothique flamboyant, plus grand bâtiment de Hongrie : 268 m de long, 96 m de haut (comme la basilique : ex aequo voulu). 691 pièces, 27 kg d'or sur les murs, escalier d'apparat dément. Visite guidée 45 min comprend la salle de la couronne (Sainte Couronne de Saint Étienne, 11e siècle).",
        humorComment:
          "Les Hongrois ont mesuré la basilique et fait pareil pour rendre Dieu et l'État ex aequo. Diplomatie architecturale.",
        tip: "RÉSERVATION OBLIGATOIRE 4-6 semaines à l'avance via jegymester.hu. Visite 45 min en français disponible certains jours. Arriver 30 min avant pour le contrôle sécurité (style aéroport).",
        openingHours: "Visites lun-ven 8h-18h / sam-dim 8h-16h. Fermé jours fériés (15 mars, 20 août, 23 oct).",
        suggestedStart: "15h00",
        suggestedEnd: "17h00",
        durationMinutes: 90,
        segment: "afternoon",
        orderInDay: 5,
        mustReserve: true,
        priceInfo: "EU 4 000 HUF (~10€) / non-EU 8 000 HUF (~20€) / étudiant -50%",
        crowdLevel: "very_busy",
        crowdNote: "Visites guidées complètes en mai-octobre. Sans réservation = peu de chances de rentrer le jour même.",
        bookingUrl: "https://www.jegymester.hu/eng/production/443220/parliament-visit",
        funFact:
          "Il abrite 691 pièces. À sa construction (1885-1904), Steindl est devenu aveugle avant la fin et a dû faire le dernier étage à l'oreille, en se faisant lire les plans à voix haute. Il est mort 5 semaines avant l'inauguration.",
      },
      {
        tripId: trip.id,
        dayId: dWed.id,
        name: "Tram 2 — balade panoramique",
        category: "viewpoint",
        emoji: "🚋",
        lat: 47.5054,
        lng: 19.0464,
        address: "Embarquer à Kossuth Lajos tér (à côté du Parlement)",
        description:
          "Le tram 2 longe le Danube côté Pest sur 6 km — National Geographic l'a classé parmi les 7 plus belles lignes de tram du monde. Vue plein sud sur le Parlement, le Pont des Chaînes, le Château, la Citadelle, le Pont de la Liberté. 25 min de bout en bout.",
        humorComment:
          "Tu peux faire l'aller-retour pour 1 ticket si tu restes assis. Personne ne vérifiera. Tour panoramique low-cost officiel.",
        tip: "À enchainer juste après le Parlement (Kossuth Lajos tér = arrêt direct). Place côté Danube (à droite en allant nord→sud) pour la plus belle séquence.",
        openingHours: "Tous les jours 4h30 – 23h30",
        suggestedStart: "17h15",
        suggestedEnd: "18h00",
        durationMinutes: 45,
        segment: "evening",
        orderInDay: 6,
        priceInfo: "Ticket simple 450 HUF (~1,15€)",
        crowdLevel: "calm",
        crowdNote: "Plein sud à 18h en mai = lumière dorée parfaite sur Buda.",
        funFact:
          "Le tram 2 est jaune banane depuis 1956. La couleur a été imposée par les Soviétiques pour qu'on les voie de loin pendant les exercices de défense aérienne. Quand le mur est tombé, la mairie a voulu repeindre — les Budapestois ont protesté. Yellow it stays.",
      },
    ],
  });

  // ==== Day 2 — Jeudi 14 ====
  await prisma.place.createMany({
    data: [
      {
        tripId: trip.id,
        dayId: dThu.id,
        name: "Bibliothèque Ervin Szabó",
        category: "monument",
        emoji: "📚",
        lat: 47.4910,
        lng: 19.0631,
        address: "Szabó Ervin tér 1, 1088 Budapest",
        description:
          "Palais Wenckheim néo-baroque (1887) reconverti en bibliothèque. Le 4e étage (Reading Hall) = stuc, dorures, fresques, lustres en cristal. Style « Poudlard austro-hongrois ».",
        humorComment:
          "Tu entres pour Insta, tu ressors avec un doctorat. Mécanisme connu.",
        tip: "Acheter le « day pass » à l'accueil. Reading Hall fermé pendant les sessions d'examen (mai = parfois). Vérifier fszek.hu avant.",
        openingHours: "Lun fermé / Mar-Ven 10h-20h / Sam 9h-16h / Dim fermé",
        suggestedStart: "9h30",
        suggestedEnd: "10h30",
        durationMinutes: 60,
        segment: "morning",
        orderInDay: 1,
        priceInfo: "Day pass 1 800 HUF (~4,50€) ; gratuit avec carte de bibliothèque",
        crowdLevel: "calm",
        crowdNote: "Très calme le matin (ouverture 10h). Devient occupé par étudiants après 14h en période d'exam.",
        funFact:
          "C'était la résidence privée du comte Wenckheim, bâtie pour 12 personnes (lui, sa femme, et 10 domestiques pour eux deux). Aujourd'hui c'est ouvert à 5 000 lecteurs/jour. Aristocratie : 0. Bibliothèque : 1.",
      },
      {
        tripId: trip.id,
        dayId: dThu.id,
        name: "Grand Marché Couvert (Nagy Csarnok)",
        category: "market",
        emoji: "🌶️",
        lat: 47.4869,
        lng: 19.0584,
        address: "Vámház krt. 1-3, 1093 Budapest",
        description:
          "Halles néogothiques d'Eiffel-style (1897), 10 000 m². RDC : produits frais (paprika, salami Mangalica, miel acacia, foie gras). 1er étage : artisanat + comptoirs (lángos, gulyás, tokany). Sous-sol : poissonnier + asiatique.",
        humorComment:
          "Premier étage : tu manges. Rez-de-chaussée : tu repars avec 3 kg de paprika que tu n'utiliseras jamais.",
        tip: "Lángos crème+ail+fromage chez « Lángos Király » (1er étage, fond gauche) = le bon. Évite les vendeurs qui te crient dessus à l'entrée. Marché fermé dimanche.",
        openingHours: "Lun 6h-17h / Mar-Ven 6h-18h / Sam 6h-15h / Dim fermé",
        suggestedStart: "11h00",
        suggestedEnd: "12h30",
        durationMinutes: 90,
        segment: "morning",
        orderInDay: 2,
        priceInfo: "Lángos 1 500-2 500 HUF (~4-6€) / Plat chaud 2 500-4 000 HUF (~6-10€)",
        crowdLevel: "busy",
        crowdNote: "Très blindé samedi 10h-14h. Mardi-jeudi 11h = créneau idéal.",
        funFact:
          "Le bâtiment a été conçu par un disciple de Gustave Eiffel. Charpente entièrement en fonte, 60 m d'envergure sans pilier central. Pendant l'occupation soviétique on y entreposait des chars — vrai. Le 1er étage = chargement direct depuis le toit pour les marchandises, le 2e étage cachait des dépôts.",
      },
      {
        tripId: trip.id,
        dayId: dThu.id,
        name: "Pont de la Liberté (Szabadság híd)",
        category: "monument",
        emoji: "🌉",
        lat: 47.4853,
        lng: 19.0556,
        address: "Szabadság híd, Budapest",
        description:
          "Pont vert pomme avec ses turuls dorés (oiseaux mythiques magyars) au sommet des piliers. Ouvert 1896 par François-Joseph en personne. Plus court que le Pont des Chaînes mais plus ouvragé.",
        humorComment:
          "Les turuls regardent vers le sud. Personne ne sait pourquoi. Mystère hongrois numéro 47.",
        tip: "Certains étés le pont devient piéton le week-end (« Szabihíd ») — pas la peine de chercher, c'est une chance. Sinon trottoirs côté sud meilleurs pour les photos.",
        openingHours: "Accessible 24h/24",
        suggestedStart: "12h45",
        suggestedEnd: "13h05",
        durationMinutes: 20,
        segment: "afternoon",
        orderInDay: 3,
        priceInfo: "Gratuit",
        crowdLevel: "calm",
        funFact:
          "Les turuls sont des oiseaux mythiques magyars (mi-aigle, mi-faucon, à grosse griffe). Ils sont DORÉS à la feuille d'or 24 carats. Repeints en 2010 — coût total : 90 kg d'or. C'est probablement le pont le plus cher au m² du monde si on compte que la dorure.",
      },
      {
        tripId: trip.id,
        dayId: dThu.id,
        name: "Citadelle (Gellért-hegy)",
        category: "viewpoint",
        emoji: "🗽",
        lat: 47.4861,
        lng: 19.0463,
        address: "Citadella sétány, 1118 Budapest",
        description:
          "Forteresse autrichienne (1854) au sommet du Mont Gellért (235 m), surplombée de la Statue de la Liberté hongroise (14 m, brandissant une palme). Vue à 360° sur les deux rives. ⚠️ Citadelle elle-même fermée pour rénovation 2023-2026, mais le parc et la statue restent accessibles.",
        humorComment:
          "Tu montes en râlant, tu redescends en pleurant. C'est le Budapest officiel du carrousel d'Insta.",
        tip: "Montée par le sentier sud (Pont Liberté → Hegyalja → escaliers) = 20 min. Plus joli côté nord (Pont Élisabeth) à la descente. Fontaine d'eau potable au sommet.",
        openingHours: "Parc accessible 24h/24 (citadelle fermée travaux)",
        suggestedStart: "13h30",
        suggestedEnd: "15h30",
        durationMinutes: 120,
        segment: "afternoon",
        orderInDay: 4,
        priceInfo: "Gratuit (parc) / Citadelle fermée travaux jusqu'en 2026",
        crowdLevel: "medium",
        crowdNote: "Plus calme avant 11h ou après 17h. Beaucoup de photographes au sommet au crépuscule.",
        funFact:
          "La Statue de la Liberté tient une PALME originellement, ajoutée par les Soviétiques en 1947. Avant 1989 elle tenait un drapeau étoilé. Après la chute du mur, on a juste retiré le drapeau et changé l'inscription — la statue est restée. Recyclage politique de bronze.",
      },
      {
        tripId: trip.id,
        dayId: dThu.id,
        name: "Thermes Széchenyi (nocturne)",
        category: "bath",
        emoji: "🛁",
        lat: 47.5188,
        lng: 19.0816,
        address: "Állatkerti krt. 9-11, 1146 Budapest",
        description:
          "Plus grand complexe thermal d'Europe (1913), néo-baroque jaune ocre. 18 bassins (3 extérieurs, 15 intérieurs), saunas, bains de vapeur. Eau jaillissante à 74°C, refroidie à 27-38°C selon les bassins. Source découverte en 1879.",
        humorComment:
          "Tu rentres stressé du voyage, tu sors mou comme un nokedli. Mission accomplie.",
        tip: "RÉSERVE en ligne (szechenyibath.hu) : billet + cabine privée +1500 HUF. Apporte serviette (location 3 000 HUF), tongs, bonnet pour saunas, étui imperméable pour téléphone. Bassins extérieurs > intérieurs en mai (jouer aux échecs flottants à l'extérieur).",
        openingHours:
          "Tous les jours 7h-19h (intérieur) / extérieur jusqu'à 22h sam-dim, 20h sem (mai-sept)",
        suggestedStart: "18h00",
        suggestedEnd: "20h30",
        durationMinutes: 150,
        segment: "evening",
        orderInDay: 5,
        mustReserve: true,
        priceInfo: "Jour entier 11 000 HUF (~28€) / soirée après 17h 7 700 HUF (~19€)",
        crowdLevel: "busy",
        crowdNote: "Soirée jeudi = correct (samedi soir = sparty bondé). 18h-20h plus calme que 14h-17h.",
        bookingUrl: "https://www.szechenyibath.hu/en/tickets",
        funFact:
          "Dans le bassin extérieur central, des vieux Hongrois jouent aux échecs sur des plateaux flottants en mousse. Tradition depuis 1971. Le record du monde de partie d'échecs continue (sans coup pendant 4h, juste des regards) a été battu ici en 1989.",
      },
      {
        tripId: trip.id,
        dayId: dThu.id,
        name: "Place des Héros (Hősök tere) — de nuit",
        category: "monument",
        emoji: "🗿",
        lat: 47.5147,
        lng: 19.0779,
        address: "Hősök tere, 1146 Budapest",
        description:
          "Vaste place avec colonnade Millennium (1896) : statue de l'archange Gabriel + 7 chefs magyars (Árpád au centre). Encadrée par le Musée des Beaux-Arts et le Műcsarnok. Illuminée chaque nuit, spectaculairement scénographique.",
        humorComment:
          "Sept cavaliers de bronze qui posent depuis 1896. Patience inégalée.",
        tip: "Vraie nuit en mai : à partir de 21h. À 5 min à pied des thermes Széchenyi (idéal en sortant détendu). Sol en granit lisse → glissant si pluie.",
        openingHours: "Accessible 24h/24",
        suggestedStart: "20h45",
        suggestedEnd: "21h15",
        durationMinutes: 30,
        segment: "evening",
        orderInDay: 6,
        priceInfo: "Gratuit",
        crowdLevel: "calm",
        crowdNote: "Calme le soir, beaucoup d'ados qui font du skate au coin nord.",
        funFact:
          "La statue de l'archange Gabriel au sommet de la colonne tient une couronne hongroise. Elle a été commandée en 1894 mais n'a été terminée qu'en 1929 — l'artiste György Zala l'a refaite 3 fois parce que les empereurs successifs trouvaient que « ça ne ressemblait pas assez à un archange ». Spoil : personne n'a jamais vu d'archange.",
      },
      {
        tripId: trip.id,
        dayId: dWed.id,
        name: "Margaret Island — Fontaine musicale",
        category: "viewpoint",
        emoji: "⛲",
        lat: 47.5224,
        lng: 19.0466,
        address: "Margitsziget, Budapest",
        description:
          "Île verte (2,5 km de long) au milieu du Danube. La fontaine principale (Zenélő Szökőkút) propose plusieurs spectacles aquatiques par jour synchronisés sur de la musique classique, hongroise, ou pop. Spectacle nocturne (21h30) avec lumières = féerique.",
        humorComment:
          "Chorégraphie aquatique sur Vivaldi puis Queen. Le mauvais goût assumé, c'est génial.",
        tip: "Spectacles ~14h, 16h, 18h, 20h, 21h30 (en saison). Le 21h30 est LA séance avec full lumières — vise celui-là. Accès : tram 4/6 (Margit híd, then 7 min walk) ou bus 26.",
        openingHours: "Île 24h/24 / Spectacles fontaine 14h-21h30 (mai-sept, sous réserve météo)",
        suggestedStart: "21h30",
        suggestedEnd: "22h30",
        durationMinutes: 60,
        segment: "evening",
        orderInDay: 7, // Mercredi — après Tram 2 (6)
        priceInfo: "Gratuit",
        crowdLevel: "medium",
        crowdNote: "Spectacle 21h30 attire les locaux + touristes mais l'esplanade est grande.",
        funFact:
          "L'île appartenait au 13e siècle à la princesse Marguerite, qui a refusé 6 propositions de mariage royales pour devenir nonne. Elle est morte ici à 28 ans. Quand le pape l'a canonisée 700 ans plus tard, l'île a pris son nom — sa rébellion ado a fini en marketing touristique.",
      },
    ],
  });

  // ==== Day 3 — Vendredi 15 (départ) — JOUR OFF, rien de prévu ====
  // Décollage 13h00, navette privée → on profite du matin libre, pas de planning

  // ==== Rainy day alternatives ====
  await prisma.place.createMany({
    data: [
      {
        tripId: trip.id,
        name: "Synagogue de la rue Dohány",
        category: "monument",
        emoji: "🕍",
        lat: 47.4955,
        lng: 19.0595,
        address: "Dohány u. 2, 1074 Budapest",
        description:
          "Plus grande synagogue d'Europe (1859), 3 000 places, style mauresque-byzantin. Incluse : Mémorial Holocauste (Imre Varga, 1990) — saule pleureur en métal, chaque feuille porte le nom d'une victime. Cimetière où sont enterrées 2 000 victimes du ghetto.",
        humorComment:
          "Plus impressionnant qu'attendu, plus émouvant que prévu. Casquette pour hommes, recueillement pour tous.",
        tip: "Audio-guide en français inclus. Visite guidée incluse (anglais) toutes les heures. Dimanche matin = bondé. Vendredi = férmé tôt (Shabbat).",
        openingHours: "Hors shabbat — Dim-Jeu 10h-20h / Ven 10h-16h / Sam fermé",
        durationMinutes: 90,
        isRainyAlt: true,
        priceInfo: "Adulte 11 000 HUF (~28€) avec audio + visite",
        crowdLevel: "very_busy",
        crowdNote: "Bondé 11h-15h. Préférer 10h-11h ou après 17h.",
        bookingUrl: "https://jegy.dohany-zsinagoga.hu/",
        funFact:
          "Tony Curtis (acteur américain, vrai nom Bernard Schwartz) était hongrois. C'est lui qui a financé en 1990 le mémorial Saule pleureur dans le jardin, en hommage à sa mère qui a survécu au ghetto de Budapest.",
      },
      {
        tripId: trip.id,
        name: "Basilique Saint-Étienne",
        category: "monument",
        emoji: "⛪",
        lat: 47.5008,
        lng: 19.0537,
        address: "Szent István tér 1, 1051 Budapest",
        description:
          "Néo-classique (1905), 96 m de haut (égalité Parlement). Reliquaire de la main droite momifiée de Saint Étienne (~1000 ans). Coupole accessible : 364 marches ou ascenseur. Vue 360° sur Pest.",
        humorComment:
          "Tu paies 1€ pour voir une main vieille de 1 000 ans s'illuminer. C'est très Budapest.",
        tip: "Coupole = la VRAIE attraction. Concert d'orgue mar/jeu/sam à 17h ou 20h selon programme (~5 000 HUF). Entrée nef gratuite avec donation suggérée.",
        openingHours: "Lun-Sam 9h-19h / Dim 13h-19h / Coupole 9h-18h",
        durationMinutes: 60,
        isRainyAlt: true,
        priceInfo: "Nef gratuit (don 200 HUF) / Coupole 3 200 HUF (~8€) / Reliquaire 200 HUF",
        crowdLevel: "medium",
        funFact:
          "La main droite momifiée de Saint Étienne est conservée ici depuis 1944. Elle a survécu à 1 000 ans, à 4 vols, et à un voyage en Slovaquie pendant le communisme. Mets 200 HUF dans la fente : la lumière s'allume 90 secondes. C'est le distributeur le plus rentable de Hongrie.",
      },
      {
        tripId: trip.id,
        name: "Vasarely Múzeum",
        category: "museum",
        emoji: "🟧",
        lat: 47.5358,
        lng: 19.0414,
        address: "Szentlélek tér 6, 1033 Budapest",
        description:
          "Op-art psychédélique de Victor Vasarely (1906-1997, Hongrois né à Pécs, naturalisé français). 400 œuvres dans une cour baroque d'Óbuda. Salles thématiques : zèbres noir/blanc, planétaires colorés, hommages.",
        humorComment:
          "Tu sors avec mal au crâne mais aussi avec 30 idées de tatouage. Échange équitable.",
        tip: "À combiner avec balade Óbuda : architecture villageoise dans la grande Budapest. Tram 1 ou HÉV. Petit musée, prévoir 1h-1h30.",
        openingHours: "Mar-Dim 10h-18h / Lun fermé",
        durationMinutes: 90,
        isRainyAlt: true,
        priceInfo: "2 600 HUF (~6,50€)",
        crowdLevel: "calm",
        funFact:
          "Vasarely a vendu son premier op art à un milliardaire texan qui pensait acheter un « tapis ». Il l'a accroché au plafond. Personne n'a osé corriger. Le tableau est resté 30 ans à l'envers et vaut aujourd'hui 4 M€.",
      },
      {
        tripId: trip.id,
        name: "Maison de la Terreur",
        category: "museum",
        emoji: "💀",
        lat: 47.5052,
        lng: 19.0654,
        address: "Andrássy út 60, 1062 Budapest",
        description:
          "Mémorial des régimes nazi (1944-45) puis communiste (1945-89), dans l'ancien QG des Croix Fléchées puis de l'ÁVH (police secrète). Sous-sol = anciennes cellules de torture conservées. Tank soviétique au cœur du hall central. Mur des victimes.",
        humorComment:
          "Aucune blague ici. C'est dur, c'est nécessaire, c'est puissant. Audioguide en français = obligatoire.",
        tip: "Audioguide FR (1 500 HUF). Compter 2h minimum. Le sous-sol (cellules) est éprouvant — prévoir une pause.",
        openingHours: "Mar-Dim 10h-18h / Lun fermé",
        durationMinutes: 120,
        isRainyAlt: true,
        priceInfo: "4 000 HUF (~10€) + audio 1 500 HUF",
        crowdLevel: "busy",
        crowdNote: "Files importantes 11h-15h. Première heure (10h) = bien plus calme.",
        funFact:
          "L'inscription en façade « 1944 » est en relief de bronze, mais elle ne projette son ombre que les 19 et 21 octobre — anniversaires des deux dictatures (rafle de 1944 et écrasement de 1956). Le bâtiment est le seul de Budapest qui « se souvient » deux fois par an grâce au soleil.",
      },
      {
        tripId: trip.id,
        name: "Centre Robert Capa",
        category: "museum",
        emoji: "📷",
        lat: 47.5040,
        lng: 19.0586,
        address: "Nagymező u. 8, 1065 Budapest",
        description:
          "Photographie contemporaine (expos temporaires) + hommage permanent à Robert Capa (1913-1954, né Endre Friedmann à Budapest), reporter de guerre, co-fondateur de Magnum Photos.",
        humorComment:
          "On ressort avec l'envie de jeter son téléphone et d'acheter un Leica argentique. Ne le fais pas.",
        tip: "Programme expos sur capacenter.hu. Courte visite (45-60 min). Sur Andrássy, à combiner avec Maison de la Terreur (5 min à pied).",
        openingHours: "Lun-Mar fermé / Mer-Dim 14h-19h",
        durationMinutes: 60,
        isRainyAlt: true,
        priceInfo: "2 800 HUF (~7€)",
        crowdLevel: "calm",
        funFact:
          "Robert Capa a inventé son nom en 1936 (vrai nom : Endre Friedmann) parce qu'il vendait mieux ses photos en se faisant passer pour un riche photographe américain inventé. Le « scoop » a duré 20 ans. Il est mort en marchant sur une mine en Indochine en 1954, à 40 ans.",
      },
      {
        tripId: trip.id,
        name: "Musée du Flipper (Flippermúzeum)",
        category: "museum",
        emoji: "🕹️",
        lat: 47.5099,
        lng: 19.0341,
        address: "Radnóti Miklós u. 18, 1137 Budapest",
        description:
          "+150 flippers et arcades fonctionnels, libre-service. Un seul ticket = jeu illimité tant que tu es à l'intérieur. Cave + RDC, ambiance pub. Plus vieille machine : 1876.",
        humorComment:
          "Tu venais 1h, tu repars 4h plus tard avec un score honteux et le pouce courbaturé.",
        tip: "Apporter des sous pour jeux extras (machines à monnaies vintage). Bar avec bières. Idéal en début de soirée si pluie.",
        openingHours: "Mer-Ven 16h-23h / Sam 14h-23h / Dim 10h-22h / Lun-Mar fermé",
        durationMinutes: 120,
        isRainyAlt: true,
        priceInfo: "Adulte 4 500 HUF (~11€) jeux illimités",
        crowdLevel: "medium",
        crowdNote: "Soirées sam = animées (jeunes locaux). Sem = calme et accès facile à toutes les machines.",
        funFact:
          "Le fondateur Balázs Pálfi a commencé à collectionner des flippers à 14 ans après en avoir reçu un cassé. Il en a maintenant 150+. Sa femme l'a quitté en 2006. Il s'est consolé en achetant un Addams Family de 1992. Aujourd'hui c'est le plus grand musée du flipper d'Europe.",
      },
      {
        tripId: trip.id,
        name: "Paloma Artspace",
        category: "monument",
        emoji: "🎨",
        lat: 47.4971,
        lng: 19.0556,
        address: "Kossuth Lajos u. 14-16, 1053 Budapest",
        description:
          "Cour intérieure 1900 réinvestie par 30+ designers/artisans hongrois. Bijoux contemporains, céramique, illustrations originales, vinyles, bougies, mobilier upcycle. Concept : « anti-souvenir-de-l'aéroport ».",
        humorComment:
          "Souvenirs d'aéroport vs Paloma : pas le même match. Tu repartiras avec quelque chose d'unique.",
        tip: "Boutiques à étages — explorer toute la cour. Zoltán Bács (illustrations Budapest) et Zsófia Kollár (céramique) = mes prefs.",
        openingHours: "Lun-Ven 10h-19h / Sam 11h-18h / Dim fermé",
        durationMinutes: 60,
        isRainyAlt: true,
        priceInfo: "Entrée gratuite",
        crowdLevel: "calm",
        funFact:
          "Le bâtiment était la résidence du juge Kossuth, qui a accueilli ici Garibaldi en 1859. Tu marches dans le vestibule où la stratégie d'unification italo-hongroise a été imaginée. Aujourd'hui : on y vend des bougies à la cire d'abeille. Progrès.",
      },
    ],
  });

  // ==== Hidden Kolodko statues ====
  await prisma.place.createMany({
    data: [
      {
        tripId: trip.id,
        name: "Kolodko — La petite princesse",
        category: "hidden",
        emoji: "👑",
        lat: 47.4972,
        lng: 19.0494,
        address: "Vigadó tér, sur la rambarde face au Danube",
        description:
          "Mini bronze d'une princesse en couronne de papier (~25 cm). Inspirée par les dessins de László Marton enfant. L'une des +30 mini-sculptures de Mihály Kolodko cachées en ville depuis 2014.",
        humorComment:
          "Trouver un Kolodko, c'est comme trouver un Pokémon rare mais en culturel. +50 XP.",
        openingHours: "24h/24",
        durationMinutes: 5,
        isHidden: true,
        priceInfo: "Gratuit",
        funFact:
          "Kolodko n'a JAMAIS demandé d'autorisation à la mairie. Il les pose la nuit, sans permis, et la ville ne les enlève pas parce que tout le monde les aime. C'est un graffeur en bronze.",
      },
      {
        tripId: trip.id,
        name: "Kolodko — Tank rouillé",
        category: "hidden",
        emoji: "🛡️",
        lat: 47.4955,
        lng: 19.0628,
        address: "Corvin köz, près du mémorial 1956",
        description:
          "Mini-tank en bronze (15 cm) en hommage aux insurgés de Corvin köz pendant la révolution de 1956. Souvent fleuri par les passants.",
        humorComment:
          "Un tank de 12 cm qui te rappelle que la liberté est plus petite qu'on croit, et plus précieuse.",
        openingHours: "24h/24",
        durationMinutes: 5,
        isHidden: true,
        priceInfo: "Gratuit",
      },
      {
        tripId: trip.id,
        name: "Kolodko — L'écureuil au champignon",
        category: "hidden",
        emoji: "🐿️",
        lat: 47.5018,
        lng: 19.0334,
        address: "Bastion des Pêcheurs, sur un muret bas",
        description:
          "Petit écureuil grignotant un champignon (12 cm). Exemple typique du humour Kolodko : tu passes devant 10 fois sans le voir.",
        humorComment:
          "Si tu le vois sans aide, tu gagnes une bière. Si tu ne le vois pas, on est tous passés par là.",
        openingHours: "24h/24",
        durationMinutes: 5,
        isHidden: true,
        priceInfo: "Gratuit",
      },
      {
        tripId: trip.id,
        name: "Kolodko — Sushi (rouleau de maki)",
        category: "hidden",
        emoji: "🍣",
        lat: 47.4980,
        lng: 19.0578,
        address: "Régiposta utca, à 50 m de la place Vörösmarty",
        description:
          "Rouleau de maki en bronze posé sur un parapet. Hommage humoristique au boom des restaurants japonais à Budapest.",
        humorComment:
          "Aucune raison rationnelle d'être là. C'est l'art de rue dans son meilleur état d'esprit.",
        openingHours: "24h/24",
        durationMinutes: 5,
        isHidden: true,
        priceInfo: "Gratuit",
      },
    ],
  });

  console.log(`✓ Trip seeded: ${trip.name} (mot de passe: ${password})`);
  console.log(`  ${await prisma.place.count()} lieux dont ${await prisma.place.count({ where: { isRainyAlt: true } })} alt. pluie + ${await prisma.place.count({ where: { isHidden: true } })} cachés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
