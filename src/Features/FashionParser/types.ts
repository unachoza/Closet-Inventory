export type RegexMap = readonly [RegExp, string][];

export interface ProductAttributes {
  silhouette?: string;
  fit?: string;
  shaping?: string[];

  neckline?: string;
  sleeveLength?: string;
  sleeveStyle?: string;

  hemLength?: string;
  legShape?: string;
  rise?: string;
  waistStyle?: string;

  closure?: string[];

  accents?: string[];
  construction?: string[];
  pattern?: string;

  hasStretch?: boolean;
  hasPockets?: boolean;

  season?: string;
  material?: string;
}

export interface MaterialBlend {
	material: string;
	percentage: number;
}