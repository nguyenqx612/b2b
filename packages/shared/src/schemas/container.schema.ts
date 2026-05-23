import { z } from 'zod';
import { CONTAINER_CBM } from '../constants/container.constants.js';

export const containerSimulateSchema = z.object({
  containerType: z.enum(['20ft', '40ft', '40ft_hc']).default('40ft'),
});

export type ContainerSimulateInput = z.infer<typeof containerSimulateSchema>;

export { CONTAINER_CBM };
