export type FilterSet = {
  resourceTypes: Set<ResourceType>;
  resourceAudiences: Set<AudienceType>;
  resourceLanguages: Set<LanguageType>;
};

export type ResourceDatabase = {
  [name: string]: Resource;
};

export type Resource = {
  type: Set<ResourceType>;
  name: string;
  description: string;
  audience: Set<AudienceType>;
  language: Set<LanguageType>;
  other: Set<OtherType>;
  eligibility: string[];
  eligibilityText: string;
  email1: string;
  email2: string;
  phone1: string;
  phone2: string;
  hours: string;
  contactPerson: string;
  contactLink: string;
  website: string;
  address: string;
  neighborhood: string;
  moreInfo: string;
  selected: boolean;
};

export type ResourceType =
  | "Addiction/Substance Use"
  | "Animal & Pet Services"
  | "Arts & Entertainment"
  | "Career Development & Employment"
  | "Case Management & Resource Navigation"
  | "Child Support & Youth Services"
  | "Community Health Center"
  | "Cultural & Language Services"
  | "Disability"
  | "Domestic Violence & Trauma Survivorship"
  | "Education"
  | "Environmentalism & Sustainability"
  | "Extreme Weather/Wildfires & Disaster Relief"
  | "Family Planning & Reproductive Health"
  | "Financial Assistance"
  | "Fitness & Wellness"
  | "Food & Nutrition Assistance"
  | "Free Items/Donations"
  | "Health Insurance"
  | "Housing & Shelters"
  | "Human Trafficking"
  | "Hygiene"
  | "Legal Services"
  | "LGBT Services"
  | "Medical Services"
  | "Mental Health & Counseling"
  | "Spiritual Services"
  | "Transportation"
  | "Undocumented/Refugee/Asylum Services";

export const ALL_RESOURCE_TYPES: ResourceType[] = [
  "Addiction/Substance Use",
  "Animal & Pet Services",
  "Arts & Entertainment",
  "Career Development & Employment",
  "Case Management & Resource Navigation",
  "Child Support & Youth Services",
  "Community Health Center",
  "Cultural & Language Services",
  "Disability",
  "Domestic Violence & Trauma Survivorship",
  "Education",
  "Environmentalism & Sustainability",
  "Extreme Weather/Wildfires & Disaster Relief",
  "Family Planning & Reproductive Health",
  "Financial Assistance",
  "Fitness & Wellness",
  "Food & Nutrition Assistance",
  "Free Items/Donations",
  "Health Insurance",
  "Housing & Shelters",
  "Human Trafficking",
  "Hygiene",
  "Legal Services",
  "LGBT Services",
  "Medical Services",
  "Mental Health & Counseling",
  "Spiritual Services",
  "Transportation",
  "Undocumented/Refugee/Asylum Services",
];

export type AudienceType =
  | "Anyone"
  | "Adolescents & Young Adults (AYA)"
  | "BIPOC Communities"
  | "Disabled Individuals"
  | "Experiencing Housing Insecurity"
  | "Families & Parents"
  | "Foster Children & Adoption"
  | "Healthcase Workers"
  | "Immigrants & Refugess"
  | "Incarcerated Individuals"
  | "LGBTQ+ Community"
  | "Low Income"
  | "Men"
  | "Seniors"
  | "Students & Youth"
  | "Unhoused Individuals"
  | "Veterans"
  | "Women"
  | "Workers"
  | "Formerly Incarcerated Individuals"
  | "People with Medical Conditions";

export const ALL_AUDIENCE_TYPES: AudienceType[] = [
  "Anyone",
  "Adolescents & Young Adults (AYA)",
  "BIPOC Communities",
  "Disabled Individuals",
  "Experiencing Housing Insecurity",
  "Families & Parents",
  "Foster Children & Adoption",
  "Healthcase Workers",
  "Immigrants & Refugess",
  "Incarcerated Individuals",
  "LGBTQ+ Community",
  "Low Income",
  "Men",
  "Seniors",
  "Students & Youth",
  "Unhoused Individuals",
  "Veterans",
  "Women",
  "Workers",
  "Formerly Incarcerated Individuals",
  "People with Medical Conditions",
];

export type LanguageType =
  | "Request Other Interpretation"
  | "Arabic"
  | "ASL"
  | "Armenian"
  | "Cambodian/Khmer"
  | "Creole"
  | "English"
  | "Farsi/Persian"
  | "French"
  | "Hindi"
  | "Hmong"
  | "Japanese"
  | "K'iche/Mayan Languages"
  | "Korean"
  | "Lao"
  | "Mandarin"
  | "Portuguese"
  | "Russian"
  | "Spanish"
  | "Tagalog"
  | "Thai"
  | "Vietnamese"
  | "Ukranian";

export const ALL_LANGUAGE_TYPES: LanguageType[] = [
  "Request Other Interpretation",
  "Arabic",
  "ASL",
  "Armenian",
  "Cambodian/Khmer",
  "Creole",
  "English",
  "Farsi/Persian",
  "French",
  "Hindi",
  "Hmong",
  "Japanese",
  "K'iche/Mayan Languages",
  "Korean",
  "Lao",
  "Mandarin",
  "Portuguese",
  "Russian",
  "Spanish",
  "Tagalog",
  "Thai",
  "Vietnamese",
  "Ukranian",
];

export type OtherType =
  | "Government Program"
  | "Emergency Services"
  | "Hotline Available"
  | "In-person Services Only"
  | "Long-Term Support"
  | "Online Services Only"
  | "Resource Database"
  | "Resist Oppression";
