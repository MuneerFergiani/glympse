use dep::std;

/* KNOWN VULNERABILITY: Under ECDSA, it is possible to infer the pubkey associated with an address 
   from any given signature. EdDSA is resistant to this attack, and we have shown that this can be done
   in EdDSA below, but EdDSA support in Noir does not cover SecP256k1.
   
   We're working on a fork of EdDSA from the standard library to provide SecP256k1 and SHA256 EdDSA. */

// fn main(
//     raw_dec_key: pub [Field; 3], 
//     message: pub [u8; 8], 
//     root: pub Field, 
//     pubkey_x: Field, 
//     pubkey_y: Field, 
//     nonce: Field, 
//     hash_path: [Field; 2],
//     index: Field, 
//     sig: [u8; 64]) 
// {
//     let hashed_message = std::hash::sha256(message);
    
//     let x_bytes = pubkey_x.to_be_bytes(32);
//     let y_bytes = pubkey_y.to_be_bytes(32);
//     let mut x: [u8; 32] = [0; 32];
//     let mut y: [u8; 32] = [0; 32];
//     for i in 0..32 {
//         x[i] = x_bytes[i];
//         y[i] = y_bytes[i];
//     }
    
//     let is_raw_dec_key_yours = std::eddsa::eddsa_poseidon_verify(pubkey_x, pubkey_y, raw_dec_key[0], raw_dec_key[1], raw_dec_key[2], nonce);
//     let is_message_verified = std::ecdsa_secp256k1::verify_signature(x, y, sig, hashed_message);

//     assert(is_raw_dec_key_yours);
//     assert(is_message_verified);

//     let merkle_node = std::hash::pedersen([pubkey_x, pubkey_y]);
//     let merkle_root = std::merkle::compute_merkle_root(merkle_node[0], index, hash_path);
    
//     std::println(merkle_root);
//     assert(merkle_root == root);
// }

fn main(
    unhashed_partial_decryption_key: pub [u8; 64], 
    message: pub [u8; 8], 
    root: pub Field, 
    pubkey_x: Field, 
    pubkey_y: Field, 
    nonce: [u8; 32], 
    hash_path: [Field; 2],
    index: Field, 
    sig: [u8; 64]) 
{
    let hashed_message = std::hash::sha256(message);
    
    let x_bytes = pubkey_x.to_be_bytes(32);
    let y_bytes = pubkey_y.to_be_bytes(32);
    let mut x: [u8; 32] = [0; 32];
    let mut y: [u8; 32] = [0; 32];
    for i in 0..32 {
        x[i] = x_bytes[i];
        y[i] = y_bytes[i];
        std::println(i);
    }
    
    let is_unhashed_partial_decryption_key_yours = std::ecdsa_secp256k1::verify_signature(x, y, unhashed_partial_decryption_key, nonce);
    let is_message_verified = std::ecdsa_secp256k1::verify_signature(x, y, sig, hashed_message);

    assert(is_unhashed_partial_decryption_key_yours);
    assert(is_message_verified);

    let merkle_node = std::hash::pedersen([pubkey_x, pubkey_y]);
    let merkle_root = std::merkle::compute_merkle_root(merkle_node[0], index, hash_path);
    
    std::println(merkle_root);
    assert(merkle_root == root);
}
