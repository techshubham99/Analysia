import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBVLE4GF7EHU7C2VZOXIPYHLA3QGLSF6ZJXCR5K5OFSAIKEEKRDO5JNG",
  }
} as const

export type DataKey = {tag: "Fees", values: void} | {tag: "Totals", values: void} | {tag: "TxHistory", values: readonly [string]} | {tag: "TokenPrice", values: readonly [string]};


export interface TxRecord {
  amount: i128;
  network: string;
  timestamp: u64;
  tx_type: string;
}


export interface GasRecord {
  base_fee: u64;
  network: string;
  sequence: u32;
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: (options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_txs transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_txs: ({user, limit}: {user: string, limit: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Array<TxRecord>>>

  /**
   * Construct and simulate a get_fees transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_fees: ({network, limit}: {network: string, limit: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Array<GasRecord>>>

  /**
   * Construct and simulate a get_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_price: ({token}: {token: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a record_tx transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_tx: ({user, amount, tx_type, network, timestamp}: {user: string, amount: i128, tx_type: string, network: string, timestamp: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_price: ({token, price}: {token: string, price: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a record_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_fee: ({network, base_fee, sequence}: {network: string, base_fee: u64, sequence: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a deploy_cost transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deploy_cost: ({code_size, network}: {code_size: u64, network: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_spending transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_spending: ({user, from_ts, to_ts}: {user: string, from_ts: u64, to_ts: u64}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAEaW5pdAAAAAAAAAAA",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAABEZlZXMAAAAAAAAAAAAAAAZUb3RhbHMAAAAAAAEAAAAAAAAACVR4SGlzdG9yeQAAAAAAAAEAAAATAAAAAQAAAAAAAAAKVG9rZW5QcmljZQAAAAAAAQAAABA=",
        "AAAAAQAAAAAAAAAAAAAACFR4UmVjb3JkAAAABAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAduZXR3b3JrAAAAABAAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAAAAAAAB3R4X3R5cGUAAAAAEA==",
        "AAAAAAAAAAAAAAAHZ2V0X3R4cwAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAFbGltaXQAAAAAAAAEAAAAAQAAA+oAAAfQAAAACFR4UmVjb3Jk",
        "AAAAAQAAAAAAAAAAAAAACUdhc1JlY29yZAAAAAAAAAMAAAAAAAAACGJhc2VfZmVlAAAABgAAAAAAAAAHbmV0d29yawAAAAAQAAAAAAAAAAhzZXF1ZW5jZQAAAAQ=",
        "AAAAAAAAAAAAAAAIZ2V0X2ZlZXMAAAACAAAAAAAAAAduZXR3b3JrAAAAABAAAAAAAAAABWxpbWl0AAAAAAAABAAAAAEAAAPqAAAH0AAAAAlHYXNSZWNvcmQAAAA=",
        "AAAAAAAAAAAAAAAJZ2V0X3ByaWNlAAAAAAAAAQAAAAAAAAAFdG9rZW4AAAAAAAAQAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAJcmVjb3JkX3R4AAAAAAAABQAAAAAAAAAEdXNlcgAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAHdHhfdHlwZQAAAAAQAAAAAAAAAAduZXR3b3JrAAAAABAAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAAA",
        "AAAAAAAAAAAAAAAJc2V0X3ByaWNlAAAAAAAAAgAAAAAAAAAFdG9rZW4AAAAAAAAQAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAA",
        "AAAAAAAAAAAAAAAKcmVjb3JkX2ZlZQAAAAAAAwAAAAAAAAAHbmV0d29yawAAAAAQAAAAAAAAAAhiYXNlX2ZlZQAAAAYAAAAAAAAACHNlcXVlbmNlAAAABAAAAAA=",
        "AAAAAAAAAAAAAAALZGVwbG95X2Nvc3QAAAAAAgAAAAAAAAAJY29kZV9zaXplAAAAAAAABgAAAAAAAAAHbmV0d29yawAAAAAQAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAMZ2V0X3NwZW5kaW5nAAAAAwAAAAAAAAAEdXNlcgAAABMAAAAAAAAAB2Zyb21fdHMAAAAABgAAAAAAAAAFdG9fdHMAAAAAAAAGAAAAAQAAAAs=" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
        get_txs: this.txFromJSON<Array<TxRecord>>,
        get_fees: this.txFromJSON<Array<GasRecord>>,
        get_price: this.txFromJSON<i128>,
        record_tx: this.txFromJSON<null>,
        set_price: this.txFromJSON<null>,
        record_fee: this.txFromJSON<null>,
        deploy_cost: this.txFromJSON<i128>,
        get_spending: this.txFromJSON<i128>
  }
}