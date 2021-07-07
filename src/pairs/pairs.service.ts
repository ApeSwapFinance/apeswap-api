import { HttpService, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { getRoundedDate } from 'src/utils/date';
import { incentivizedPools } from 'src/utils/incentivizedPools';
import { GetCandleDataDto } from './pairs.dto';
import { poolBalance, swap } from './pairs.queries';
import { Candle, CandleDocument } from './schema/candle.schema';
import { PairHistory, PairHistoryDocument } from './schema/pair-history.schema';
import { Pair, PairDocument } from './schema/pair.schema';

@Injectable()
export class PairsService {
  private readonly logger = new Logger(PairsService.name);

  baseUrl = 'https://metamorphosis.chartex.pro/api/history';

  constructor(
    private httpService: HttpService,
    @InjectModel(Pair.name) private pairModel: Model<PairDocument>,
    @InjectModel(PairHistory.name)
    private pairHistoryModel: Model<PairHistoryDocument>,
    @InjectModel(Candle.name)
    private candleModel: Model<CandleDocument>,
  ) {}

  createPair(createDto) {
    return this.pairModel.create(createDto);
  }

  getPairs() {
    return this.pairModel.find();
  }

  // @Interval(60000)
  async processPairs() {
    const pairs = await this.getPairs();
    const promises = [];
    for (const pair of pairs) {
      promises.push(this.processPair(pair));
    }
    return Promise.all(promises);
  }

  async processPair(pair: PairDocument) {
    const price = await this.getPrice(pair.address, pair.base, pair.token);
    pair.latestPrice = price;
    await pair.save();
    return this.pairHistoryModel.create({
      pair: pair._id,
      symbol: pair.token,
      price,
      timestamp: getRoundedDate(1),
    });
  }

  async getSwaps(pairAddress: string) {
    const query = swap(pairAddress);
    const { data } = await this.httpService
      .post('https://graphql.bitquery.io', { query })
      .toPromise();
    return data.data.ethereum.smartContractEvents;
  }

  async getLiquidity(pairAddress: string) {
    const query = poolBalance(pairAddress);
    const { data } = await this.httpService
      .post('https://graphql.bitquery.io', { query })
      .toPromise();
    return data.data.ethereum.address[0].balances;
  }

  async getPrice(pairAddress: string, baseSymbol: string, pairSymbol: string) {
    const balance = await this.getLiquidity(pairAddress);
    const baseBalance = balance.find(
      ({ currency }) => currency.symbol === baseSymbol,
    );
    const pairBalance = balance.find(
      ({ currency }) => currency.symbol === pairSymbol,
    );
    return baseBalance.value / pairBalance.value;
  }

  // @Interval(60000)
  async processPairsCandles() {
    const pairs = await this.getPairs();
    const promises = [];
    for (const pair of pairs) {
      promises.push(this.processPairCandles(pair));
    }
    return Promise.all(promises);
  }

  async processPairCandles(pair: PairDocument) {
    const to = Math.floor(Date.now() / 1000);
    const candleData = await this.getParsedCandleData({
      address: pair.address,
      symbol: 'BSC_NONAME',
      base: pair.base,
      token: pair.token,
      resolution: 1,
      from: pair.latestTimestamp || 0,
      to,
    });
    if (candleData.length === 0) return;
    pair.latestPrice = candleData[candleData.length - 1].c;
    pair.latestTimestamp = to;
    await pair.save();
    const inserts = await this.candleModel.insertMany(candleData);
    this.logger.log(`Inserted ${inserts.length} new candles`);
  }

  async getParsedCandleData({
    symbol,
    token,
    base,
    address,
    resolution,
    from,
    to,
  }: GetCandleDataDto) {
    const candleData = await this.getCandleData({
      symbol,
      token,
      base,
      address,
      resolution,
      from,
      to,
    });
    const candles = [];
    for (let i = 0; i < candleData.c.length; i++) {
      const candle = {
        address,
        symbol: token,
        c: candleData.c[i],
        h: candleData.h[i],
        l: candleData.l[i],
        o: candleData.o[i],
        v: candleData.v[i],
        t: candleData.t[i],
      };
      candles.push(candle);
    }
    return candles;
  }

  async getCandleData({
    symbol,
    token,
    base,
    address,
    resolution,
    from,
    to,
  }: GetCandleDataDto) {
    console.log(from, to);
    // ?symbol=BSC_NONAME%3ABANANA%2FBUSD.0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914&resolution=60&from=1613486707&to=1613522707
    const url = `${this.baseUrl}?symbol=${symbol}:${token}/${base}.${address}&resolution=${resolution}&from=${from}&to=${to}`;
    console.log(url);
    const { data } = await this.httpService.get(url).toPromise();
    return data;
  }

  getIncentivizedPools() {
    return incentivizedPools.map((pool) => {
      return {
        address: pool.address,
        token: pool.rewardToken,
      };
    });
  }
}
