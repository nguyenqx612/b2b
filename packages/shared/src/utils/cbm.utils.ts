import { CONTAINER_CBM, type ContainerType } from '../constants/container.constants.js';

export interface CBMItem {
  productId: string;
  name: string;
  quantity: number;
  cbmPerUnit: number;
}

export interface ContainerSimResult {
  totalCBM: number;
  containerType: ContainerType;
  containerCBM: number;
  containersNeeded: number;     // e.g. 1.43 means 1 full + partial
  fullContainers: number;       // whole containers
  remainderCBM: number;         // CBM in the partial container
  utilizationPct: number;       // % fill of the last (partial) container
  items: Array<CBMItem & { subtotalCBM: number }>;
}

export function simulateContainer(
  items: CBMItem[],
  containerType: ContainerType = '40ft',
): ContainerSimResult {
  const containerCBM = CONTAINER_CBM[containerType];

  const enriched = items.map((item) => ({
    ...item,
    subtotalCBM: Number((item.quantity * item.cbmPerUnit).toFixed(4)),
  }));

  const totalCBM = Number(enriched.reduce((sum, i) => sum + i.subtotalCBM, 0).toFixed(4));

  const containersNeeded = totalCBM / containerCBM;
  const fullContainers = Math.floor(containersNeeded);
  const remainderCBM = Number((totalCBM - fullContainers * containerCBM).toFixed(4));
  const utilizationPct =
    totalCBM === 0
      ? 0
      : remainderCBM === 0
        ? 100
        : Number(((remainderCBM / containerCBM) * 100).toFixed(2));

  return {
    totalCBM,
    containerType,
    containerCBM,
    containersNeeded: Number(containersNeeded.toFixed(4)),
    fullContainers,
    remainderCBM,
    utilizationPct,
    items: enriched,
  };
}
