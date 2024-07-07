export type BasicGunInfo = {
  id: string;
  name: string;
  normalizedName: string;
  shortName: string;
  defaultPresetImageUrl: string | null;
  category: {
    name: string;
    normalizedName: string;
  };
};
