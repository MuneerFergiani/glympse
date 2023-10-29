/* This circuit allows one to create and verify the ZK proof that you are a study participant, whilst keeping you anonymous, and allows you to endorse a message.
   This will be used by participants to contribute a key to the group encryption and later unveiled to help decrypt all of the submitted data.
   This code relies on our own eddsa_secp256k1_sha256 crate, which is not yet public. I have commented out a functioning ECDSA implementation, which is functioning. */

use dep::std;

fn main(
    voter_id: pub [Field; 3],		// The voter ID a generated signature, which corresponds to a public nonce. It works in conjunction with the nonce to prevent duplicate proofs: they're ID'd but not traceable to the owner.
    nonce: pub Field,       		// It's important for security that the nonce is the hash of the study meta-data, thereby it is guaranteed to be unique to the study and deterministic for all participants.
    root: pub Field, 			    // The Merkle root of the participant is necessary to anonymously identify the user as a real participant without revealing their identity.
    message: pub [u8; 32],		    // This is the vote which people actually commit to.
    pubkey_x: Field, 			    // The X co-ordinate of the public key which corresponds to a real study participant.
    pubkey_y: Field, 
    hash_path: [Field; 2], 		    // Intermediate nodes in participant pubkey merkle tree (merkle inclusion proof). This is part of the proof-of-participant, in conjunction with a verified signature. 
    index: Field, 		        	// Index of the leaf node in the participant pubkey merkle tree.
    sig: [Field; 3]		        	// The signature of the vote produced by the participant.
) {
    let hashed_message = std::hash::sha256(message);

    let x_bytes = pubkey_x.to_be_bytes(32);
    let y_bytes = pubkey_y.to_be_bytes(32);
    let mut x: [u8; 32] = [0; 32];
    let mut y: [u8; 32] = [0; 32];
    
    for i in 0..32 {
        x[i] = x_bytes[i];
        y[i] = y_bytes[i];
    }

    let is_message_verified = std::eddsa_secp256_sha256::verify_signature(x, y, sig[0], sig[1], sig[2], hashed_message);
    assert(is_message_verified);

    let is_signer_id_valid = std::eddsa::eddsa_secp256_sha256(pubkey_x, pubkey_y, voter_id[0], voter_id[1], voter_id[2], nonce);
    assert(is_signer_id_valid);

    let merkle_node = std::hash::pedersen([pubkey_x, pubkey_y]);
    let merkle_root = std::merkle::compute_merkle_root(merkle_node[0], index, hash_path);
    assert(merkle_root == root);
}

/* LEGACY CODE */
// fn main(
//     pubkey_x: Field, 
//     pubkey_y: Field, 
//     hash_path: [Field; 2], 
//     index: Field, 
//     root: pub Field, 
//     message: pub [u8; 8], 
//     sig: [u8; 64]
// ) {
//     let hashed_message = std::hash::sha256(message);
    
//     let x_bytes = pubkey_x.to_be_bytes(32);
//     let y_bytes = pubkey_y.to_be_bytes(32);
//     let mut x: [u8; 32] = [0; 32];
//     let mut y: [u8; 32] = [0; 32];
//     for i in 0..32 {
//         x[i] = x_bytes[i];
//         y[i] = y_bytes[i];
//     }
//     let is_message_verified = std::ecdsa_secp256k1::verify_signature(x, y, sig, hashed_message);

//     assert(is_message_verified);

//     let merkle_node = std::hash::pedersen([pubkey_x, pubkey_y]);
//     let merkle_root = std::merkle::compute_merkle_root(merkle_node[0], index, hash_path);
//     std::println(merkle_root);
//     assert(merkle_root == root);
// }

