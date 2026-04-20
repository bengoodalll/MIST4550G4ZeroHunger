// Fallback data — Our World in Data "Food Waste Per Capita, 2022" (FAO + UNEP)
// Values in kg per capita per year
// Values from Julia's chart (image2.png in docx) — kg/capita/year
export const foodWasteData = [
  { region: "Sub-Saharan Africa",         household: 120, outOfHome: 22, retail: 18 },
  { region: "Oceania",                    household: 114, outOfHome: 30, retail: 12 },
  { region: "N. Africa & W. Asia",        household:  95, outOfHome: 18, retail: 25 },
  { region: "Latin America & Caribbean",  household:  87, outOfHome: 33, retail: 10 },
  { region: "Europe & N. America",        household:  72, outOfHome: 44, retail: 15 },
  { region: "Eastern & SE Asia",          household:  83, outOfHome: 32, retail: 10 },
  { region: "Central & Southern Asia",    household:  73, outOfHome: 32, retail:  8 },
  { region: "Australia & New Zealand",    household:  72, outOfHome: 33, retail:  8 },
];
