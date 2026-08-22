from typing import Literal
from pydantic import BaseModel, Field, field_validator
from settings import settings

MAX_TYPE_TAGS = settings.tag_caps.type
MAX_AUDIENCE_TAGS = settings.tag_caps.audience
MAX_LANGUAGE_TAGS = settings.tag_caps.language
MAX_OTHER_TAGS = settings.tag_caps.other
MAX_NEIGHBORHOOD_TAGS = settings.tag_caps.neighborhood
MAX_ZIPCODES = settings.tag_caps.zipcode
MAX_ELIGIBILITY_TAGS = settings.tag_caps.eligibility

ResourceType = Literal[
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
]
ResourceAudience = Literal[
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
]
ResourceLanguage = Literal[
    "Request Other Interpretation",
    "Arabic", "ASL", "Armenian", "Cambodian/Khmer", "Creole",
    "English", "Farsi/Persian", "French", "Hindi", "Hmong",
    "Japanese", "K'iche/Mayan Languages", "Korean", "Lao", "Mandarin",
    "Portuguese", "Russian", "Spanish", "Tagalog", "Thai",
    "Vietnamese", "Ukranian",
]
ResourceOther = Literal[
    "Government Program", "Emergency Services", "Hotline Available",
    "In-person Services Only", "Long-Term Support", "Online Services Only",
    "Resource Database", "Resist Oppression",
]
ResourceNeighborhood = Literal[
    "Central LA", "DTLA", "Eastside", "Harbor", "San Fernando Valley",
    "South Central", "Westside", "Pasadena", "Long Beach",
    "Orange County", "Remote", "Other",
]
class ResourceDraft(BaseModel):
    name: str = Field(min_length=1, description="Organization name from the org itself")
    website: str = Field(min_length=1, description="Official website URL")
    source_url: str = Field(description="Page these fields were read from")
    confidence: float = Field(ge=0, le=1, description="0 to 1")
    description: str = Field(default="", description="Short paraphrase")
    phone: str = Field(default="", description="Phone if printed on the page")
    hours: str = Field(default="", description="Hours if printed on the page")
    email: str = Field(default="")
    address: str = Field(default="")
    eligibilityText: str = Field(default="")
    contactPerson: str = Field(default="")
    contactLink: str = Field(default="")
    moreInfo: str = Field(default="")
    notes_for_review: str = Field(default="")
    type: list[ResourceType] = Field(default_factory=list, max_length=MAX_TYPE_TAGS)
    audience: list[ResourceAudience] = Field(
        default_factory=list, max_length=MAX_AUDIENCE_TAGS
    )
    language: list[ResourceLanguage] = Field(
        default_factory=list, max_length=MAX_LANGUAGE_TAGS
    )
    other: list[ResourceOther] = Field(default_factory=list, max_length=MAX_OTHER_TAGS)
    neighborhood: list[ResourceNeighborhood] = Field(
        default_factory=list, max_length=MAX_NEIGHBORHOOD_TAGS
    )
    zipcode: list[str] = Field(default_factory=list, max_length=MAX_ZIPCODES)
    eligibility: list[str] = Field(
        default_factory=list, max_length=MAX_ELIGIBILITY_TAGS
    )

    @field_validator("name", "website")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("must not be blank")
        return value