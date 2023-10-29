use dep::std;

global DEPTH = 12;

fn main(
    unhashed_partial_decryption_key: pub [u8; 64], 
    message: pub [u8; 32], 
    root: pub Field, 
    pubkey_x: Field, 
    pubkey_y: Field, 
    nonce: [u8; 32], 
    hash_path: [Field; DEPTH],
    index: Field, 
    signed_response: [u8; 64]) 
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
    let is_message_verified = std::ecdsa_secp256k1::verify_signature(x, y, signed_response, hashed_message);

    assert(is_unhashed_partial_decryption_key_yours);
    assert(is_message_verified);

    let merkle_node = std::hash::pedersen([pubkey_x, pubkey_y]);
    let merkle_root = std::merkle::compute_merkle_root(merkle_node[0], index, hash_path);
    
    std::println(merkle_root);
    assert(merkle_root == root);
}
