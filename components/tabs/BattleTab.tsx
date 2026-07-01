"use client";



import { useState } from "react";

import { Game } from "@/components/Game";

import { KingdomMap } from "@/components/KingdomMap";



export function BattleTab() {

  const [showArena, setShowArena] = useState(false);



  if (showArena) {

    return (

      <div className="battle-tab">

        <button

          type="button"

          className="btn secondary battle-back"

          onClick={() => setShowArena(false)}

        >

          ← Back to Map

        </button>

        <Game embedded />

      </div>

    );

  }



  return (

    <div className="battle-tab">

      <KingdomMap />

      <button

        type="button"

        className="btn gold battle-enter"

        onClick={() => setShowArena(true)}

      >

        Enter the Arena

      </button>

    </div>

  );

}


