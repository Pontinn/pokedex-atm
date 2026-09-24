// Time (RF-38..41): regras de B6.6 (src/domain/team.ts).
import { addToTeam, removeFromTeam, type AddToTeamResult } from "../../domain/team";
import { readDoc, updateDoc, type RepoStorage } from "./shared";

export function createTeamRepository(storage: RepoStorage) {
  return {
    async get(): Promise<(number | null)[]> {
      return (await readDoc(storage, "team")).slots;
    },
    async add(dex: number): Promise<AddToTeamResult> {
      let result: AddToTeamResult | null = null;
      await updateDoc(storage, "team", (doc) => {
        const r = addToTeam(doc.slots, dex);
        result = r;
        return { ...doc, slots: r.slots };
      });
      return result as unknown as AddToTeamResult;
    },
    async remove(dex: number): Promise<(number | null)[]> {
      return (await updateDoc(storage, "team", (doc) => ({ ...doc, slots: removeFromTeam(doc.slots, dex) }))).slots;
    },
  };
}
