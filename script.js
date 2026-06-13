const state = {
  coins: 0,
  rolls: 0,
  luck: 1,
  coinMult: 1,
  bonus: 0,
  auto: 0,
  luckUp: 0,
  coinUp: 0,
  findUp: 0
};

const rarities = [
  {name:'Common',emoji:'⚪',base:45,color:'common',reward:1},
  {name:'Uncommon',emoji:'🟢',base:25,color:'uncommon',reward:3},
  {name:'Rare',emoji:'🔵',base:15,color:'rare',reward:8},
  {name:'Epic',emoji:'🟣',base:8,color:'epic',reward:20},
  {name:'Legendary',emoji:'🟡',base:4,color:'legendary',reward:50},
  {name:'Mythic',emoji:'🩷',base:1.5,color:'mythic',reward:120},
  {name:'Cosmic',emoji:'🩵',base:0.8,color:'cosmic',reward:300},
  {name:'Divine',emoji:'✨',base:0.45,color:'legendary',reward:800},
  {name:'Ultra',emoji:'💎',base:0.2,color:'epic',reward:2000},
  {name:'Secret',emoji:'❓',base:0.05,color:'mythic',reward:10000},
  {name:'Elemental Fire',emoji:'🔥',base:2.5,color:'legendary',reward:30},
  {name:'Elemental Water',emoji:'💧',base:2.5,color:'rare',reward:30},
  {name:'Elemental Earth',emoji:'🌿',base:2.5,color:'uncommon',reward:30},
  {name:'Elemental Air',emoji:'🌪️',base:2.5,color:'cosmic',reward:30}
];

const el = x => document.getElementById(x);
const fmt = n => Math.floor(n).toLocaleString();

function update(){
  el('coins').textContent = fmt(state.coins);
  el('rolls').textContent = fmt(state.rolls);
  el('luck').textContent = state.luck.toFixed(2) + 'x';
  el('coinMult').textContent = state.coinMult.toFixed(2) + 'x';
  el('bonusCoins').textContent = fmt(state.bonus);
  el('autoRolls').textContent = state.auto;

  el('buyLuck').textContent = 'Buy ' + (50 + state.luckUp * 35);
  el('buyCoin').textContent = 'Buy ' + (75 + state.coinUp * 50);
  el('buyAuto').textContent = 'Buy ' + (150 + state.auto * 125);
  el('buyFind').textContent = 'Buy ' + (250 + state.findUp * 180);
}

function pushLog(r){
  const d = document.createElement('div');
  d.className = 'rollLog';
  d.innerHTML = `<div><div class="rarity ${r.color}">${r.emoji} ${r.name}</div><div class="mini">Chance: 1 in ${r.chance}</div></div><div><b>+${r.coins}</b> coins</div>`;
  const log = el('log');
  log.prepend(d);
  while(log.children.length > 20) log.removeChild(log.lastChild);
}

function weightedRoll(){
  const pool = [];
  let total = 0;

  rarities.forEach(r => {
    let w = r.base * (1 + state.findUp * 0.08) * (1 + state.luck * 0.18);
    if(r.reward >= 1000) w *= 0.6;
    if(r.reward >= 10000) w *= 0.25;
    pool.push({...r, w});
    total += w;
  });

  let x = Math.random() * total;
  for(const r of pool){
    x -= r.w;
    if(x <= 0) return r;
  }
  return pool[0];
}

function roll(){
  const r = weightedRoll();
  state.rolls++;

  const chance = (100 / (r.base * (1 + state.findUp * 0.08) * (1 + state.luck * 0.18))).toFixed(2);
  const coins = Math.max(1, Math.floor(r.reward * state.coinMult));

  state.coins += coins;
  state.bonus += coins;

  el('resultName').textContent = r.name;
  el('resultName').className = 'rarity ' + r.color;
  el('resultChance').textContent = 'Estimated chance: about 1 in ' + Math.max(1, Math.round(100 / (r.base * (1 + state.findUp * 0.08) * (1 + state.luck * 0.18))));
  el('resultEmoji').textContent = r.emoji;

  pushLog({...r, chance, coins});
  update();
}

function buy(which){
  const costs = {
    luck: 50 + state.luckUp * 35,
    coin: 75 + state.coinUp * 50,
    auto: 150 + state.auto * 125,
    find: 250 + state.findUp * 180
  };

  const cost = costs[which];
  if(state.coins < cost) return;

  state.coins -= cost;

  if(which === 'luck'){ state.luck += 0.25; state.luckUp++; }
  if(which === 'coin'){ state.coinMult += 0.3; state.coinUp++; }
  if(which === 'auto'){ state.auto++; }
  if(which === 'find'){ state.findUp++; }

  update();
}

window.addEventListener('DOMContentLoaded', () => {
  el('dice').addEventListener('click', roll);
  el('rollBtn').addEventListener('click', roll);

  el('buyLuck').addEventListener('click', () => buy('luck'));
  el('buyCoin').addEventListener('click', () => buy('coin'));
  el('buyAuto').addEventListener('click', () => buy('auto'));
  el('buyFind').addEventListener('click', () => buy('find'));

  el('resetBtn').addEventListener('click', () => location.reload());

  setInterval(() => {
    for(let i = 0; i < state.auto; i++) roll();
  }, 2000);

  update();
});