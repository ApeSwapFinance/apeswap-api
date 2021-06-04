import { BEP20_REWARD_APE_ABI } from 'src/stats/utils/abi/bep20RewardApeAbi';

export const incentivizedPools = [
  {
    sousId: 1,
    name: 'BANANA -> BNB Reward Pool',
    address: '0x0245c697a96045183048cdf18e9abae5b2237ff6',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    rewardPerBlock: 694444400000000,
    startBlock: 5034880,
    bonusEndBlock: 5178877,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 2,
    name: 'SOUL/BANANA LP -> SOUL Reward Pool',
    address: '0xf5Cb9F954D3Ea26Bb503A6996a4b2B0aAdC8c969',
    stakeToken: '0xa48271fF51900007D3b21Cecf30FDc8CCb63fEe6',
    stakeTokenIsLp: true,
    rewardToken: '0x67d012F731c23F0313CEA1186d0121779c77fcFE',
    rewardPerBlock: 135800000000,
    startBlock: 5511250,
    bonusEndBlock: 5604850,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 3,
    name: 'SOUL/BANANA LP -> SOUL Reward Pool',
    address: '0x82576dB7685418CBDD5A9f4721D605C125E4569c',
    stakeToken: '0xa48271fF51900007D3b21Cecf30FDc8CCb63fEe6',
    stakeTokenIsLp: true,
    rewardToken: '0x67d012F731c23F0313CEA1186d0121779c77fcFE',
    rewardPerBlock: 39600000000,
    startBlock: 5602450,
    bonusEndBlock: 5857050,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 4,
    name: 'NUTS/BANANA LP -> NUTS Reward Pool',
    address: '0x3523cE00C9f82FfafC850C0Acccb78341239028b',
    stakeToken: '0x44Baf117d79D5313BeA1fBBA416E4067436E4bBE',
    stakeTokenIsLp: true,
    rewardToken: '0x8893D5fA71389673C5c4b9b3cb4EE1ba71207556',
    rewardPerBlock: 86805555560000000,
    startBlock: 5629403,
    bonusEndBlock: 5658203,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 5,
    name: 'NUTS/BANANA LP -> BANANA Reward Pool',
    address: '0xdb28A11Fe950C9979A8050E6cBA76D187D5C3b70',
    stakeToken: '0x44Baf117d79D5313BeA1fBBA416E4067436E4bBE',
    stakeTokenIsLp: true,
    rewardToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    rewardPerBlock: 144652777800000000,
    startBlock: 5658203,
    bonusEndBlock: 5687003,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 6,
    name: 'CRX/BANANA LP -> CRX Reward Pool',
    address: '0x084beaa501dB448869001BA49913c9aD009b1694',
    stakeToken: '0xbD896f59BAf9A624A7587DE5D28B7aD3459342bA',
    stakeTokenIsLp: true,
    rewardToken: '0x97a30C692eCe9C317235d48287d23d358170FC40',
    rewardPerBlock: 2604166666667000,
    startBlock: 5682212,
    bonusEndBlock: 5826212,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 7,
    name: 'NAUT/BNB LP -> NAUT Reward Pool',
    address: '0x114d54e18eb4A7Dc9bB8280e283E5799D4188E3f',
    stakeToken: '0x288EA5437c7aaD045a393cee2F41E548df24d1C8',
    stakeTokenIsLp: true,
    rewardToken: '0x05B339B0A346bF01f851ddE47a5d485c34FE220c',
    rewardPerBlock: '28935185',
    startBlock: 5720710,
    bonusEndBlock: 6584710,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 8,
    name: 'NUTS/BANANA LP -> NUTZ Reward Pool',
    address: '0x6Fd37f3F83F11100f9f501e2690E96F6fAC37E94',
    stakeToken: '0x44Baf117d79D5313BeA1fBBA416E4067436E4bBE',
    stakeTokenIsLp: true,
    rewardToken: '0x8893D5fA71389673C5c4b9b3cb4EE1ba71207556',
    rewardPerBlock: '24965277777778000',
    startBlock: 5744527,
    bonusEndBlock: 5946127,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 10,
    name: 'HPS/BANANA LP -> HPS Reward Pool',
    address: '0x9c64Cec2Ad86E918929665cF9AADf91cd755fEf1',
    stakeToken: '0x268f002A3B8d2faC2aA2bA6D4B90d519ca0d1d46',
    stakeTokenIsLp: true,
    rewardToken: '0xeDa21B525Ac789EaB1a08ef2404dd8505FfB973D',
    rewardPerBlock: '14880952380952000',
    startBlock: 5850334,
    bonusEndBlock: 6253534,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 11,
    name: 'BRICK/BANANA LP -> BRICK Reward Pool',
    address: '0x6B7254AdfCa2178B7065b4B57fDc452c405DFC8A',
    stakeToken: '0x51A9771708d0471A0E592e8feBB2C6b868e3d99B',
    stakeTokenIsLp: true,
    rewardToken: '0xc4DaA5a9f2B832eD0f9Bc579662883cD53EA9d61',
    rewardPerBlock: '2976190476190476000',
    startBlock: 5878788,
    bonusEndBlock: 6080388,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 12,
    name: 'JDI/BNB LP -> JDI Reward Pool',
    address: '0x7336B60aC64a5Bf04Eec760bD135ea105994387C',
    stakeToken: '0xfb6063f29af6dcd1fc03a8e221c6d91deabbe764',
    stakeTokenIsLp: true,
    rewardToken: '0x0491648c910ad2c1afaab733faf71d30313df7fc',
    rewardPerBlock: '77160493827160000',
    startBlock: 6206295,
    bonusEndBlock: 11390295,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 13,
    name: 'BANANA -> FOXY Reward Pool',
    address: '0x6C7f290472766ad3e50D6E405B84ef8497C369d9',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0x4354a4f710182966e55ea30cfa807fa1b821a67b',
    rewardPerBlock: '57870370',
    startBlock: 6346011,
    bonusEndBlock: 7210011,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 13,
    name: 'BANANA -> FOXY Reward Pool',
    address: '0x726d5A4D170425C98BAff117BF3d9aF9f77f80bd',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0x4354a4f710182966e55ea30cfa807fa1b821a67b',
    rewardPerBlock: '57870370',
    startBlock: 6348011,
    bonusEndBlock: 7212011,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 14,
    name: 'BANANA -> JDI Reward Pool',
    address: '0x72C8750af0744282E065F0dF3F73460A3764c624',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0x0491648C910ad2c1aFaab733faF71D30313Df7FC',
    rewardPerBlock: '115640358485111000',
    startBlock: 6401695,
    bonusEndBlock: 9860695,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 16,
    name: 'BANANA -> LYPTUS Reward Pool',
    address: '0x1900f5370830F0aa46DF76a6a4F0656Ef321b9f8',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0xBA26397cdFF25F0D26E815d218Ef3C77609ae7f1',
    rewardPerBlock: '34722222222222000',
    startBlock: 6427200,
    bonusEndBlock: 8164258,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 17,
    name: 'BANANA -> SWAMP Reward Pool',
    address: '0xA007a5a8165D70DdFBC230927Cd639163228Fc72',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0xc5A49b4CBe004b6FD55B30Ba1dE6AC360FF9765d',
    rewardPerBlock: '479442180800000',
    startBlock: 6680032,
    bonusEndBlock: 8408032,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 18,
    name: 'NAUT/BNB -> NAUT Reward Pool',
    address: '0x330de89a559a75738acB5b87aE93579120d53AfB',
    stakeToken: '0x288EA5437c7aaD045a393cee2F41E548df24d1C8',
    stakeTokenIsLp: true,
    rewardToken: '0x05b339b0a346bf01f851dde47a5d485c34fe220c',
    rewardPerBlock: '4960317',
    startBlock: 6658428,
    bonusEndBlock: 7061628,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 19,
    name: 'BANANA -> ALLOY Reward Pool',
    address: '0x834534853bff9C97F8A9b0fb9FFF864E3584Df99',
    stakeToken: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0x5ef5994fa33ff4eb6c82d51ee1dc145c546065bd',
    rewardPerBlock: '1467673032',
    startBlock: 6707400,
    bonusEndBlock: 8435400,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 20,
    name: 'BANANA -> NAUT Reward Pool',
    address: '0xDC0913b2bf505E03794f0A68a0DbBa333D8e0E01',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0x05B339B0A346bF01f851ddE47a5d485c34FE220c',
    rewardPerBlock: '3858024',
    startBlock: 6744393,
    bonusEndBlock: 9336393,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 21,
    name: 'GNANA -> BANANA Reward Pool',
    address: '0x8F97B2E6559084CFaBA140e2AB4Da9aAF23FE7F8',
    stakeToken: '0xdDb3Bd8645775F59496c821E4F55A7eA6A6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    rewardPerBlock: '86805555555556000',
    startBlock: 6770043,
    bonusEndBlock: 8498043,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 22,
    name: 'BANANA -> ONT Reward Pool',
    address: '0x8e6f61f855a7483E29c8E87BF221C73e10b49738',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0xFd7B3A77848f1C2D67E05E54d78d174a0C850335',
    rewardPerBlock: '9645061728000000',
    startBlock: 6772125,
    bonusEndBlock: 9364125,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 23,
    name: 'BANANA -> NFTL Reward Pool',
    address: '0x7618c42Fb5DC96F3C238FEC799B440AEd7c56E03',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0xE5904E9816b309d3eD4d061c922f5aa8f3B24C92',
    rewardPerBlock: '2142857142000000000',
    startBlock: 6794775,
    bonusEndBlock: 6996375,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 24,
    name: 'BFT -> BFT"',
    address: '0x49bbB345c432b9B66b407f1525A81A84F4509b8b',
    stakeToken: '0xa4f93159ce0a4b533b443c74b89967c60a5969f8',
    stakeTokenIsLp: false,
    rewardToken: '0xa4f93159ce0a4b533b443c74b89967c60a5969f8',
    rewardPerBlock: '3858024691358025000',
    startBlock: 6834460,
    bonusEndBlock: 9426460,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 25,
    name: 'GNANA -> BFT',
    address: '0x5798271B134e27c4dE28CB33aa8D18e5753e83fC',
    stakeToken: '0xdDb3Bd8645775F59496c821E4F55A7eA6A6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0xa4f93159ce0a4b533b443c74b89967c60a5969f8',
    rewardPerBlock: '5787037037000000000',
    startBlock: 6834460,
    bonusEndBlock: 7698460,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 26,
    name: 'GNANA -> SAFEP',
    address: '0xEdea59e33A6D0A2d491Aa818f6E08ea18DE13c32',
    stakeToken: '0xdDb3Bd8645775F59496c821E4F55A7eA6A6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0xA8c514D991F59baB02d32b68f04204cB89261c88',
    rewardPerBlock: '1157407407',
    startBlock: 6907900,
    bonusEndBlock: 8635900,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 27,
    name: 'GNANA -> GEN',
    address: '0x6FbB19A87f1E86f027A084C8bfc3528120Cf8249',
    stakeToken: '0xdDb3Bd8645775F59496c821E4F55A7eA6A6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0xb0f2939a1c0e43683e5954c9fe142f7df9f8d967',
    rewardPerBlock: '24801587301587000',
    startBlock: 6942111,
    bonusEndBlock: 7345311,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 28,
    name: 'JDI -> JDI',
    address: '0xa3283C497710cbBE31d35A5cf56C315C621D6e10',
    stakeToken: '0x0491648c910ad2c1afaab733faf71d30313df7fc',
    stakeTokenIsLp: false,
    rewardToken: '0x0491648c910ad2c1afaab733faf71d30313df7fc',
    rewardPerBlock: '115740740740000000',
    startBlock: 6962657,
    bonusEndBlock: 8690657,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 29,
    name: 'GNANA -> BINGUS',
    address: '0x1697b103a72299d5db4e39ef28a32991c347be23',
    stakeToken: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0xda20c8a5c3b1ab48e31ba6e43f0f2830e50218d8',
    rewardPerBlock: '3592308202022',
    startBlock: 7110269,
    bonusEndBlock: 9702269,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 30,
    name: 'BANANA -> bxBTC',
    address: '0xd65f1319f6408C03EBA7f27e156391784492A9EF',
    stakeToken: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0xab111d5948470ba73d98d66bbdf2798fbe093546',
    rewardPerBlock: '300625000',
    startBlock: 7189195,
    bonusEndBlock: 9781195,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 31,
    name: 'GNANA -> vBSWAP',
    address: '0x7124d635a4bb82319acfd57ce9da18137a7a6f22',
    stakeToken: '0xdDb3Bd8645775F59496c821E4F55A7eA6A6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0x4f0ed527e8a95ecaa132af214dfd41f30b361600',
    rewardPerBlock: '173611110000000',
    startBlock: 7218116,
    bonusEndBlock: 9810116,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 32,
    name: 'BANANA -> WATCH',
    address: '0x465a3782d9014e6eefccc21470c5e41b2cad9d6d',
    stakeToken: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0x7a9f28eb62c791422aa23ceae1da9c847cbec9b0',
    rewardPerBlock: '15432098765432098',
    startBlock: 7246473,
    bonusEndBlock: 9838473,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 33,
    name: 'GNANA -> KEYFI',
    address: '0xeedd7475eb5d05d591be0927b178acbbdc5ee1c1',
    stakeToken: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0x4b6000f9163de2e3f0a01ec37e06e1469dbbce9d',
    rewardPerBlock: '25483796296296296',
    startBlock: 7305030,
    bonusEndBlock: 8601030,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 34,
    name: 'BANANA -> BFT',
    address: '0x73775564d2cbad604c41d0b3ddf061e80e1d0279',
    stakeToken: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: '0xa4f93159ce0a4b533b443c74b89967c60a5969f8',
    rewardPerBlock: '1929012345679012400',
    startBlock: 7323325,
    bonusEndBlock: 12507325,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 35,
    name: 'GNANA -> NRV',
    address: '0x48ee3f7748fac3e8e4858bd0b09483c4339d3d7e',
    stakeToken: '0xdDb3Bd8645775F59496c821E4F55A7eA6A6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096',
    rewardPerBlock: '64484126984126990',
    startBlock: 7433841,
    bonusEndBlock: 9449841,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 36,
    name: 'GNANA -> MOONLIGHT',
    address: '0xe44d4786e9d367a475a0789dc618c76a2b2d05ec',
    stakeToken: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0xb1ced2e320e3f4c8e3511b1dc59203303493f382',
    rewardPerBlock: '15098621485023728',
    startBlock: 7635704,
    bonusEndBlock: 9363704,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 37,
    name: 'SPACE/BNB -> SPACE',
    address: '0xfE615dA45dBC8C763851A34Cf14d65B0056a2D8A',
    stakeToken: '0xd0F82498051067E154d1dcd3d88fA95063949D7e',
    stakeTokenIsLp: true,
    rewardToken: '0xe486a69E432Fdc29622bF00315f6b34C99b45e80',
    rewardPerBlock: '27557043650000000',
    startBlock: 7706570,
    bonusEndBlock: 8109770,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 38,
    name: 'GNANA -> TAPE',
    address: '0x4b5ee00fcce905cc2861c8255b368cf9f114c667',
    stakeToken: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0xf63400ee0420ce5b1ebdee0c942d7de1c734a41f',
    rewardPerBlock: '2314814814814814700',
    startBlock: 7870997,
    bonusEndBlock: 8734997,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 39,
    name: 'GNANA -> SPACE',
    address: '0x52634C2763a6DADA2028440d0892431b04809d88',
    stakeToken: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0xe486a69e432fdc29622bf00315f6b34c99b45e80',
    rewardPerBlock: '9902199074074074',
    startBlock: 7897297,
    bonusEndBlock: 9625297,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 40,
    name: 'GNANA -> pCWS',
    address: '0x1C62ac4D59FFACb35BFfcDb9fcd8b368a528B544',
    stakeToken: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0xbcf39f0edda668c58371e519af37ca705f2bfcbd',
    rewardPerBlock: '11574074074074074',
    startBlock: 8006108,
    bonusEndBlock: 8870108,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 41,
    name: 'GNANA -> TYPE',
    address: '0x222c821620480f7482238dd3B71A7051d02c9624',
    stakeToken: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0x4090e535f2e251f5f88518998b18b54d26b3b07c',
    rewardPerBlock: '413359788359788350',
    startBlock: 8016879,
    bonusEndBlock: 8621679,
    abi: BEP20_REWARD_APE_ABI,
  },
];
