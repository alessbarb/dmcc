export function getEntityDefaultImage(type: string): string {
  switch (type) {
    case "location":
      return "/assets/default_location.png";
    case "scene":
      return "/assets/default_scene.png";
    case "npc":
      return "/assets/default_npc.png";
    case "player":
      return "/assets/default_player.png";
    case "player_character":
      return "/assets/default_player_character.png";
    case "creature":
      return "/assets/default_creature.png";
    case "quest":
      return "/assets/default_quest.png";
    case "objective":
      return "/assets/default_objective.png";
    case "clue":
      return "/assets/default_clue.png";
    case "rumor":
      return "/assets/default_rumor.png";
    case "secret":
      return "/assets/default_secret.png";
    case "consequence":
      return "/assets/default_consequence.png";
    case "clock":
      return "/assets/default_clock.png";
    case "fact":
      return "/assets/default_fact.png";
    case "item":
      return "/assets/default_item.png";
    default:
      return "/assets/default_other.png";
  }
}