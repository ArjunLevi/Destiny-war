// Destiny War: Arena — MCP server (OPTIONAL).
//
// Exposes the onchain leaderboard as tools that AI agents (Claude, Cursor, etc.)
// can call. This is a standalone Node process, separate from the Next app.
//
// Run:
//   cd integrations/mcp-server
//   npm install
//   LEADERBOARD_ADDRESS=0xYourContract node index.mjs
//
// Then register it with your MCP client (stdio transport).

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createPublicClient, http, getAddress } from "viem";
import { base } from "viem/chains";

const LEADERBOARD_ADDRESS = process.env.LEADERBOARD_ADDRESS || "";

const abi = [
  {
    type: "function",
    name: "getAll",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "addrs", type: "address[]" },
      { name: "waves", type: "uint256[]" },
    ],
  },
  {
    type: "function",
    name: "bestWave",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });

function requireAddress() {
  if (!/^0x[a-fA-F0-9]{40}$/.test(LEADERBOARD_ADDRESS)) {
    throw new Error("Set LEADERBOARD_ADDRESS to the deployed contract address.");
  }
  return LEADERBOARD_ADDRESS;
}

const server = new McpServer({ name: "destiny-war-arena", version: "1.0.0" });

server.tool(
  "get_leaderboard",
  "Return the top Arena players and the highest wave they reached.",
  { limit: z.number().int().min(1).max(100).default(10) },
  async ({ limit }) => {
    const address = requireAddress();
    const [addrs, waves] = await client.readContract({ address, abi, functionName: "getAll" });
    const rows = addrs
      .map((a, i) => ({ player: a, wave: Number(waves[i]) }))
      .sort((a, b) => b.wave - a.wave)
      .slice(0, limit);
    return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
  }
);

server.tool(
  "get_player_best",
  "Return the best wave reached by a specific player address.",
  { player: z.string() },
  async ({ player }) => {
    const address = requireAddress();
    const wave = await client.readContract({
      address,
      abi,
      functionName: "bestWave",
      args: [getAddress(player)],
    });
    return { content: [{ type: "text", text: `Best wave: ${Number(wave)}` }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
