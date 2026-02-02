import HeroModule from "./modules/HeroModule";
import DistancesModule from "./modules/DistancesModule";
import ResultsPreviewModule from "./modules/ResultsPreviewModule";

const MODULES = {
  hero: HeroModule,
  distances: DistancesModule,
  resultsPreview: ResultsPreviewModule
};

export default function ModulesRenderer({ config, data }) {
  const modules = config?.modules ?? [];

  return (
    <>
      {modules
        .filter((m) => m.enabled)
        .map((m, idx) => {
          const Cmp = MODULES[m.type];
          if (!Cmp) return null;
          return <Cmp key={`${m.type}-${idx}`} module={m} config={config} data={data} />;
        })}
    </>
  );
}
