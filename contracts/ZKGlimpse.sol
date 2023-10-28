//SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import {UltraVerifier} from '../circuits/contract/circuit/plonk_vk.sol';

contract zkGlimpse {

    UltraVerifier verifier;

    struct BinaryQuestion {
        string question_string;
        uint response;
    }

    // Proposal cd
    
    // STUDY_NAME
    string constant study_name = "";
    // END

    // STUDY_DESC
    string constant study_description = "";
    // END

    // HYP_DESC
    string constant hypothesis_description = "";
    // END

    // ANALYSIS_DESC
    string constant analysis_description = "";
    // END

    // DEADLINE
    uint constant deadline = 0;
    // END

    // QUESTIONS
    BinaryQuestion[3] questions;
    // END 

    bytes32 merkleRoot;
    mapping(bytes32 hash => bool isNullified) nullifiers;

    constructor(bytes32 _merkleRoot, address _verifier) {
        merkleRoot = _merkleRoot;
        verifier = UltraVerifier(_verifier);
    }

    function preparePublicInputs(
        bytes32[] memory _publicInputs,
        bytes32[] memory publicInput,
        uint256 offset) 
        private pure returns (bytes32[] memory) {
        for (uint k = 0; k < publicInput.length; k++) {
            for (uint256 i = 0; i < 32; i++) {
                _publicInputs[i + offset] = (publicInput[k] >> ((31 - i) * 8)) & bytes32(uint256(0xFF));
            } // TODO not cool, padding 31 bytes with 0s
        }
        return _publicInputs;
    }

    function verifyResponse(
        bytes calldata proof, 
        bytes32[] calldata unhashed_partial_decryption_key,  //64 bytes
        bytes32[] calldata responseValue,  // 8 bytes
        bytes32 nullifierHash 
    ) public returns (bool) {
        require(!nullifiers[nullifierHash], "Proof has been already submitted");
        require(block.timestamp < deadline, "Response period is over.");
        nullifiers[nullifierHash] = true;

        bytes32[] memory publicInputs = new bytes32[](73);

        publicInputs = preparePublicInputs(publicInputs, unhashed_partial_decryption_key, 0);
        publicInputs = preparePublicInputs(publicInputs, responseValue, 64);
        publicInputs[72] = merkleRoot;

        require(verifier.verify(proof, publicInputs), "Invalid proof");

        return true;
    }
}