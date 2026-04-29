export type TicketmasterEvent = {
  id: string;
  name: string;
  url: string;
  images: { url: string; width: number; height: number }[];
  dates: {
    start: {
      localDate: string;
      localTime?: string;
      dateTime?: string;
    };
    status: { code: string };
  };
  _embedded?: {
    venues?: {
      name?: string;
      city?: { name?: string };
      country?: { name?: string };
      location?: { latitude?: string; longitude?: string };
    }[];
  };
  classifications?: {
    segment?: { name?: string };
    genre?: { name?: string };
    subGenre?: { name?: string };
  }[];
  info?: string;
  pleaseNote?: string;
};

export type TicketmasterResponse = {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
};

export function getBestImage(
  images: TicketmasterEvent["images"],
  minWidth = 300
) {
  const sorted = [...images].sort((a, b) => b.width - a.width);
  return sorted.find((i) => i.width >= minWidth) ?? sorted[0];
}

export function formatEventDate(localDate: string, localTime?: string) {
  const d = new Date(localDate + (localTime ? "T" + localTime : "T00:00:00"));
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatEventTime(localTime?: string) {
  if (!localTime) return null;
  const [h, m] = localTime.split(":");
  return `${h}h${m}`;
}
