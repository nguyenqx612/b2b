export const CBM_40FT = 67.3; // cubic meters, standard 40ft general-purpose container
export const CBM_20FT = 33.2;
export const CBM_40FT_HC = 76.4; // 40ft high-cube

export type ContainerType = '20ft' | '40ft' | '40ft_hc';

export const CONTAINER_CBM: Record<ContainerType, number> = {
  '20ft': CBM_20FT,
  '40ft': CBM_40FT,
  '40ft_hc': CBM_40FT_HC,
};
