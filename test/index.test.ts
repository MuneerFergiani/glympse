// @ts-ignore
import { MerkleTree } from '../utils/merkleTree'; // MerkleTree.js
import merkle from '../utils/merkle.json'; // merkle
import hre from "hardhat"

import { Barretenberg, Fr } from '@aztec/bb.js';

import { PublicClient, WalletClient, pad, fromHex, hashMessage, http, recoverPublicKey, toHex } from 'viem';

import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { CompiledCircuit, ProofData } from "@noir-lang/types"
import circuit from "../circuits/target/circuit.json"


import { expect } from 'chai';

const ethereumUtil = require('ethereumjs-util');

class Glympse {
    public address: `0x${string}` = "0x";

    constructor(
        private _hashedMessage: `0x${string}`,
        private _verifierAddress: string,
        public merkleTreeRoot: string,
        private _amount: string) {
    }

    async deploy() {
        const airdrop = await hre.viem.deployContract('zkGlimpse' as never, [
            this.merkleTreeRoot,
            this._verifierAddress
        ])
        this.address = airdrop.address;
    }

    async contract() {
        console.log('contract');
        return await hre.viem.getContractAt('zkGlimpse', this.address)
    }
}

describe('Setup', () => {
    let publicClient: PublicClient;

    let merkleTree: MerkleTree;
    let bb: Barretenberg;
    let glympse: Glympse;
    let messageToHash: `0x${string}` = '0xabfd76608112cc843dca3a31931f3974da5f9f5d32833e7817bc7e5c50c7821e';
    let hashedMessage: `0x${string}`;

    before(async () => {
        publicClient = await hre.viem.getPublicClient();

        const verifier = await hre.viem.deployContract('UltraVerifier');
        console.log(`Verifier deployed to ${verifier.address}`);


        // Setup merkle tree
        merkleTree = new MerkleTree(parseInt(merkle.depth));
        console.log('merkle tree');
        await merkleTree.initialize(merkle.addresses.map(addr => Fr.fromString(addr)));
        console.log('merkle tree2');

        hashedMessage = hashMessage(messageToHash, "hex"); // keccak of "signthis"
        console.log('hashed message');

        glympse = new Glympse(hashedMessage, verifier.address, merkleTree.root().toString(), '3500000000000000000000');
        await glympse.deploy();

        console.log(`Glympse deployed to ${glympse.address}`);

    });

    describe('Glympse tests', () => {
        let user1: WalletClient;
        let user2: WalletClient;
        let claimer1: WalletClient;
        let claimer2: WalletClient;

        let backend: BarretenbergBackend;
        let noir: Noir;

        let naughtyInputMerkleTree: any;

        before(async () => {
            // only user1 is an eligible user
            ([user1, user2, claimer1, claimer2] = await hre.viem.getWalletClients());
            backend = new BarretenbergBackend(circuit as unknown as CompiledCircuit, { threads: 8 });
            noir = new Noir(circuit as unknown as CompiledCircuit, backend);

        });

        const getInputs = async ({ user }: { user: WalletClient }) => {
            const leaf = user.account!.address;
            const index = merkleTree.getIndex(Fr.fromString(leaf));
            const response_message = "0";
            const partial_decryption_key = await user.signMessage({ account: user.account!.address, message: "69" });
            const signed_response = await user.signMessage({ account: user.account!.address, message: response_message });

            const pedersenBB = await merkleTree.getBB()
            await pedersenBB.pedersenHashInit();
            const pubKey = await recoverPublicKey({ hash: hashedMessage, signature: signed_response });
            const publicKeyData = pubKey.slice(2);

            // Split the data into x and y coordinates
            const xCoord = publicKeyData.slice(0, 64);
            const yCoord = publicKeyData.slice(64);
            console.log(xCoord, yCoord);
            const proof = await merkleTree.proof(index);
            
            const messageBuffer = Buffer.alloc(32);
            const textBytes = Buffer.from(response_message);
            textBytes.copy(messageBuffer);
            const messageByteArray = Array.from(messageBuffer);
            
            const num = 69; // Replace with your desired integer
            // Create a 32-byte Buffer
            const buffer = Buffer.alloc(32);
            // Write the integer as a 32-bit big-endian number into the buffer
            buffer.writeInt8(num, 0);

            // Convert the buffer to an array
            const NonceByteArray = Array.from(buffer);
            return {
                unhashed_partial_decryption_key: [...fromHex( partial_decryption_key as `0x${string}`, "bytes")].slice(0, 64),
                message: messageByteArray,
                root: merkleTree.root().toString() as `0x${string}`,
                pubkey_x: parseInt(xCoord, 16),
                pubkey_y: parseInt(yCoord, 16),
                nonce: NonceByteArray,
                hash_path: proof.pathElements.map(x => x.toString()),
                index: index,
                signed_response: [...fromHex(signed_response as `0x${string}`, "bytes").slice(0, 64)],
            };
        };

        describe("Eligible user", () => {
            let proof: ProofData;

            it("Generates a valid claim", async () => {
                const inputs = await getInputs({ user: user1 });
                console.log(inputs);
                proof = await noir.generateFinalProof(inputs)

                const { hash_path, index, root } = inputs;
                naughtyInputMerkleTree = { hash_path, index, root }
            })

            it("Verifies a valid claim off-chain", async () => {
                const verification = await noir.verifyFinalProof(proof);
                expect(verification).to.be.true;
            })

            // ON-CHAIN VERIFICATION FAILS, CHECK https://github.com/noir-lang/noir/issues/3245
            it.skip("Verifies a valid response on-chain", async () => {
                const g = await glympse.contract();
                // perf
                // bytes32[] calldata unhashed_partial_decryption_key,  //64 bytes
                // bytes32[] calldata responseValue,  // 8 bytes


                let unhashed_partial_decryption_key = new Uint8Array();
                let responseValue = new Uint8Array();
                await g.write.verifyResponse(
                    [toHex(proof.proof), 
                        toHex(unhashed_partial_decryption_key), 
                        toHex(responseValue), nullifier as `0x${string}`], 
                        { account: claimer1.account!.address });

            })
        })


        describe("Uneligible user", () => {
            let proof: ProofData;

            it("Fails to generate a valid claim", async () => {
                try {
                    // give it a genuine signature...
                    const signature = await user2.signMessage({ account: user2.account!.address, message: messageToHash })
                    const pedersenBB = await merkleTree.getBB()
                    await pedersenBB.pedersenHashInit();
                    const signatureBuffer = fromHex(signature as `0x${string}`, "bytes").slice(0, 64);
                    const frArray: Fr[] = Array.from(signatureBuffer).map(byte => new Fr(BigInt(byte)));
                    const nullifier = await pedersenBB.pedersenPlookupCommit(frArray);
                    const pubKey = await recoverPublicKey({ hash: hashedMessage, signature });

                    // ...but give it a fake merkle path
                    const { merkle_path, index, merkle_root } = naughtyInputMerkleTree;
                    const naughtyInputs = {
                        pub_key: [...fromHex(pubKey, "bytes").slice(1)],
                        signature: [...fromHex(signature as `0x${string}`, "bytes").slice(0, 64)],
                        hashed_message: [...fromHex(hashedMessage, "bytes")],
                        nullifier: nullifier.toString(),
                        merkle_path,
                        index,
                        merkle_root,
                        claimer_priv: claimer1.account!.address,
                        claimer_pub: claimer1.account!.address,
                    };

                    proof = await noir.generateFinalProof(naughtyInputs)

                } catch (err: any) {
                    expect(err.message).to.equal("Circuit execution failed: Error: Cannot satisfy constraint");
                }
            })

            it("Fails to front-run the on-chain transaction with a invalid claimer", async () => {
                // ON-CHAIN VERIFICATION FAILS
            })

        })
    });
});