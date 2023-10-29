pragma solidity >=0.8.19;

import {UltraVerifier} from "../circuits/contract/circuit/plonk_vk.sol";

contract zkGlimpse {
    UltraVerifier verifier;

    struct MaskingKey {
        uint256 PubKey_X;
        uint256 PubKey_Y;
        uint32[] ZKP;
    }

    struct BinaryQuestion {
        string question_string;
    }

    /* START META INFORMATION */

    MaskingKey[] public MaskingKeys;

    // STUDY_NAME
    string constant STUDY_NAME = "My Study";

    // STUDY_DESC
    string constant STUDY_DESC = "Description of study.";

    // HYPOTHESIS_DESC
    string constant HYPOTHESIS_DESC = "Hypothesis of study.";

    // ANALYSIS_DESC
    string constant ANALYSIS_DESC = "Analysis description.";

    // PARTICIPANT_MERKLE_ROOT
    uint256 constant PARTICIPANT_MERKLE_ROOT = 0x000000000000000000000000;

    // VOTING_VOTING_DEADLINE
    uint constant VOTING_DEADLINE = 1635551999;

    BinaryQuestion[] public BinaryQuestions;
            
    uint32[] ZKP0;
    uint32[] ZKP1;

    /* END META INFORMATION */

    bytes32 merkleRoot;
    mapping(bytes32 hash => bool isNullified) nullifiers;

    constructor(bytes32 _merkleRoot, address _verifier) {
        merkleRoot = _merkleRoot;
        verifier = UltraVerifier(_verifier);

        /* START CONSTRUCTOR INFORMATION */
        ZKP0.push(uint32(0x100));
        ZKP0.push(uint32(0x100));
        ZKP1.push(uint32(0x100));
        ZKP1.push(uint32(0x100));
        MaskingKeys.push(MaskingKey(uint256(0x100), uint256(0x100), ZKP0));
        MaskingKeys.push(MaskingKey(uint256(0x100), uint256(0x100), ZKP0));
        MaskingKeys.push(MaskingKey(uint256(0x100), uint256(0x100), ZKP1));
        MaskingKeys.push(MaskingKey(uint256(0x100), uint256(0x100), ZKP1));

    /* END CONSTRUCTOR INFORMATION */
    }

    function preparePublicInputs(
        bytes32[] memory _publicInputs,
        bytes32[] memory publicInput,
        uint256 offset
    ) private pure returns (bytes32[] memory) {
        for (uint k = 0; k < publicInput.length; k++) {
            for (uint256 i = 0; i < 32; i++) {
                _publicInputs[i + offset] =
                    (publicInput[k] >> ((31 - i) * 8)) &
                    bytes32(uint256(0xFF));
            } // TODO not cool, padding 31 bytes with 0s
        }
        return _publicInputs;
    }

    function verifyResponse(
        bytes calldata proof,
        bytes32[] calldata unhashed_partial_decryption_key, //64 bytes
        bytes32[] calldata responseValue, // 8 bytes
        bytes32 nullifierHash
    ) public returns (bool) {
        require(!nullifiers[nullifierHash], "Proof has been already submitted");
        require(block.timestamp < VOTING_DEADLINE, "Response period is over.");
        nullifiers[nullifierHash] = true;

        bytes32[] memory publicInputs = new bytes32[](73);

        publicInputs = preparePublicInputs(
            publicInputs,
            unhashed_partial_decryption_key,
            0
        );
        publicInputs = preparePublicInputs(publicInputs, responseValue, 64);
        publicInputs[72] = merkleRoot;

        require(verifier.verify(proof, publicInputs), "Invalid proof");

        return true;
    }
}