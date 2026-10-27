import assert from "node:assert";
import { DebtorConcentrationCard, DebtorItem } from "../DebtorConcentrationCard";

export function testDebtorConcentrationCardContract() {
  const mockDebtors: DebtorItem[] = [
    {
      entityName: "Grupo JHSF",
      totalExposurePct: 34.0,
      isLevel0: false,
      contributingAssets: [
        { ticker: "KNIP11", assetClass: "FII", allocationPct: 22.0, effectiveExposurePct: 22.0 },
      ],
    },
  ];

  assert.strictEqual(typeof DebtorConcentrationCard, "function");
  assert.strictEqual(mockDebtors[0].entityName, "Grupo JHSF");
}

testDebtorConcentrationCardContract();
