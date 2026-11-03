
/**
 * Official BMC administrative-ward population estimates.
 * Source: BMC Civic Diary 2026, wardwise population table.
 * Population year: 2025.
 *
 * These are TOTAL POPULATION estimates for administrative wards.
 * They are NOT estimates of population exposed to flooding.
 */

export type BmcAdministrativeWard = {
  code: string;
  division: 'City' | 'Western' | 'Eastern';
  population: number;
  populationYear: number;
  source: string;
};

const SOURCE = 'BMC Civic Diary 2026';

export const BMC_WARD_POPULATION: BmcAdministrativeWard[] = [
  // City
  { code: 'A', division: 'City', population: 194120, populationYear: 2025, source: SOURCE },
  { code: 'B', division: 'City', population: 133616, populationYear: 2025, source: SOURCE },
  { code: 'C', division: 'City', population: 174419, populationYear: 2025, source: SOURCE },
  { code: 'D', division: 'City', population: 364106, populationYear: 2025, source: SOURCE },
  { code: 'E', division: 'City', population: 412833, populationYear: 2025, source: SOURCE },
  { code: 'F/S', division: 'City', population: 378913, populationYear: 2025, source: SOURCE },
  { code: 'F/N', division: 'City', population: 555328, populationYear: 2025, source: SOURCE },
  { code: 'G/S', division: 'City', population: 396524, populationYear: 2025, source: SOURCE },
  { code: 'G/N', division: 'City', population: 628812, populationYear: 2025, source: SOURCE },

  // Western suburbs
  { code: 'H/E', division: 'Western', population: 584934, populationYear: 2025, source: SOURCE },
  { code: 'H/W', division: 'Western', population: 322869, populationYear: 2025, source: SOURCE },
  { code: 'K/E', division: 'Western', population: 864834, populationYear: 2025, source: SOURCE },
  { code: 'K/W', division: 'Western', population: 785899, populationYear: 2025, source: SOURCE },
  { code: 'P/S', division: 'Western', population: 486544, populationYear: 2025, source: SOURCE },
  { code: 'P/N', division: 'Western', population: 988155, populationYear: 2025, source: SOURCE },
  { code: 'R/S', division: 'Western', population: 725585, populationYear: 2025, source: SOURCE },
  { code: 'R/C', division: 'Western', population: 590102, populationYear: 2025, source: SOURCE },
  { code: 'R/N', division: 'Western', population: 452808, populationYear: 2025, source: SOURCE },

  // Eastern suburbs
  { code: 'L', division: 'Eastern', population: 947067, populationYear: 2025, source: SOURCE },
  { code: 'M/E', division: 'Eastern', population: 847865, populationYear: 2025, source: SOURCE },
  { code: 'M/W', division: 'Eastern', population: 432365, populationYear: 2025, source: SOURCE },
  { code: 'N', division: 'Eastern', population: 653810, populationYear: 2025, source: SOURCE },
  { code: 'S', division: 'Eastern', population: 780751, populationYear: 2025, source: SOURCE },
  { code: 'T', division: 'Eastern', population: 358434, populationYear: 2025, source: SOURCE },
];

// Total population across all 24 administrative wards.
export const BMC_TOTAL_POPULATION = BMC_WARD_POPULATION.reduce(
  (total, ward) => total + ward.population,
  0
);
