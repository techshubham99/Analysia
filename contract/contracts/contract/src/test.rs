#![cfg(test)]
use super::*;
use soroban_sdk::{Env, String};
use soroban_sdk::testutils::Address as _;

#[test]
fn test_init() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    // Re-init should not panic
    client.init();
}

#[test]
fn test_record_and_retrieve_fees() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    client.record_fee(&String::from_str(&env, "testnet"), &100u64, &1u32);
    client.record_fee(&String::from_str(&env, "testnet"), &120u64, &2u32);
    client.record_fee(&String::from_str(&env, "mainnet"), &500u64, &1u32);

    let testnet_fees = client.get_fees(&String::from_str(&env, "testnet"), &10u32);
    assert_eq!(testnet_fees.len(), 2);
    // Most recent first
    assert_eq!(testnet_fees.get(0).unwrap().base_fee, 120);
    assert_eq!(testnet_fees.get(0).unwrap().sequence, 2);
    assert_eq!(testnet_fees.get(1).unwrap().base_fee, 100);

    let mainnet_fees = client.get_fees(&String::from_str(&env, "mainnet"), &10u32);
    assert_eq!(mainnet_fees.len(), 1);
    assert_eq!(mainnet_fees.get(0).unwrap().base_fee, 500);
}

#[test]
fn test_record_fee_limited_retrieval() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    for i in 1..=5u64 {
        client.record_fee(
            &String::from_str(&env, "testnet"),
            &(100u64 * i),
            &(i as u32),
        );
    }

    let fees = client.get_fees(&String::from_str(&env, "testnet"), &3u32);
    assert_eq!(fees.len(), 3);
    // Most recent first: 500, 400, 300
    assert_eq!(fees.get(0).unwrap().base_fee, 500);
    assert_eq!(fees.get(1).unwrap().base_fee, 400);
    assert_eq!(fees.get(2).unwrap().base_fee, 300);
}

#[test]
fn test_record_tx_with_auth() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    let user = Address::generate(&env);
    client.record_tx(
        &user,
        &1000i128,
        &String::from_str(&env, "payment"),
        &String::from_str(&env, "testnet"),
        &1000000u64,
    );

    let txs = client.get_txs(&user, &10u32);
    assert_eq!(txs.len(), 1);
    let tx = txs.get(0).unwrap();
    assert_eq!(tx.amount, 1000);
    assert_eq!(tx.tx_type, String::from_str(&env, "payment"));
    assert_eq!(tx.network, String::from_str(&env, "testnet"));
    assert_eq!(tx.timestamp, 1000000);
}

#[test]
fn test_record_tx_multiple_users() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    client.record_tx(
        &alice,
        &100i128,
        &String::from_str(&env, "swap"),
        &String::from_str(&env, "mainnet"),
        &100u64,
    );
    client.record_tx(
        &bob,
        &200i128,
        &String::from_str(&env, "transfer"),
        &String::from_str(&env, "testnet"),
        &200u64,
    );

    assert_eq!(client.get_txs(&alice, &10u32).len(), 1);
    assert_eq!(client.get_txs(&bob, &10u32).len(), 1);
    assert_eq!(client.get_txs(&alice, &10u32).get(0).unwrap().amount, 100);
}

#[test]
fn test_get_spending_time_range() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    let user = Address::generate(&env);

    client.record_tx(
        &user,
        &1000i128,
        &String::from_str(&env, "swap"),
        &String::from_str(&env, "mainnet"),
        &100u64,
    );
    client.record_tx(
        &user,
        &2000i128,
        &String::from_str(&env, "transfer"),
        &String::from_str(&env, "mainnet"),
        &200u64,
    );
    client.record_tx(
        &user,
        &3000i128,
        &String::from_str(&env, "contract"),
        &String::from_str(&env, "testnet"),
        &300u64,
    );

    // Only first two records are within 50-250 range
    let total = client.get_spending(&user, &50u64, &250u64);
    assert_eq!(total, 3000);

    // All three
    let all = client.get_spending(&user, &0u64, &1000u64);
    assert_eq!(all, 6000);

    // None
    let none = client.get_spending(&user, &1000u64, &2000u64);
    assert_eq!(none, 0);
}

#[test]
fn test_get_txs_limit() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    let user = Address::generate(&env);

    for i in 1..=5u64 {
        client.record_tx(
            &user,
            &(i as i128 * 1000),
            &String::from_str(&env, "swap"),
            &String::from_str(&env, "mainnet"),
            &i,
        );
    }

    let limited = client.get_txs(&user, &3u32);
    assert_eq!(limited.len(), 3);
    assert_eq!(limited.get(0).unwrap().amount, 3000);
    assert_eq!(limited.get(1).unwrap().amount, 4000);
    assert_eq!(limited.get(2).unwrap().amount, 5000);
}

#[test]
fn test_set_and_get_token_price() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    client.set_price(&String::from_str(&env, "XLM"), &100_000_000i128);
    client.set_price(&String::from_str(&env, "USDC"), &1_000_000_000i128);

    assert_eq!(client.get_price(&String::from_str(&env, "XLM")), 100_000_000);
    assert_eq!(
        client.get_price(&String::from_str(&env, "USDC")),
        1_000_000_000
    );
    assert_eq!(client.get_price(&String::from_str(&env, "ETH")), 0);
}

#[test]
fn test_deploy_cost_testnet() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // 1 KB (1024 bytes) on testnet: 100_000_000 + 1024 * 200 = 100_204_800
    let cost = client.deploy_cost(&1024u64, &String::from_str(&env, "testnet"));
    assert_eq!(cost, 100_204_800);

    // Minimum size (0 bytes): 100_000_000
    let min_cost = client.deploy_cost(&0u64, &String::from_str(&env, "testnet"));
    assert_eq!(min_cost, 100_000_000);
}

#[test]
fn test_deploy_cost_mainnet() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // 1 KB on mainnet: 500_000_000 + 1024 * 1000 = 501_024_000
    let cost = client.deploy_cost(&1024u64, &String::from_str(&env, "mainnet"));
    assert_eq!(cost, 501_024_000);

    // Large contract ~50KB: 500_000_000 + 51200 * 1000 = 551_200_000
    let large = client.deploy_cost(&51200u64, &String::from_str(&env, "mainnet"));
    assert_eq!(large, 551_200_000i128);
}

#[test]
fn test_no_auth_required_for_reads() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    // No auth needed for reads
    let fees = client.get_fees(&String::from_str(&env, "testnet"), &10u32);
    assert_eq!(fees.len(), 0);

    let price = client.get_price(&String::from_str(&env, "XLM"));
    assert_eq!(price, 0);

    let cost = client.deploy_cost(&1024u64, &String::from_str(&env, "testnet"));
    assert_eq!(cost, 100_204_800);
}

#[test]
#[should_panic(expected = "HostError: Error(Auth, InvalidAction)")]
fn test_record_tx_without_auth_panics() {
    let env = Env::default();
    // No mock_all_auths — should fail
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    let user = Address::generate(&env);
    client.record_tx(
        &user,
        &100i128,
        &String::from_str(&env, "payment"),
        &String::from_str(&env, "testnet"),
        &100u64,
    );
}
