import type { Guild } from "./guilds";

import { useState } from "react";
import { rarityImageFromItems } from "../..";
import loot from "../../data/loot.json";
import { randomInt } from "./utils";

const bags = loot.map((loot, index) => {
  const [items] = Object.values(loot);
  return {
    id: String(index + 1),
    items: Object.values(items as Record<string, string>),
  };
}) as Array<{ id: string; items: string[] }>;

function randomBagId(filters: Array<(name: string) => boolean> = []): string {
  let filteredBags = bags;

  if (filters.length > 0) {
    filteredBags = [...bags].filter(({ items }) => {
      return items.some((item) => {
        for (const match of filters) {
          if (match(item)) {
            return true;
          }
        }
        return false;
      });
    });
  }

  return filteredBags[randomInt(filteredBags.length)].id;
}

export function useBag(
  guilds: Guild[],
  {
    displayColors,
    displayLevels,
  }: { displayColors: boolean; displayLevels: boolean }
): [null | { id: string; image: string }, (id: string | true) => void] {
  const [bagId, setBagId] = useState(String(randomInt(8000)));
  const _bagId = parseInt(bagId, 10);

  const updateBag = (id: string | true) => {
    if (id === true) {
      setBagId(randomBagId(guilds.map((guild) => guild.match)));
    } else {
      setBagId(id);
    }
  };

  if (isNaN(_bagId) || _bagId < 1 || _bagId > 8000) {
    return [null, updateBag];
  }

  const bag = {
    id: bagId,
    image: rarityImageFromItems(bags[_bagId - 1].items, {
      displayLevels: displayLevels && displayColors,
      colorFn({ itemName }) {
        if (!displayColors) {
          return "white";
        }
        for (const { match } of guilds) {
          if (match(itemName ?? "")) {
            return "cyan";
          }
        }
      },
    }),
  };

  return [bag, updateBag];
}
