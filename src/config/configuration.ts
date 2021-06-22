export default () => ({
  mongo_uri: process.env.MONGO_URL,
  environment: process.env.NODE_ENV,
  chainId: process.env.CHAIN_ID || 97,
  97: {
    lottery: {
      address: '0xe42Ff4758C37ccC3A54004b176384477bbBe70D6',
      adminAddress: '0xb5e1Ec9861D7c1C99cB3d79dd602cC6122F0d7dc',
      adminKey: process.env.LOTTERY_ADMIN_KEY,
    },
    contracts: {
      masterApe: '0xAf1B22cBDbB502B2089885bcd230255f8B80243b',
      banana: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
      goldenBanana: '0x9407026d236deae22cc1f3c419a9e47cbfcfe9e5',
      bnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      bananaBusd: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
      bananaBnb: '0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713',
      burn: '0x000000000000000000000000000000000000dead',
      mulltiCall: '0x67ADCB4dF3931b0C5Da724058ADC2174a9844412',
    },
    appNodes: [
      'https://data-seed-prebsc-2-s2.binance.org:8545',
      'https://data-seed-prebsc-2-s2.binance.org:8545',
      'https://data-seed-prebsc-2-s2.binance.org:8545',
    ],
  },
  56: {
    lottery: {
      address: '0x451bCf562A4d747da3455bBAFACe988d56dA6D83',
      adminAddress: '0xCaE366497aC10De7f1faeBBf496E7dBD7764C6b3',
      adminKey: process.env.LOTTERY_ADMIN_KEY,
    },
    contracts: {
      masterApe: '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9',
      banana: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
      goldenBanana: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
      bnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      bananaBusd: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
      bananaBnb: '0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713',
      burn: '0x000000000000000000000000000000000000dead',
      mulltiCall: '0x38ce767d81de3940CFa5020B55af1A400ED4F657',
    },
    appNodes: [
      'https://bsc-dataseed.binance.org:443',
      'https://bsc-dataseed1.defibit.io:443',
      'https://bsc-dataseed1.ninicoin.io:443',
      /* 'https://bsc-dataseed2.ninicoin.io:443',
      'https://bsc-dataseed3.ninicoin.io:443',
      'https://bsc-dataseed4.ninicoin.io:443',
      'https://bsc-dataseed2.defibit.io:443',
      'https://bsc-dataseed3.defibit.io:443',
      'https://bsc-dataseed4.defibit.io:443',
      'https://bsc-dataseed1.binance.org:443',
      'https://bsc-dataseed2.binance.org:443',
      'https://bsc-dataseed3.binance.org:443',
      'https://bsc-dataseed4.binance.org:443', */
    ],
  },
});
