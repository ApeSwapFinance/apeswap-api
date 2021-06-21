import {
  Injectable,
  HttpService,
  Inject,
  CACHE_MANAGER,
  Logger,
} from '@nestjs/common';
import { BEP20_REWARD_APE_ABI } from 'src/stats/utils/abi/bep20RewardApeAbi';
import { InjectModel } from '@nestjs/mongoose';
import { GeneralStats } from 'src/interfaces/stats/generalStats.interface';
import { Cache } from 'cache-manager';
import { PriceService } from './price.service';
import { LP_ABI } from './utils/abi/lpAbi';
import { ERC20_ABI } from './utils/abi/erc20Abi';
import { getContract, getCurrentBlock } from 'src/utils/lib/web3';
import { incentivizedPools } from 'src/utils/incentivizedPools';
import {
  getParameterCaseInsensitive,
  createLpPairName,
} from 'src/utils/helpers';
import { multicall } from 'src/utils/lib/multicall';
import {
  masterApeContractWeb,
  bananaAddress,
  goldenBananaAddress,
  masterApeContractAddress,
  getBananaPriceWithPoolList,
  burnAddress,
  getPoolPrices,
  getWalletStatsForPools,
  getWalletStatsForFarms,
  getWalletStatsForIncentivizedPools,
} from './utils/stats.utils';
import { WalletStats } from 'src/interfaces/stats/walletStats.interface';
import { WalletInvalidHttpException } from './exceptions/wallet-invalid.execption';
import { Model } from 'mongoose';
import {
  GeneralStats as GeneralStatsDB,
  GeneralStatsDocument,
} from './schema/generalStats.schema';
import { SubgraphService } from './subgraph.service';
import { Cron } from '@nestjs/schedule';
import { BigNumber } from 'ethers';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  private readonly chainId = parseInt(process.env.CHAIN_ID);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
    @InjectModel(GeneralStatsDB.name)
    private generalStatsModel: Model<GeneralStatsDocument>,
    private subgraphService: SubgraphService,
    private priceService: PriceService,
  ) {}

  createGeneralStats(stats) {
    return this.generalStatsModel.create(stats);
  }
  findOne() {
    return this.generalStatsModel.findOne();
  }
  updateCreatedAtStats() {
    return this.generalStatsModel.updateOne(
      {},
      {
        $currentDate: {
          createdAt: true,
        },
      },
    );
  }
  cleanStats() {
    return this.generalStatsModel.deleteMany();
  }

  async verifyStats() {
    const now = Date.now();
    const stats: any = await this.findOne();
    if (!stats) return null;

    const lastCreatedAt = new Date(stats.createdAt).getTime();
    const diff = now - lastCreatedAt;
    const time = 300000; // 5 minutes

    if (diff > time) return null;

    return stats;
  }

  @Cron('0 50 * * * *')
  async loadDefistation() {
    if (this.chainId !== 56) return; // Only run on mainet
    try {
      if (!process.env.DEFISTATION_PASSWORD) return;
      this.logger.log('Loading Defistation');
      const statData = await this.getDefistationStats();
      const data = { test: false, bnb: 0, ...statData };
      const result = await this.httpService
        .post('https://api.defistation.io/dataProvider/tvl', data, {
          auth: {
            username: process.env.DEFISTATION_USER,
            password: process.env.DEFISTATION_PASSWORD,
          },
        })
        .toPromise();
      return result.data;
    } catch (e) {
      this.logger.error('Something went wrong loading defistation');
      this.logger.error(e);
      if (e.response) {
        this.logger.error(e.response.data);
      }
    }
  }

  async getDefistation() {
    if (!process.env.DEFISTATION_PASSWORD) return;
    const { data } = await this.httpService
      .get('https://api.defistation.io/dataProvider/tvl', {
        auth: {
          username: process.env.DEFISTATION_USER,
          password: process.env.DEFISTATION_PASSWORD,
        },
      })
      .toPromise();
    return data;
  }

  async getDefistationStats(): Promise<any> {
    const [allStats, summary] = await Promise.all([
      this.getAllStats(),
      this.subgraphService.getDailySummary(),
    ]);
    const { tvl, pools, farms, incentivizedPools } = allStats;
    const { volume, pairs } = summary;
    const data = { pools, farms, incentivizedPools, pairs };
    return { tvl, volume: parseInt(volume), data };
  }

  async getAllStats(): Promise<GeneralStats> {
    try {
      const poolPrices: GeneralStats = await this.getCalculateStats();
      poolPrices.incentivizedPools.forEach((pool) => {
        delete pool.abi;
      });
      return poolPrices;
    } catch (e) {
      this.logger.error('Something went wrong calculating stats');
      console.log(e);
    }
  }

  async getStatsForWallet(wallet): Promise<WalletStats> {
    try {
      const bananaContract = getContract(ERC20_ABI, bananaAddress());

      let walletStats: WalletStats = {
        tvl: 0,
        bananaPrice: 0,
        aggregateApr: 0,
        aggregateAprPerDay: 0,
        aggregateAprPerWeek: 0,
        aggregateAprPerMonth: 0,
        dollarsEarnedPerDay: 0,
        dollarsEarnedPerWeek: 0,
        dollarsEarnedPerMonth: 0,
        dollarsEarnedPerYear: 0,
        bananasEarnedPerDay: 0,
        bananasEarnedPerWeek: 0,
        bananasEarnedPerMonth: 0,
        bananasEarnedPerYear: 0,
        bananasInWallet: 0,
        pendingRewardUsd: 0,
        pendingRewardBanana: 0,
      };

      const [poolPrices, bananasInWallet] = await Promise.all([
        this.getCalculateStats(),
        this.getTokenBalanceOfAddress(bananaContract, wallet),
      ]);

      walletStats.bananaPrice = poolPrices.bananaPrice;
      walletStats.bananasInWallet = bananasInWallet;

      walletStats = await this.calculateWalletStats(
        walletStats,
        poolPrices,
        wallet,
      );

      return walletStats;
    } catch (error) {
      if (error.code == 'INVALID_ARGUMENT')
        throw new WalletInvalidHttpException();
      console.log(error);
      throw new Error(error.code);
    }
  }

  async getCalculateStats() {
    const cachedValue = await this.cacheManager.get('calculateStats');
    if (cachedValue) {
      this.logger.log('Hit calculateStats() cache');
      return cachedValue as GeneralStats;
    }

    const infoStats = await this.verifyStats();
    if (infoStats) return infoStats;

    await this.updateCreatedAtStats();
    this.calculateStats();
    const generalStats: any = await this.findOne();
    return generalStats;
  }

  async calculateStats() {
    const masterApeContract = masterApeContractWeb();

    const poolCount = parseInt(
      await masterApeContract.methods.poolLength().call(),
      10,
    );

    const poolInfos = await Promise.all(
      [...Array(poolCount).keys()].map(async (x) =>
        this.getPoolInfo(masterApeContract, x),
      ),
    );

    const [totalAllocPoints, prices, rewardsPerDay] = await Promise.all([
      masterApeContract.methods.totalAllocPoint().call(),
      this.priceService.getTokenPrices(),
      (((await masterApeContract.methods.cakePerBlock().call()) / 1e18) *
        86400) /
        3,
    ]);

    // If Banana price not returned from Subgraph, calculating using pools
    if (!prices[bananaAddress()]) {
      prices[bananaAddress()] = {
        usd: getBananaPriceWithPoolList(poolInfos, prices),
      };
    }

    // Set GoldenBanana Price = banana price / 0.72
    prices[goldenBananaAddress()] = {
      usd: prices[bananaAddress()].usd / 0.72,
    };

    const priceUSD = prices[bananaAddress()].usd;

    const [
      tokens,
      { burntAmount, totalSupply, circulatingSupply },
    ] = await Promise.all([this.getTokens(poolInfos), this.getBurnAndSupply()]);

    const poolPrices: GeneralStats = {
      bananaPrice: priceUSD,
      tvl: 0,
      totalLiquidity: 0,
      totalVolume: 0,
      burntAmount,
      totalSupply,
      circulatingSupply,
      marketCap: circulatingSupply * priceUSD,
      pools: [],
      farms: [],
      incentivizedPools: [],
    };

    for (let i = 0; i < poolInfos.length; i++) {
      if (poolInfos[i].poolToken) {
        getPoolPrices(
          tokens,
          prices,
          poolInfos[i].poolToken,
          poolPrices,
          i,
          poolInfos[i].allocPoints,
          totalAllocPoints,
          rewardsPerDay,
        );
      }
    }
    poolPrices.pools.forEach((pool) => {
      poolPrices.tvl += pool.stakedTvl;
    });

    await Promise.all([
      this.mappingIncetivizedPools(poolPrices, prices),
      this.getTVLData(poolPrices),
    ]);

    poolPrices.incentivizedPools.forEach((pool) => {
      if (!pool.t0Address) {
        poolPrices.tvl += pool.stakedTvl;
      }
    });

    await this.cacheManager.set('calculateStats', poolPrices, { ttl: 120 });
    this.logger.log('Remove last stats');
    await this.cleanStats();
    await this.createGeneralStats(poolPrices);

    return poolPrices;
  }

  async getPoolInfo(masterApeContract, poolIndex) {
    const poolInfo = await masterApeContract.methods.poolInfo(poolIndex).call();
    // Determine if Bep20 or Lp token
    const poolToken =
      poolIndex !== 0 && poolIndex !== 75
        ? await this.getLpInfo(poolInfo.lpToken, masterApeContractAddress())
        : await this.getTokenInfo(poolInfo.lpToken, masterApeContractAddress());

    return {
      address: poolInfo.lpToken,
      allocPoints: poolInfo.allocPoint ?? 1,
      poolToken,
      poolIndex,
      lastRewardBlock: poolInfo.lastRewardBlock,
    };
  }

  async getLpInfo(tokenAddress, stakingAddress) {
    const [reserves, decimals, token0, token1] = await multicall(LP_ABI, [
      {
        address: tokenAddress,
        name: 'getReserves',
      },
      {
        address: tokenAddress,
        name: 'decimals',
      },
      {
        address: tokenAddress,
        name: 'token0',
      },
      {
        address: tokenAddress,
        name: 'token1',
      },
    ]);

    let [totalSupply, staked] = await multicall(LP_ABI, [
      {
        address: tokenAddress,
        name: 'totalSupply',
      },
      {
        address: tokenAddress,
        name: 'balanceOf',
        params: [stakingAddress],
      },
    ]);

    totalSupply /= 10 ** decimals[0];
    staked /= 10 ** decimals[0];

    const q0 = reserves._reserve0;
    const q1 = reserves._reserve1;
    return {
      address: tokenAddress,
      token0: token0[0],
      q0,
      token1: token1[0],
      q1,
      totalSupply,
      stakingAddress,
      staked,
      decimals: decimals[0],
      tokens: [token0[0], token1[0]],
    };
  }

  async getTokenInfo(tokenAddress, stakingAddress) {
    if (tokenAddress == '0x0000000000000000000000000000000000000000') {
      return {
        address: tokenAddress,
        name: 'Binance',
        symbol: 'BNB',
        totalSupply: 1e8,
        decimals: 18,
        staked: 0,
        tokens: [tokenAddress],
      };
    }

    // HOTFIX for Rocket token (Rocket contract currently incompatible with ERC20_ABI)
    if (tokenAddress == '0x3bA5aee47Bb7eAE40Eb3D06124a74Eb89Da8ffd2') {
      const contract = getContract(
        LP_ABI,
        '0x93fa1A6357De25031311f784342c33A26Cb1C87A', // ROCKET-BNB LP pair address
      );
      const reserves = await contract.methods.getReserves().call();
      const q0 = reserves._reserve0 / 10 ** 18;

      return {
        address: tokenAddress,
        name: 'Rocket',
        symbol: 'ROCKET',
        totalSupply: 1000000000,
        decimals: 18,
        staked: q0,
        tokens: [tokenAddress],
      };
    }

    const [name, symbol, totalSupply, decimals, staked] = await multicall(
      ERC20_ABI,
      [
        {
          address: tokenAddress,
          name: 'name',
        },
        {
          address: tokenAddress,
          name: 'symbol',
        },
        {
          address: tokenAddress,
          name: 'totalSupply',
        },
        {
          address: tokenAddress,
          name: 'decimals',
        },
        {
          address: tokenAddress,
          name: 'balanceOf',
          params: [stakingAddress],
        },
      ],
    );

    return {
      address: tokenAddress,
      name: name[0],
      symbol: symbol[0],
      totalSupply: totalSupply[0],
      decimals: decimals[0],
      staked: staked[0] / 10 ** decimals[0],
      tokens: [tokenAddress],
    };
  }

  async getBurnAndSupply() {
    const bananaContract = getContract(ERC20_ABI, bananaAddress());

    const decimals = await bananaContract.methods.decimals().call();

    const [burned, supply] = await Promise.all([
      bananaContract.methods.balanceOf(burnAddress()).call(),
      bananaContract.methods.totalSupply().call(),
    ]);

    const burntAmount = burned / 10 ** decimals;
    const totalSupply = supply / 10 ** decimals;
    const circulatingSupply = totalSupply - burntAmount;

    return {
      burntAmount,
      totalSupply,
      circulatingSupply,
    };
  }

  async getTokens(poolInfos) {
    const tokens = {};
    // eslint-disable-next-line prefer-spread
    const tokenAddresses = [].concat.apply(
      [],
      poolInfos.filter((x) => x.poolToken).map((x) => x.poolToken.tokens),
    );

    await Promise.all(
      tokenAddresses.map(async (address) => {
        tokens[address] = await this.getTokenInfo(
          address,
          masterApeContractAddress(),
        );
      }),
    );

    return tokens;
  }
  async mappingIncetivizedPools(poolPrices, prices) {
    const currentBlockNumber = await getCurrentBlock();
    const incentivized = await this.fetchPoolsStrapi();
    poolPrices.incentivizedPools = await Promise.all(
      incentivized.map(async (pool) =>
        this.getIncentivizedPoolInfo(pool, prices, currentBlockNumber),
      ),
    );
    poolPrices.incentivizedPools = poolPrices.incentivizedPools.filter(
      (x) => x,
    ); //filter null pools
  }

  async getIncentivizedPoolInfo(pool, prices, currentBlockNumber) {
    const active =
      pool.startBlock <= currentBlockNumber &&
      pool.bonusEndBlock >= currentBlockNumber;
    const poolContract = getContract(pool.abi, pool.address);

    if (pool.stakeTokenIsLp) {
      const [
        reserves,
        stakedTokenDecimals,
        t0Address,
        t1Address,
      ] = await multicall(LP_ABI, [
        {
          address: pool.stakeToken,
          name: 'getReserves',
        },
        {
          address: pool.stakeToken,
          name: 'decimals',
        },
        {
          address: pool.stakeToken,
          name: 'token0',
        },
        {
          address: pool.stakeToken,
          name: 'token1',
        },
      ]);

      const rewardTokenContract = getContract(ERC20_ABI, pool.rewardToken);
      const rewardDecimals = await rewardTokenContract.methods
        .decimals()
        .call();

      const [
        token0decimals,
        token1decimals,
        rewardTokenSymbol,
        t0Symbol,
        t1Symbol,
      ] = await multicall(ERC20_ABI, [
        {
          address: t0Address[0],
          name: 'decimals',
        },
        {
          address: t1Address[0],
          name: 'decimals',
        },
        {
          address: pool.rewardToken,
          name: 'symbol',
        },
        {
          address: t0Address[0],
          name: 'symbol',
        },
        {
          address: t1Address[0],
          name: 'symbol',
        },
      ]);

      let [totalSupply, stakedSupply] = await multicall(LP_ABI, [
        {
          address: pool.stakeToken,
          name: 'totalSupply',
        },
        {
          address: pool.stakeToken,
          name: 'balanceOf',
          params: [pool.address],
        },
      ]);

      totalSupply = totalSupply / 10 ** stakedTokenDecimals[0];
      stakedSupply = stakedSupply / 10 ** stakedTokenDecimals[0];
      const rewardsPerBlock =
        (await poolContract.methods.rewardPerBlock().call()) /
        10 ** rewardDecimals;

      const q0 = reserves._reserve0 / 10 ** token0decimals[0];
      const q1 = reserves._reserve1 / 10 ** token1decimals[0];

      let p0 = getParameterCaseInsensitive(prices, t0Address[0])?.usd;
      let p1 = getParameterCaseInsensitive(prices, t1Address[0])?.usd;

      if (p0 == null && p1 == null) {
        return undefined;
      }
      if (p0 == null) {
        p0 = (q1 * p1) / q0;
        prices[t0Address[0]] = { usd: p0 };
      }
      if (p1 == null) {
        p1 = (q0 * p0) / q1;
        prices[t1Address[0]] = { usd: p1 };
      }

      const tvl = q0 * p0 + q1 * p1;
      const stakedTvl = (stakedSupply * tvl) / totalSupply;

      const rewardTokenPrice = getParameterCaseInsensitive(
        prices,
        pool.rewardToken,
      )?.usd;
      const apr = active
        ? (rewardTokenPrice * ((rewardsPerBlock * 86400) / 3) * 365) / stakedTvl
        : 0;

      return {
        id: pool.sousId,
        name: createLpPairName(t0Symbol[0], t1Symbol[0]),
        address: pool.address,
        active,
        blocksRemaining: active ? pool.bonusEndBlock - currentBlockNumber : 0,
        stakedTokenAddress: pool.stakeToken,
        t0Address: t0Address[0],
        t0Symbol: t0Symbol[0],
        p0,
        q0,
        t1Address: t1Address[0],
        t1Symbol: t1Symbol[0],
        p1,
        q1,
        totalSupply,
        stakedSupply,
        rewardDecimals,
        stakedTokenDecimals: stakedTokenDecimals[0],
        tvl,
        stakedTvl,
        apr,
        rewardTokenPrice,
        rewardTokenSymbol: rewardTokenSymbol[0],
        price: tvl / totalSupply,
        abi: pool.abi,
      };
    } else {
      let stakedTokenPrice = getParameterCaseInsensitive(
        prices,
        pool.stakeToken,
      )?.usd;

      // If token is not trading on DEX, assign price = 0
      if (isNaN(stakedTokenPrice)) {
        stakedTokenPrice = 0;
      }

      let rewardTokenPrice = getParameterCaseInsensitive(
        prices,
        pool.rewardToken,
      )?.usd;

      // If token is not trading on DEX, assign price = 0
      if (isNaN(rewardTokenPrice)) {
        rewardTokenPrice = 0;
      }

      const [
        name,
        stakedTokenDecimals,
        rewardDecimals,
        rewardTokenSymbol,
      ] = await multicall(ERC20_ABI, [
        {
          address: pool.stakeToken,
          name: 'symbol',
        },
        {
          address: pool.stakeToken,
          name: 'decimals',
        },
        {
          address: pool.rewardToken,
          name: 'decimals',
        },
        {
          address: pool.rewardToken,
          name: 'symbol',
        },
      ]);

      let [totalSupply, stakedSupply] = await multicall(ERC20_ABI, [
        {
          address: pool.stakeToken,
          name: 'totalSupply',
        },
        {
          address: pool.stakeToken,
          name: 'balanceOf',
          params: [pool.address],
        },
      ]);
      totalSupply = totalSupply / 10 ** stakedTokenDecimals[0];
      stakedSupply = stakedSupply / 10 ** stakedTokenDecimals[0];
      const rewardsPerBlock =
        (await poolContract.methods.rewardPerBlock().call()) /
        10 ** rewardDecimals[0];
      const tvl = totalSupply * stakedTokenPrice;
      const stakedTvl = (stakedSupply * tvl) / totalSupply;

      let apr = 0;
      if (active && stakedTokenPrice != 0) {
        apr =
          (rewardTokenPrice * ((rewardsPerBlock * 86400) / 3) * 365) /
          stakedTvl;
      }

      return {
        id: pool.sousId,
        name: name[0],
        address: pool.address,
        active,
        blocksRemaining: active ? pool.bonusEndBlock - currentBlockNumber : 0,
        rewardTokenAddress: pool.rewardToken,
        stakedTokenAddress: pool.stakeToken,
        totalSupply,
        stakedSupply,
        rewardDecimals: rewardDecimals[0],
        stakedTokenDecimals: stakedTokenDecimals[0],
        tvl,
        stakedTvl,
        apr,
        rewardTokenPrice,
        rewardTokenSymbol: rewardTokenSymbol[0],
        price: stakedTokenPrice,
        abi: pool.abi,
      };
    }
  }

  async getTVLData(poolPrices): Promise<any> {
    const {
      liquidity,
      totalVolume,
    } = await this.subgraphService.getVolumeData();
    poolPrices.tvl += liquidity;
    poolPrices.totalLiquidity += liquidity;
    poolPrices.totalVolume += totalVolume;
  }

  async getTokenBalanceOfAddress(tokenContract, address): Promise<any> {
    const decimals = await tokenContract.methods.decimals().call();
    return (
      (await tokenContract.methods.balanceOf(address).call()) / 10 ** decimals
    );
  }

  async calculateWalletStats(walletStats: WalletStats, poolPrices, wallet) {
    const masterApeContract = masterApeContractWeb();
    let totalApr = 0;

    const [pools, farms, incentivezed] = await Promise.all([
      getWalletStatsForPools(wallet, poolPrices.pools, masterApeContract),
      getWalletStatsForFarms(wallet, poolPrices.farms, masterApeContract),
      getWalletStatsForIncentivizedPools(wallet, poolPrices.incentivizedPools),
    ]);
    walletStats.pools = pools;
    walletStats.farms = farms;
    walletStats.incentivizedPools = incentivezed;

    walletStats.pools.forEach((pool) => {
      walletStats.pendingRewardUsd += pool.pendingRewardUsd;
      walletStats.pendingRewardBanana += pool.pendingReward;
      walletStats.dollarsEarnedPerDay += pool.dollarsEarnedPerDay;
      walletStats.dollarsEarnedPerWeek += pool.dollarsEarnedPerWeek;
      walletStats.dollarsEarnedPerMonth += pool.dollarsEarnedPerMonth;
      walletStats.dollarsEarnedPerYear += pool.dollarsEarnedPerYear;
      walletStats.bananasEarnedPerDay += pool.tokensEarnedPerDay;
      walletStats.bananasEarnedPerWeek += pool.tokensEarnedPerWeek;
      walletStats.bananasEarnedPerMonth += pool.tokensEarnedPerMonth;
      walletStats.bananasEarnedPerYear += pool.tokensEarnedPerYear;
      walletStats.tvl += pool.stakedTvl;
      totalApr += pool.stakedTvl * pool.apr;
    });

    walletStats.farms.forEach((farm) => {
      walletStats.pendingRewardUsd += farm.pendingRewardUsd;
      walletStats.pendingRewardBanana += farm.pendingReward;
      walletStats.dollarsEarnedPerDay += farm.dollarsEarnedPerDay;
      walletStats.dollarsEarnedPerWeek += farm.dollarsEarnedPerWeek;
      walletStats.dollarsEarnedPerMonth += farm.dollarsEarnedPerMonth;
      walletStats.dollarsEarnedPerYear += farm.dollarsEarnedPerYear;
      walletStats.bananasEarnedPerDay += farm.tokensEarnedPerDay;
      walletStats.bananasEarnedPerWeek += farm.tokensEarnedPerWeek;
      walletStats.bananasEarnedPerMonth += farm.tokensEarnedPerMonth;
      walletStats.bananasEarnedPerYear += farm.tokensEarnedPerYear;
      walletStats.tvl += farm.stakedTvl;
      totalApr += farm.stakedTvl * farm.apr;
    });

    walletStats.incentivizedPools.forEach((incentivizedPool) => {
      walletStats.pendingRewardUsd += incentivizedPool.pendingRewardUsd;
      walletStats.dollarsEarnedPerDay += incentivizedPool.dollarsEarnedPerDay;
      walletStats.dollarsEarnedPerWeek += incentivizedPool.dollarsEarnedPerWeek;
      walletStats.dollarsEarnedPerMonth +=
        incentivizedPool.dollarsEarnedPerMonth;
      walletStats.dollarsEarnedPerYear += incentivizedPool.dollarsEarnedPerYear;
      walletStats.tvl += incentivizedPool.stakedTvl;
      totalApr += incentivizedPool.stakedTvl * incentivizedPool.apr;
    });

    walletStats.aggregateApr = walletStats.tvl ? totalApr / walletStats.tvl : 0;
    walletStats.aggregateAprPerDay = walletStats.aggregateApr / 365;
    walletStats.aggregateAprPerWeek = (walletStats.aggregateApr * 7) / 365;
    walletStats.aggregateAprPerMonth = (walletStats.aggregateApr * 30) / 365;

    return walletStats;
  }

  async fetchPoolsStrapi() {
    try {
      const result = await this.httpService
        .get('https://apeswap-strapi.herokuapp.com/pools')
        .toPromise();
      const data = [];
      for (let index = 0; index < result.data.length; index++) {
        const pool = result.data[index];
        if (pool.startBlock) {
          data.push({
            sousId: Number(pool.sousId),
            rewardToken: pool.rewardToken,
            name: pool.tokenName,
            address: pool.contractAddress[this.chainId],
            stakeToken: pool.stakingTokenAddress[this.chainId],
            stakeTokenIsLp: pool.lpStaking,
            rewardPerBlock: this.calculateTokenPerBlock(pool),
            startBlock: pool.startBlock,
            bonusEndBlock: pool.endBlock,
            abi: this.getRewardApeAbi(pool.abi),
          });
        }
      }
      return data;
    } catch (error) {
      return incentivizedPools;
    }
  }

  getRewardApeAbi(abi) {
    switch (abi) {
      case 'bep20RewardApeAbi':
        return BEP20_REWARD_APE_ABI;
        break;
      default:
        return BEP20_REWARD_APE_ABI;
    }
  }

  calculateTokenPerBlock(pool) {
    const decimals = BigNumber.from(10).pow(pool.tokenDecimals).toString();
    return Number(decimals) * pool.tokenPerBlock;
  }
}
