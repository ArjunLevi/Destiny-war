import { Attribution } from "ox/erc8021";

/** Base builder code — tracks txs in https://dashboard.base.org */
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BUILDER_CODE ?? "bc_k55zxdbo";

export const BUILDER_DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
});
