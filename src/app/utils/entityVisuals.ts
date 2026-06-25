export function getEntityDefaultImage(type: string): string {
  switch (type) {
    case "location":
    case "scene":
      return "/assets/default_location.png";
    case "npc":
    case "player_character":
    case "creature":
      return "/assets/default_npc.png";
    case "quest":
      return "/assets/default_quest.png";
    case "clue":
    case "rumor":
      return "/assets/default_clue.png";
    case "secret":
    case "consequence":
    case "clock":
      return "/assets/default_secret.png";
    case "item":
      return "/assets/default_item.png";
    default:
      return "/assets/default_other.png";
  }
}
