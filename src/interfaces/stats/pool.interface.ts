export interface PoolStats {
  readonly address: string;
  readonly apr: number;
  readonly decimals: string;
  readonly lpSymbol: string;
  readonly poolIndex: number;
  readonly price: number;
  readonly rewardTokenPrice: number;
  readonly rewardTokenSymbol: string;
  readonly staked: number;
  readonly stakedTvl: number;
  readonly tvl: number;
}
