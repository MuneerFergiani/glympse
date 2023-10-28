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

    // QUESTIONS
    BinaryQuestion[] public BinaryQuestions = [\n"""

    for index, question in enumerate(binary_questions):
        if index == len(binary_questions) - 1:
            formatted_data += f'        BinaryQuestion("{question}")\n'
        else:
            formatted_data += f'        BinaryQuestion("{question}"),\n'
    
    formatted_data += f"    ];\n\n    // MASKING_KEYS\n"

    declaration = ""
    usage = ""
    for index, key in enumerate(masking_keys):
        key1 = key.get('PubKey_X', '0x100')
        key2 = key.get('PubKey_Y', '0x100')
        subkeys = ", ".join([f'uint32({subkey})' for subkey in key.get('ZKP', [])])
        if index == len(masking_keys) - 1:
            declaration += f"    uint32[] ZKP{index} = [{subkeys}];\n"
            usage += f'        MaskingKey(uint256({key1}), uint256({key2}), ZKP{index})\n'
        else:
            declaration += f"    uint32[] ZKP{index} = [{subkeys}];\n"
            usage += f'        MaskingKey(uint256({key1}), uint256({key2}), ZKP{index}),\n'

    formatted_data += declaration

    formatted_data += f"""
    MaskingKey[] public MaskingKeys = [\n"""
    formatted_data += usage
    formatted_data += "    ];\n"

    return formatted_data
    
def generate_contract_from_template(filename, data_to_embed):
    with open(filename, 'r') as file:
        content = file.read()

    start_tag = "/* START META INFORMATION */"
    end_tag = "/* END META INFORMATION */"

    # Split the content at the tags
    before_tag = content.split(start_tag)[0]
    after_tag = content.split(end_tag)[1]

    data_to_embed = format_json(data_to_embed)
    # Embed the data between the tags
    new_content = before_tag + start_tag + "\n" + data_to_embed + "\n    " + end_tag + after_tag

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

    # Specify the file name where the content needs to be embedded
    filename = "../contracts/ZKGlimpse.sol"

    print(generate_contract_from_template(filename, input_data))