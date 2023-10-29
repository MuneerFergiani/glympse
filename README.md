# Glimpse: Trustworthy Data Collection With ZK and Threshold Decryption

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

Glimpse uses ZK (via Noir) to verify pseudonymous cryptographic identities for verified public identities on the blockchain, ensuring secrecy and provenance. Participants then decide how to respond to the study question and encrypt their answers. This encryption ensures data cannot be tampered with and can only be decrypted with the cooperation of other participants, promoting data secrecy and undermining bribery incentives -- there can be no proof of co-operation amongst colluding parties, so there are is no incentive to lie or intervene to distort results. It also conceals vital information from those who seek to destroy user anonymity by analysing the results as they come in.

All data remains encrypted until every participant has finished answering. At this point, there's sufficient cryptographic information to reconstruct the decryption key, leveraging a simple n-of-n threshold group decryption scheme. No individual can vote without

Furthermore, Glimpse mandates that researchers publish their methodology and hypothesis before collecting data, eliminating potential pitfalls like data dredging and p-hacking.

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

- Proper EdDSA with deterministic signatures are not implemented, producing cryptographic vulnerabilities. We are presently working on implementing proper SecP256k1 EdDSA within Noir.
- This version mints a new smart-contract for each study and only after the threshold public keys have been selected by the server. This could be simplified, more could be moved on chain and data could be handled more efficiently.
- It is possible to implement an m-of-n scheme, whereby not everybody needs to vote for the result to be published.
- The monetisation of surveys and studies is not yet complete.
- The responses are currently limited to yes and no answers.
- There are some edge cases for which the web-app does not account for nor handle gracefully.
- There is no differential privacy to actually obscure the data-points.

These issues may be addressed in future -- this iteration was developed under time pressure.

## Aknowledgements

This was developed at Eth London 2023 over two and a half days by the following people:

- Arbion Halili
- Muneer Fergiana
- Andrei Cravtov

The design of Glimpse, visual and technical, was decided by Arbion, who also made contributions across the codebase. Muneer contributed heavily to the ZK circuits, produced the smart-contract and wrote a great deal of the backend including unit tests. Andrei almost exclusively implemented the non-cryptographic elements, implementing the web application in Next.JS
