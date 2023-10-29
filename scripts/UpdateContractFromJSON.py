# This is used to generate our Solidity contract, which will be used to safeguard the study on-chain.
# It takes in a JSON description of the study and produces the Solidity contract.
# Make sure you have also generated the Solidity circuit verifier using `nargo codegen-verifier`.

import json

def format_json(input_json):
    study_name = input_json.get('STUDY_NAME', '')
    study_desc = input_json.get('STUDY_DESC', '')
    hypothesis_desc = input_json.get('HYPOTHESIS_DESC', '')
    analysis_desc = input_json.get('ANALYSIS_DESC', '')
    participant_merkle_root = input_json.get('PARTICIPANT_MERKLE_ROOT', '0x0000')
    voting_deadline = input_json.get('VOTING_DEADLINE', 0)
    binary_questions = input_json.get('BINARY_QUESTIONS', [])
    masking_keys = input_json.get('MASKING_KEYS', [])

    formatted_data = f"""
    MaskingKey[] public MaskingKeys;

    // STUDY_NAME
    string constant STUDY_NAME = "{study_name}";

    // STUDY_DESC
    string constant STUDY_DESC = "{study_desc}";

    // HYPOTHESIS_DESC
    string constant HYPOTHESIS_DESC = "{hypothesis_desc}";

    // ANALYSIS_DESC
    string constant ANALYSIS_DESC = "{analysis_desc}";

    // PARTICIPANT_MERKLE_ROOT
    uint256 constant PARTICIPANT_MERKLE_ROOT = {participant_merkle_root};

    // VOTING_VOTING_DEADLINE
    uint constant VOTING_DEADLINE = {voting_deadline};

    //\n"""

    declaration = ""
    usage = ""
    for index, key in enumerate(masking_keys):
        key1 = key.get('PubKey_X', '0x100')
        key2 = key.get('PubKey_Y', '0x100')
        formatted_data += f"    uint32[] ZKP{index};\n"
        for subkey in key.get('ZKP', []):
            declaration += f"        ZKP{index}.push(uint32({subkey}));\n"
            usage += f'        MaskingKeys.push(MaskingKey(uint256({key1}), uint256({key1}), ZKP{index}));\n'

    formatted_constructor_data = ""
    formatted_constructor_data += declaration
    formatted_constructor_data += usage

    for index, question in enumerate(binary_questions):
        formatted_constructor_data += f'\n        BinaryQuestions.push(BinaryQuestion("{question}"));'

    return formatted_data, formatted_constructor_data
    
def generate_contract_from_template(filename, data_to_embed):
    with open(filename, 'r') as file:
        content = file.read()

    formatted_data, formatted_constructor_data = format_json(data_to_embed)

    start_tag = "/* START META INFORMATION */"
    end_tag = "/* END META INFORMATION */"

    before_tag = content.split(start_tag)[0]
    after_tag = content.split(end_tag)[1]
    new_content = before_tag + start_tag + "\n" + formatted_data + "\n    " + end_tag + after_tag

    start_tag = "/* START CONSTRUCTOR INFORMATION */"
    end_tag = "/* END CONSTRUCTOR INFORMATION */"

    before_tag = new_content.split(start_tag)[0]
    after_tag = new_content.split(end_tag)[1]

    new_content = before_tag + start_tag + "\n" + formatted_constructor_data + "\n    " + end_tag + after_tag

    return new_content

if __name__ == "__main__":
    input_data = {
        "STUDY_NAME": "My Study",
        "STUDY_DESC": "Description of study.",
        "HYPOTHESIS_DESC": "Hypothesis of study.",
        "ANALYSIS_DESC": "Analysis description.",
        "VOTING_DEADLINE": 1635551999,
        "BINARY_QUESTIONS": ["Question 1?", "Question 2?"],
        "PARTICIPANT_MERKLE_ROOT": "0x000000000000000000000000", 
        "MASKING_KEYS": [
            {
                "PubKey_X": "0x100",
                "PubKey_Y": "0x100",
                "ZKP": ["0x100", "0x100"]
            },
            {
                "PubKey_X": "0x100",
                "PubKey_Y": "0x100",
                "ZKP": ["0x100", "0x100"]
            }
        ]
    }
    formatted_output = format_json(input_data)

    filename = "../contracts/ZKGlimpse.sol"

    print(generate_contract_from_template(filename, input_data))
