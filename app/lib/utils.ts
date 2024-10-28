import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGameLogoSrc(game: string | null) {
  switch (game) {
    case "Overwatch":
      return "/images/gameLogos/overwatch.png"
    case "Splatoon":
      return "/images/gameLogos/splatoon.png"
    default:
      return "/images/gameLogos/overwatch.png"
  }
}