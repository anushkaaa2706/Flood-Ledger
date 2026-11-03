
import {
  BMC_WARD_POPULATION,
  BMC_TOTAL_POPULATION,
} from '../../data/bmcWardPopulation';

function formatPopulation(value: number): string {
  return value.toLocaleString('en-IN');
}

export function BmcPopulationSummary() {
  return (
    <section
      className="bmc-population-summary"
      aria-label="BMC administrative ward population"
    >
      <div>
        <span className="section-title">
          Greater Mumbai — Total Population
        </span>

        <h2>{formatPopulation(BMC_TOTAL_POPULATION)}</h2>

        <p>
          Estimated population · 2025 · BMC Civic Diary 2026
        </p>
      </div>

      <div>
        <span className="section-title">Administrative wards</span>
        <h2>{BMC_WARD_POPULATION.length}</h2>
        <p>Official BMC ward divisions</p>
      </div>
    </section>
  );
}
