export function useLawRegime() {
  const regime = (import.meta.env.VITE_LAW_REGIME || "OBBBA_174A_EXPENSE") as
    | "OBBBA_174A_EXPENSE"
    | "TCJA_174_CAPITALIZE_2022_2025";
  return { regime, isCapitalization: regime === "TCJA_174_CAPITALIZE_2022_2025" };
}