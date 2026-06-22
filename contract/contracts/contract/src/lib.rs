#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct GasRecord {
    pub base_fee: u64,
    pub sequence: u32,
    pub network: String,
}

#[contracttype]
#[derive(Clone)]
pub struct TxRecord {
    pub amount: i128,
    pub tx_type: String,
    pub network: String,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Fees,
    Totals,
    TxHistory(Address),
    TokenPrice(String),
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn init(env: Env) {
        if env.storage().instance().has(&DataKey::Fees) {
            return;
        }
        env.storage()
            .instance()
            .set(&DataKey::Fees, &Vec::<GasRecord>::new(&env));
        env.storage()
            .instance()
            .set(&DataKey::Totals, &Map::<String, i128>::new(&env));
    }

    pub fn record_fee(env: Env, network: String, base_fee: u64, sequence: u32) {
        let mut fees: Vec<GasRecord> = env
            .storage()
            .instance()
            .get(&DataKey::Fees)
            .unwrap_or(Vec::new(&env));
        fees.push_back(GasRecord {
            base_fee,
            sequence,
            network: network.clone(),
        });
        env.storage().instance().set(&DataKey::Fees, &fees);

        let mut totals: Map<String, i128> = env
            .storage()
            .instance()
            .get(&DataKey::Totals)
            .unwrap_or(Map::new(&env));
            let current = totals.get(network.clone()).unwrap_or(0);
            totals.set(network, current + base_fee as i128);
            env.storage().instance().set(&DataKey::Totals, &totals);
    }

    pub fn get_fees(env: Env, network: String, limit: u32) -> Vec<GasRecord> {
        let fees: Vec<GasRecord> = env
            .storage()
            .instance()
            .get(&DataKey::Fees)
            .unwrap_or(Vec::new(&env));
        let mut result = Vec::<GasRecord>::new(&env);
        let mut count = 0u32;
        let mut i = fees.len();
        while i > 0 {
            i -= 1;
            if count >= limit {
                break;
            }
            let rec = fees.get(i).unwrap();
            if rec.network == network {
                result.push_back(rec);
                count += 1;
            }
        }
        result
    }

    pub fn record_tx(
        env: Env,
        user: Address,
        amount: i128,
        tx_type: String,
        network: String,
        timestamp: u64,
    ) {
        user.require_auth();
        let key = DataKey::TxHistory(user.clone());
        let mut txs: Vec<TxRecord> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(&env));
        txs.push_back(TxRecord {
            amount,
            tx_type,
            network,
            timestamp,
        });
        env.storage().persistent().set(&key, &txs);
        env.storage().persistent().extend_ttl(&key, 10000, 20000);
    }

    pub fn get_spending(env: Env, user: Address, from_ts: u64, to_ts: u64) -> i128 {
        let key = DataKey::TxHistory(user);
        let txs: Vec<TxRecord> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(&env));
        let mut total: i128 = 0;
        for i in 0..txs.len() {
            let tx = txs.get(i).unwrap();
            if tx.timestamp >= from_ts && tx.timestamp <= to_ts {
                total += tx.amount;
            }
        }
        total
    }

    pub fn get_txs(env: Env, user: Address, limit: u32) -> Vec<TxRecord> {
        let key = DataKey::TxHistory(user);
        let txs: Vec<TxRecord> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(&env));
        let mut result = Vec::<TxRecord>::new(&env);
        let start = if txs.len() > limit {
            txs.len() - limit
        } else {
            0
        };
        for i in start..txs.len() {
            result.push_back(txs.get(i).unwrap());
        }
        result
    }

    pub fn set_price(env: Env, token: String, price: i128) {
        env.storage()
            .persistent()
            .set(&DataKey::TokenPrice(token.clone()), &price);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::TokenPrice(token), 10000, 20000);
    }

    pub fn get_price(env: Env, token: String) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::TokenPrice(token))
            .unwrap_or(0)
    }

    pub fn deploy_cost(env: Env, code_size: u64, network: String) -> i128 {
        let mainnet = String::from_str(&env, "mainnet");
        let base = if network == mainnet {
            500_000_000i128
        } else {
            100_000_000i128
        };
        let per_byte = if network == mainnet {
            1_000i128
        } else {
            200i128
        };
        base + (code_size as i128) * per_byte
    }
}

mod test;
