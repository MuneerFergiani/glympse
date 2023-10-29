# Glimpse: Trustworthy Data Collection With ZK and Threshold Decryption

**Hackathon Judges: See HACKATHON.md for a more relevant explanation.**

Academia is mired in various kinds of data fraud, especially among sociologists. The pressure to publish, secure funding, and achieve recognition can, at times, incentivize scientists to manipulate or even fabricate data.

One infamous example is the case of Andrew Wakefield, who, in 1998, published a study claiming a link between the MMR vaccine and autism. This study was later discovered to be based on falsified data. It has since been retracted, but not before causing widespread panic and a significant drop in vaccination rates.

While the peer review process is designed to ensure the integrity of research findings, it can fall short in detecting subtle or sophisticated forms of data manipulation.

Enter the world of cryptographic solutions. With the rise of decentralized systems and cryptographic tools, we introduce "Glimpse" — a system conceived to confront these challenges in academia through cryptographic methods.

## Why Do We Have This Problem?

Without stringent checks, any researcher can:

- Withhold data that doesn't support their narrative.
- Tamper with existing data or fabricate data.
- Unduly influence their participants.
- Adjust the sample size to manipulate results (known as p-hacking).

These risks, which squander our time and resources, promoting dead-ends for the benefit of fraudsters, can be distilled into three fundamental problems:

- Improper Provenance Authentication (Fake Data, Data Tampering).
- Imperfect Participant and Data Secrecy (Bribery, Pressure, Collusion).
- Retrospective Methodology Tampering (Data Omission, p-hacking, Data Dredging).

Glimpse addresses all three problems at their core, restoring accountability and transparency whilst guarding the identity of the participants.

## How It Works

Glimpse uses ZK (via Noir) to generate verifiable pseudonymous cryptographic identities for known humans on the blockchain, ensuring secrecy and provenance. Participants then decide how to respond to the study question and encrypt their answers. This encryption ensures data cannot be tampered with and can only be decrypted with the cooperation of other participants, promoting data secrecy and undermining bribery incentives -- there can be no proof of co-operation amongst colluding parties, so there are is no incentive to lie or intervene to distort results. It also conceals vital information from those who seek to destroy user anonymity by analysing the results as they come in.

All data remains encrypted until every participant has finished answering. At this point, there's sufficient cryptographic information to reconstruct the decryption key, leveraging a simple n-of-n threshold group decryption scheme. No individual can vote without

Furthermore, Glimpse mandates that researchers publish their methodology and hypothesis before collecting data, eliminating potential pitfalls like data dredging and p-hacking.

### Step-By-Step

The following does not explain the potential for monetisation. It is possible to implement it by having the smart-contract wait for the researcher to fund it before accepting responses, and distributing the funds between all the participants once all the responses have been collected.

#### Joining a Study

This is the process on the user's side for joining a study, which will require them to fill out a questionnaire and record the results securely and anonymously on-chain.

1. User authenticates using Metamask to access the web app.
2. User picks a study and clicks to join.
3. User signs a request asking to join the study and reports their wallet pubkey to the frontend server.
   3a. The server checks if they're eligible to join the study. They must have Proof-of-Humanity, the joining deadline must be upcoming, and the max participant threshold must not be exceeded.
   3b. If not eligible, the web app lets the user know.
   3c. If eligible, the server adds their pubkey to a list of participants. The user will see that the survey is shown in the "Your Studies" area.
4. When the sign-up deadline has been reached, or the max participants limit has been reached, the participants list is openly announced, and the server awaits confirmations.
5. To confirm participation, the user needs to derive an EC keypair (called Masking Keys) from their wallet by signing and hashing a public nonce (the hash of the study metadata, so it's unique to the study) deterministically (EdDSA). The public masking key will be aggregated with other users to create a group encryption key. At a later stage, the private masking keys will be revealed.
   5a. The web app generates a ZK proof that shows the user, being a participant in the study, has signed their masking key to endorse it. The ZK proof is designed such that it conceals which participant is proposing the key (anonymity), but nonetheless, it reveals a Proposer ID which cannot be faked (i.e., one can't sign to endorse multiple different keys without someone noticing).
   5b. The user passes the proof to the server anonymously through a public endpoint - the server receives and validates the proof. If it is valid for that study and unique (checks nonce and ID), then it will be added to the set of public masking keys.
   5c. The server tallies up all of the public masking keys and their proofs, and once there is a proof for every participant in the set, anyone can calculate the group encryption key.
   5d. The participant public keys and masking keys (with proofs), as well as the study metadata (including methodology data), are deployed as public data on an immutable smart contract which can also verify ZK proofs of data submission.
6. The user, as a publicly identifiable member of the study, is alerted that the submission window has opened. They answer the questions on the questionnaire, and responses will be stored on-chain in a smart contract once they are encrypted and authenticated.
   6a. The responses are encrypted using the group encryption key.
   6b. The web app will generate a ZK proof which demonstrates that the user is a unique study participant, once again using the same Proposer ID, and reveals their private masking key.
   6c. This data (the responses and private masking key) is committed to a smart contract which corresponds to the study, where the ZK proof will be verified, and the encrypted responses will be immutably stored.
7. Once all of the participants have responded, anyone is at liberty to aggregate the private masking keys, thereby recovering the group decryption key which can be used to decrypt all of the responses.

#### Proposing a Study

1. Reseearcher decides the study name, hypothesis, deadlines and other meta-information. Its submitted to the web-app.
2. The web app advertises the study to users.
3. The researcher waits for enough participants to join through the web app, or for the deadline to be reached (the study will abort if this is the case), and for all the confirmations to come through.
4. The web app converts all of the meta-information into a smart-contract which authenticates and immutably stores the encrypted responses.
5. When all of the responses have come through, the researcher will have all of the private masking keys needed to reconstruct the group decryption key. They can use this to decrypt the responses recorded on-chain.

## Running The Web App

`npm install`
`npm run dev`

## Directory Structure

- circuits: where the contract-side ZK circuits and verifier is implemented.
- contracts: the solidity contracts which power our smart-contracts. They validate and immutably store study data the blockchain.
- drizzle: used by the web application for database keeping.
- extra-circuits: circuits for generating and validating ZK proofs off-chain, where necessary.
- public: content served statically by the web application.
- scripts: miscellaneous scripts.
- src: the main codebase for the web application.
- tests: our test suite.
- utils: miscellaneous utilities.

## Limitations

There are very many addressable limitations to this demo implementation of Glimpse.

- Proper EdDSA with deterministic signatures are not implemented, but we couldn't use ECDSA due to cryptographic vulnerabilities in this setting. We are presently working on implementing proper SecP256k1 EdDSA within Noir. The beta crate is referenced in the ZK circuits.
- This version mints a new smart-contract for each study and only after the threshold public keys have been selected by the server. This could be simplified, more could be moved on chain and data could be handled more efficiently.
- There is a mismatch between the inputs the ZK verifier needs and what is being passed by the smart contract since we moved away from ECDSA.
- It is possible to implement an m-of-n scheme, whereby not everybody needs to vote for the result to be published.
- The monetisation of surveys and studies is not yet complete.
- The responses are currently limited to yes and no answers.
- The human-checking aspect is incomplete, thus far it depends on a whitelist of addresses belonging to real humans. This can easily be improved.
- There are some edge cases for which the web-app does not account for nor handle gracefully.
- There is no differential privacy to actually obscure the data-points.

These issues may be addressed in future -- this iteration was developed under time pressure.

## Aknowledgements

This was developed at Eth London 2023 over two and a half days by the following people:

- Arbion Halili
- Muneer Fergiana
- Andrei Cravtov

The design of Glimpse, visual and technical, was decided by Arbion, who also made contributions across the codebase. Muneer contributed heavily to the ZK circuits, produced the smart-contract and wrote a great deal of the backend including unit tests. Andrei almost exclusively implemented the non-cryptographic elements, implementing the web application in Next.JS
