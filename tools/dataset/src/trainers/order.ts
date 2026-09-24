// B5.2 passo 2: ordenacao topologica (Kahn) dos treinadores-chave de uma serie pelo grafo requiredDefeats
// (cada sublista e um grupo "OU": basta 1 membro ja ordenado para resolver o grupo); desempate por
// maxTeamLevel asc e nome; ciclo -> erro de build.
import type { TrainerInfo } from "../../../../src/data/types";
import type { ReportSink } from "../context";

export function orderKeyTrainers(
  keyTrainers: readonly TrainerInfo[],
  allTrainerIds: ReadonlySet<string>,
  report: ReportSink,
): string[] {
  const ids = keyTrainers.map((t) => t.id);
  const idSet = new Set(ids);
  const byId = new Map(keyTrainers.map((t) => [t.id, t] as const));

  // so grupos com pelo menos 1 membro no proprio conjunto de chave contam para o indegree
  // (um grupo cujos membros ficam fora do conjunto - outra serie, opcional - e vacuamente satisfeito).
  const indegree = new Map<string, number>();
  const dependents = new Map<string, { id: string; groupIndex: number }[]>();
  const resolvedGroups = new Map<string, Set<number>>();

  for (const t of keyTrainers) {
    for (const group of t.requiredDefeats) {
      for (const prereq of group) {
        if (!allTrainerIds.has(prereq)) {
          report.warn(
            "W_REQUIRED_DEFEAT_UNKNOWN",
            `treinador ${t.id}: requiredDefeats referencia id inexistente "${prereq}"`,
            { trainerId: t.id, prereq },
          );
        }
      }
    }
    const relevantGroups = t.requiredDefeats.filter((group) => group.some((prereq) => idSet.has(prereq)));
    indegree.set(t.id, relevantGroups.length);
    resolvedGroups.set(t.id, new Set());
    relevantGroups.forEach((group, groupIndex) => {
      for (const prereq of group) {
        if (!idSet.has(prereq)) continue;
        const list = dependents.get(prereq) ?? [];
        list.push({ id: t.id, groupIndex });
        dependents.set(prereq, list);
      }
    });
  }

  const cmp = (a: string, b: string): number => {
    const ta = byId.get(a) as TrainerInfo;
    const tb = byId.get(b) as TrainerInfo;
    return ta.maxTeamLevel - tb.maxTeamLevel || ta.name.localeCompare(tb.name) || a.localeCompare(b);
  };

  const ready = ids.filter((id) => (indegree.get(id) ?? 0) === 0);
  const order: string[] = [];
  while (ready.length) {
    ready.sort(cmp);
    const id = ready.shift() as string;
    order.push(id);
    for (const dep of dependents.get(id) ?? []) {
      const resolved = resolvedGroups.get(dep.id) as Set<number>;
      if (resolved.has(dep.groupIndex)) continue;
      resolved.add(dep.groupIndex);
      const remaining = (indegree.get(dep.id) ?? 0) - 1;
      indegree.set(dep.id, remaining);
      if (remaining === 0) ready.push(dep.id);
    }
  }

  if (order.length !== ids.length) {
    const stuck = ids.filter((id) => !order.includes(id));
    throw new Error(`E_TRAINER_ORDER_CYCLE: ciclo em requiredDefeats dos treinadores-chave: ${JSON.stringify(stuck)}`);
  }
  return order;
}
