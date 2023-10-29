/* This circuit allows one to create and verify the ZK proof that one is a valid participant, that they derived a encryption key, and that a given vote was signed by the party.
   The key proposed for group decryption purposes is the hash of an EdDSA signature produced by the participant's wallet. By revealing and verifying the signature in ZK, it is possible to verify 
   that the person submitting the data to the chain is the person associated with the unique group-encryption key-pair without revealing their wallet public key.
   Being able to link the vote to the encryption key prevents people from voting on behalf of others and/or multiple times.
   This code relies on our own eddsa_secp256k1_sha256 crate, which is not yet public. I have commented out a functioning ECDSA implementation, which is functioning. */

use dep::std;

fn main(
    raw_dec_key: pub [Field; 3], 
    message: pub Field, 
    root: pub Field, 
    pubkey_x: Field, 
    pubkey_y: Field, 
    nonce: Field, 
    hash_path: [Field; 2],
    index: Field, 
    sig: [Field; 3]
) {
    let x_bytes = pubkey_x.to_be_bytes(32);
    let y_bytes = pubkey_y.to_be_bytes(32);
    let mut x: [u8; 32] = [0; 32];
    let mut y: [u8; 32] = [0; 32];
    for i in 0..32 {
        x[i] = x_bytes[i];
        y[i] = y_bytes[i];
        std::println(i);
    }
    
    let is_raw_dec_key_yours = std::eddsa::eddsa_secp256_sha256(pubkey_x, pubkey_y, raw_dec_key[0], raw_dec_key[1], raw_dec_key[2], nonce);
    let is_message_verified = std::eddsa_secp256_sha256::verify_signature(pubkey_x, pubkey_y, sig[0], sig[1], sig[2], message);

    assert(is_raw_dec_key_yours);
    assert(is_message_verified);

    let merkle_node = std::hash::pedersen([pubkey_x, pubkey_y]);
    let merkle_root = std::merkle::compute_merkle_root(merkle_node[0], index, hash_path);
    
    std::println(merkle_root);
    assert(merkle_root == root);
}
