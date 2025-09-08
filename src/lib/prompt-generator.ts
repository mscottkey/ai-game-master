
type PromptTemplates = {
  campaign: string[];
  character: string[];
};

type SystemVariables = {
  [key: string]: string[];
};

const templates: Record<string, PromptTemplates> = {
  dnd5e: {
    campaign: [
      "A group of [HEROES] must venture into the [LOCATION] to retrieve the [MACGUFFIN] from the clutches of the evil [VILLAIN].",
      "In the city of [LOCATION], a mysterious plague is spreading. The party is hired by [PATRON] to find a cure, but they uncover a conspiracy led by [VILLAIN].",
      "A powerful [MACGUFFIN] has been stolen from the [LOCATION]. The [HEROES] are tasked with tracking down the thief, a notorious [VILLAIN], before it's too late."
    ],
    character: [
      "A [RACE] [CLASS] from the [LOCATION] who is seeking [GOAL].",
      "An orphaned [RACE] [CLASS] who was raised by [MENTOR] and now seeks to avenge their family's death at the hands of [VILLAIN].",
      "A charming but roguish [RACE] [CLASS] on the run from [AUTHORITY] after a heist gone wrong in [LOCATION]."
    ]
  },
  fate: {
    campaign: [
      "In the rain-slicked streets of [LOCATION], a mysterious [PATRON] offers a job that's too good to be true, drawing the characters into a web of conspiracy involving the notorious [VILLAIN].",
      "A high-stakes game is happening at the [LOCATION], run by the dangerous [VILLAIN]. The crew needs to infiltrate the game to steal the [MACGUFFIN] for their client, [PATRON].",
      "A simple [GOAL] case turns deadly when it's revealed to be connected to the city's biggest crime boss, [VILLAIN], and a secret society operating out of the [LOCATION]."
    ],
    character: [
      "A hardboiled [CLASS] with a [ASPECT] and a knack for finding trouble in the darkest corners of [LOCATION].",
      "A smooth-talking [CLASS] who is trying to pay off a debt to [VILLAIN] by pulling one last big score.",
      "A determined [CLASS] with the aspect [ASPECT], investigating a personal tragedy that leads them deep into the city's corrupt underbelly."
    ]
  },
  "starwars-ffg": {
    campaign: [
      "A group of [HEROES] on the Outer Rim take on a risky job for a shadowy [PATRON], promising a big payout but attracting the attention of the [AUTHORITY].",
      "The crew is hired to transport a valuable [MACGUFFIN] from [LOCATION] to another system, but they're being hunted by the relentless bounty hunter [VILLAIN].",
      "Fleeing from the [AUTHORITY], the [HEROES] stumble upon an ancient ruin on a forgotten moon, a place of great power sought by the sinister [VILLAIN]."
    ],
    character: [
      "A cynical [RACE] [CLASS] who owes a debt to a Hutt and is just trying to score one last big job to get free.",
      "A young, idealistic [RACE] [CLASS] from a remote part of the galaxy, seeking to join the Rebel Alliance and fight the [AUTHORITY].",
      "A grizzled [RACE] [CLASS] and veteran of the Clone Wars, now making a living on the fringes of the galaxy in their trusty ship."
    ]
  }
};

const variables: Record<string, SystemVariables> = {
  dnd5e: {
    HEROES: ["mercenaries", "adventurers", "scholars", "exiles"],
    LOCATION: ["Cursed Forest of Eldwood", "Sunken City of Zarth", "Dragon's Peak Mountains", "Glimmering Mines of Axor"],
    MACGUFFIN: ["Orb of a Thousand Souls", "Sunstone of Aethel", "Blade of the Ancients", "Tome of Forbidden Knowledge"],
    VILLAIN: ["lich lord Azalin", "dragon queen Valstraza", "drow matriarch Lolth", "orc warlord Grommash"],
    PATRON: ["local magistrate", "wealthy merchant", "concerned noble", "desperate wizard"],
    RACE: ["Dwarf", "Elf", "Human", "Halfling", "Dragonborn", "Gnome"],
    CLASS: ["Warrior", "Mage", "Rogue", "Cleric", "Ranger", "Bard"],
    GOAL: ["fame and fortune", "revenge against a rival", "a lost family heirloom", "redemption for a past failure"],
    MENTOR: ["a wise old wizard", "a grizzled warrior", "a cunning rogue"],
    AUTHORITY: ["the City Guard", "a powerful thieves' guild", "an inquisitor"]
  },
  fate: {
    LOCATION: ["the smoky Starlight Lounge", "the grimy docks of Crescent Bay", "a high-class penthouse suite", "an abandoned warehouse"],
    PATRON: ["femme fatale", "shady businessman", "corrupt politician", "desperate informant"],
    VILLAIN: ["mob boss 'Silas' Blackwood", "the elusive 'Shadow Syndicate'", "police chief Miller", "the dame with the snake tattoo"],
    GOAL: ["missing person", "stolen artifact", "blackmail"],
    MACGUFFIN: ["incriminating photographs", "a ledger of mob dealings", "a priceless diamond necklace"],
    CLASS: ["Private Eye", "Con Artist", "Reporter", "Getaway Driver"],
    ASPECT: ["'Heart of Gold, Fists of Stone'", "'I Owe the Wrong People Money'", "'Never Forgets a Face or a Grudge'"]
  },
  "starwars-ffg": {
    HEROES: ["smugglers", "bounty hunters", "rebels", "explorers"],
    PATRON: ["Hutt gangster", "Rebel Alliance contact", "mysterious robed figure", "corporate executive"],
    AUTHORITY: ["Galactic Empire", "Black Sun crime syndicate", "local planetary militia"],
    MACGUFFIN: ["valuable spice shipment", "secret Imperial codes", "a Jedi holocron", "a person of interest"],
    LOCATION: ["the cantinas of Mos Eisley", "the corporate towers of Coruscant", "a derelict Star Destroyer", "the asteroid fields of Hoth"],
    VILLAIN: ["Darth Vader", "Boba Fett", "an Imperial Moff", "a rival smuggling crew"],
    RACE: ["Twi'lek", "Wookiee", "Rodian", "Human", "Bothan"],
    CLASS: ["Pilot", "Scoundrel", "Force-sensitive exile", "Technician", "Soldier"]
  }
};

export const systemPlaceholders: Record<string, { campaign: string; character: string }> = {
  dnd5e: {
    campaign: "A group of mercenaries are hired to investigate strange disappearances in the cursed forest of Eldwood.",
    character: "A grizzled dwarf warrior with a mysterious past, seeking redemption for a forgotten failure.",
  },
  fate: {
    campaign: "In the rain-slicked streets of a noir city, a mysterious client offers a job that's too good to be true, drawing you into a web of conspiracy.",
    character: "A hardboiled private eye with a troubled past and a knack for finding trouble where it's darkest.",
  },
  "starwars-ffg": {
    campaign: "A group of smugglers on the Outer Rim take on a risky job for a shadowy client, promising a big payout but attracting Imperial attention.",
    character: "A cynical Twi'lek pilot who owes a debt to a Hutt and is just trying to score one last big job to get free.",
  },
};


function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePrompt(system: string, type: 'campaign' | 'character'): string {
  const systemTemplates = templates[system] || templates.dnd5e;
  const systemVars = variables[system] || variables.dnd5e;

  const template = getRandomElement(systemTemplates[type]);

  let prompt = template;
  const placeholders = template.match(/\[(.*?)\]/g) || [];

  placeholders.forEach(placeholder => {
    const key = placeholder.replace(/[\[\]]/g, '');
    if (systemVars[key]) {
      const value = getRandomElement(systemVars[key]);
      prompt = prompt.replace(placeholder, value);
    }
  });

  return prompt;
}
