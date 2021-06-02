import { Injectable, Logger, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { TradeSeason, TradeSeasonDocument } from './schema/trade-season.schema';
import { TradingStats, TradingStatsDocument } from './schema/trading.schema';
import {
  TradingTodayStats,
  TradingTodayStatsDocument,
} from './schema/trading-stats-today.schema';
import { SubgraphService } from '../stats/subgraph.service';
@Injectable()
export class TradingService {
  logger = new Logger(TradingService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private subgraphService: SubgraphService,
    @InjectModel(TradingStats.name)
    private tradingStatsModel: Model<TradingStatsDocument>,
    @InjectModel(TradeSeason.name)
    private tradeSeasonModel: Model<TradeSeasonDocument>,
    @InjectModel(TradingTodayStats.name)
    private tradingTodayStatsModel: Model<TradingTodayStatsDocument>,
  ) {}
  currentSeason = 0;
  querySplit = 10;
  processingTimestamps = {};
  lastUpdateTimestamp = 0;

  async getSeasonPairs() {
    const config = await this.tradeSeasonModel.find({
      season: this.currentSeason,
      processed: { $ne: true },
      finished: { $ne: true },
    });
    return config;
  }

  // @Interval(50000) @Cron('59 59 23 * * *')
  @Interval(50000)
  async loadTradingActivity() {
    this.logger.log('Load trading activity');
    const seasonPairs = await this.getSeasonPairs();
    for (const pairConfig of seasonPairs) {
      this.loadSeasonData(pairConfig);
    }
  }

  async loadSeasonData(pairConfig) {
    const {
      startTimestamp,
      endTimestamp,
      season,
      pair,
      latestTimestamp,
      usdPerBanana,
    } = pairConfig;
    const key = season + pair;
    if (this.processingTimestamps[key]) {
      this.logger.log(`Timestamp already being processed ${key}`);
      return;
    }

    if (this.isFinished(endTimestamp)) return;
    await this.cleanDataTradingSeason(pair, season);
    const startTime =
      latestTimestamp > startTimestamp ? latestTimestamp : startTimestamp;
    const timestamps = this.slpitTimestamp(
      startTime,
      endTimestamp,
      this.querySplit,
    );
    try {
      for (let i = 0; i < timestamps.length - 1; i++) {
        this.processingTimestamps[key] = true;
        await this.processInterval(
          pair,
          timestamps[i + 1],
          timestamps[i],
          season,
          usdPerBanana,
          pairConfig,
        );
      }

      delete this.processingTimestamps[key];
      this.calculateAndCachedTrading(pair, season);
      pairConfig.latestTimestamp = 0;
      pairConfig.lastUpdateTimestamp = this.lastUpdateTimestamp;
      await pairConfig.save();
      console.timeEnd('process');
    } catch (e) {
      this.logger.error(
        `Failed loading data for ${pair} from ${startTimestamp}`,
      );
      this.logger.error(e);
      delete this.processingTimestamps[key];
      console.timeEnd('process');
    }
  }

  private async processInterval(
    pair: any,
    endTimestamp: any,
    startTime: any,
    season: any,
    usdPerBanana: any,
    pairConfig: any,
  ) {
    this.logger.log(
      `Fetching pair ${pair} from ${startTime} to ${endTimestamp}`,
    );
    const userPairDayData = await this.subgraphService.getUserDailyPairData(
      pair,
      startTime,
      endTimestamp,
    );
    if (userPairDayData.length) {
      this.logger.log(
        `${userPairDayData.length} swaps found for given timestamp`,
      );
      const latestTimestamp = userPairDayData[userPairDayData.length - 1].date;
      await this.bulkUpdate(
        userPairDayData,
        season,
        usdPerBanana,
        this.tradingStatsModel,
      );
      pairConfig.latestTimestamp = latestTimestamp;
      await pairConfig.save();
    } else {
      const currentTimestamp = this.getCurrentTimestamp();
      // tolerance for up to 3 hour delay
      const testTimestamp = endTimestamp + 3 * 60 * 60;

      if (currentTimestamp > testTimestamp) {
        this.logger.log(
          `Finished processing season: ${season} for pair: ${pair}`,
        );
        pairConfig.processed = true;
        await pairConfig.save();
      }
    }
    return userPairDayData;
  }

  getCurrentTimestamp() {
    return Math.round(new Date().getTime() / 1000);
  }

  slpitTimestamp(start, end, amount) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59);
    const yTime = Math.floor(yesterday.getTime() / 1000);
    const endTime = yTime > end ? end : yTime;
    this.lastUpdateTimestamp = endTime;

    const interval = Math.ceil((endTime - start) / (amount - 1));
    const timeframes = [start];

    for (let i = 0; i < amount - 1; i++) {
      const time = timeframes[i];
      const frame = time + interval;
      const efectiveFrame = frame < endTime ? frame : endTime;
      timeframes.push(efectiveFrame);
    }
    return timeframes;
  }

  bulkUpdate(items, season, usdPerBanana, model) {
    const bulkUpdate = model.collection.initializeUnorderedBulkOp();
    for (const item of items) {
      const onInsert = {
        address: item.user.id,
        pair: item.pair.id,
        season: Number(season),
      };
      const volume = parseFloat(item.dailyVolumeUSD);
      const rewards = volume / usdPerBanana;
      const inc = { totalTradedUsd: volume, pendingBananaRewards: rewards };
      if (item !== null) {
        bulkUpdate
          .find({
            address: onInsert.address,
            pair: onInsert.pair,
            season: onInsert.season,
          })
          .upsert()
          .updateOne({
            $inc: inc,
            $setOnInsert: onInsert,
          });
      }
    }
    return bulkUpdate.execute();
  }

  async getPairLeaderBoard(pair: string, season: number) {
    const cachedValue = await this.cacheManager.get('tradingStats');
    if (cachedValue) {
      this.logger.log('Hit tradingStats cache');
      return cachedValue as TradingStatsDocument[];
    }
    return this.getTopTrading(pair, season);
  }

  async getPairAddressStats(pair: string, address: string, season: number) {
    const config = await this.getTradeSeason(pair, season);
    const pastData = await this.tradingStatsModel.findOne({
      pair,
      season,
      address,
    });
    const todayData = await this.tradingTodayStatsModel.findOne({
      pair,
      season,
      address,
    });

    if (!pastData && !todayData) return null;

    const pastTrade = pastData?.totalTradedUsd || 0;
    const todayTrade = todayData?.totalTradedUsd || 0;
    const volume = Number(pastTrade) + Number(todayTrade);
    const rewards = volume / config.usdPerBanana;

    return {
      account: address,
      pair: pair,
      season: season,
      pendingBananaRewards: rewards,
      totalTradedUsd: volume,
    };
  }

  async getUserCurrentPairData(config, address, pastData) {
    const currentData = await this.subgraphService.getUserCurrentPairData(
      config.pair,
      config.lastUpdateTimestamp + 1,
      Math.floor(new Date().getTime() / 1000),
      address,
    );

    let totalTrade = pastData?.totalTradedUsd || 0;

    for (let index = 0; index < currentData.length; index++) {
      const current = currentData[index];
      totalTrade += parseFloat(current.dailyVolumeUSD);
    }

    const volume = parseFloat(totalTrade);
    const rewards = volume / config.usdPerBanana;

    return {
      account: pastData?.account || address,
      pair: config.pair,
      season: config.season,
      pendingBananaRewards: rewards,
      totalTradedUsd: totalTrade,
    };
  }

  isFinished(endTimestamp) {
    const currentTime = this.getCurrentTimestamp();
    if (endTimestamp < currentTime) return true;
    return false;
  }

  async getTradeSeason(pair, season) {
    return await this.tradeSeasonModel.findOne({
      season: season,
      pair: pair,
    });
  }

  async calculateAndCachedTrading(pair, season) {
    const tradingStats = await this.tradingStatsModel
      .find({ pair, season })
      .sort({ totalTradedUsd: -1 })
      .limit(100);
    await this.cacheManager.set('tradingStats', tradingStats, { ttl: 600 });
  }

  // @Interval(600000) // 600000 every 10 minutes
  async calculateTodayTrading() {
    this.logger.log('hit calculate today trading');
    const config = await this.tradeSeasonModel.findOne({
      season: this.currentSeason,
      finished: { $ne: true },
    });
    if (!config) return;
    const { pair, season } = config;
    await this.cleanDataToday(pair, season);
    const currentTime = this.getCurrentTimestamp();
    console.time('today');
    const userPairDayData = await this.subgraphService.getUserDailyPairData(
      pair,
      config.lastUpdateTimestamp + 1,
      currentTime,
    );
    console.timeEnd('today');
    if (userPairDayData?.length > 0) {
      console.time('bulk');
      await this.bulkUpdate(
        userPairDayData,
        season,
        config.usdPerBanana,
        this.tradingTodayStatsModel,
      );
      console.timeEnd('bulk');
    }
  }

  async getTopTrading(pair, season) {
    const config = await this.getTradeSeason(pair, season);
    const tradingTodayStats = await this.tradingTodayStatsModel
      .find({ pair, season })
      .sort({ totalTradedUsd: -1 });
    if (tradingTodayStats.length === 0) {
      const tradingStats = await this.tradingStatsModel
        .find({ pair, season })
        .sort({ totalTradedUsd: -1 })
        .limit(100);
      await this.cacheManager.set('tradingStats', tradingStats, { ttl: 600 });
      return tradingStats;
    }
    const tradingStats = await this.tradingStatsModel
      .find({ pair, season })
      .sort({ totalTradedUsd: -1 });

    console.time('calculating');
    for (let index = 0; index < tradingStats.length; index++) {
      const trading = tradingStats[index];
      const idx = tradingTodayStats.findIndex(
        (el) => el.address === trading.address,
      );
      if (idx !== -1) {
        tradingStats[index].totalTradedUsd +=
          tradingTodayStats[idx].totalTradedUsd;
        const reward = tradingStats[index].totalTradedUsd / config.usdPerBanana;
        tradingStats[index].pendingBananaRewards = reward;
        tradingTodayStats.splice(idx, 1);
      }
    }
    let combined = [...tradingStats, ...tradingTodayStats];
    combined.sort((a, b) => {
      if (a.totalTradedUsd < b.totalTradedUsd) return 1;
      else return -1;
    });

    if (combined.length > 100) combined = combined.slice(0, 100);
    console.timeEnd('calculating');
    await this.cacheManager.set('tradingStats', combined, { ttl: 600 });
    return combined;
  }
  async cleanDataToday(pair, season) {
    await this.tradingTodayStatsModel.deleteMany({ pair, season });
  }

  async cleanDataTradingSeason(pair, season) {
    await this.tradingStatsModel.deleteMany({ pair, season });
  }
}