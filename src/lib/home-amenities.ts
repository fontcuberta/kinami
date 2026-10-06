export const AMENITY_KEYS = [
  "wifi",
  "washing_machine",
  "dryer",
  "dishwasher",
  "heater",
  "ac",
  "parking",
  "elevator",
] as const;

export type AmenityKey = (typeof AMENITY_KEYS)[number];

export type AmenityDetail = {
  has: boolean;
  notes: string;
};

export type HomeAmenities = Record<AmenityKey, AmenityDetail>;

export const AMENITY_COPY: Record<
  AmenityKey,
  { label: string; hint: string }
> = {
  wifi: {
    label: "Wi‑Fi",
    hint: "Nombre de la red, contraseña y dónde está el router.",
  },
  washing_machine: {
    label: "Lavadora",
    hint: "Dónde está, qué programa usar, detergente y si hay que vaciar el filtro.",
  },
  dryer: {
    label: "Secadora",
    hint: "Si es de condensación, dónde va el depósito o el tubo.",
  },
  dishwasher: {
    label: "Lavavajillas",
    hint: "Pastillas, sal, abrillantador y programa corto.",
  },
  heater: {
    label: "Calefacción",
    hint: "Caldera, termostato, radiadores o suelo radiante. Cómo se enciende y a qué temperatura dejarla.",
  },
  ac: {
    label: "Aire acondicionado",
    hint: "Dónde está el mando, modos y si hay que dejarlo apagado al salir.",
  },
  parking: {
    label: "Aparcamiento",
    hint: "Plaza, mando de garaje, horario o zona azul.",
  },
  elevator: {
    label: "Ascensor",
    hint: "Código, llave o si hay que avisar al portero.",
  },
};

function emptyAmenities(): HomeAmenities {
  return AMENITY_KEYS.reduce((acc, key) => {
    acc[key] = { has: false, notes: "" };
    return acc;
  }, {} as HomeAmenities);
}

export function parseHomeAmenities(value: unknown): HomeAmenities {
  const base = emptyAmenities();
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;

  for (const key of AMENITY_KEYS) {
    const item = (value as Record<string, unknown>)[key];
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    base[key] = {
      has: Boolean(record.has),
      notes: typeof record.notes === "string" ? record.notes : "",
    };
  }

  return base;
}

export function amenitiesFromForm(formData: FormData): HomeAmenities {
  const amenities = emptyAmenities();
  for (const key of AMENITY_KEYS) {
    amenities[key] = {
      has: formData.get(`amenity_${key}`) === "on",
      notes: String(formData.get(`amenity_notes_${key}`) ?? "").trim(),
    };
  }
  return amenities;
}

export function listedAmenities(amenities: HomeAmenities) {
  return AMENITY_KEYS.filter((key) => amenities[key].has).map((key) => ({
    key,
    notes: amenities[key].notes,
  }));
}
