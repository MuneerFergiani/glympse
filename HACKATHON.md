# Glimpse: Elevating Academic Integrity Through the Noir ZK Language

**Bounty Track:** Best Noir Application or Library.
**Authors:** Arbion Halili, Muneer Fergiana and Andrei Cravtov.

The landscape of academia is increasingly shadowed by instances of data fraud, as epitomized by cases like the discredited MMR vaccine study. Traditional peer reviews, though invaluable, occasionally miss nuanced manipulations. Recognizing this, we present Glimpse, a tool underpinned by the Noir ZK language to revolutionize data integrity in research.

## The Central Challenges Addressed by Glimpse via Noir

1. _Improper Provenance Authentication_: Noir's capabilities are utilized to counteract fake data and tampering.
2. _Imperfect Participant and Data Secrecy_: The ZK properties of Noir combat potential bribery, pressure, and collusion.
3. _Retrospective Methodology Tampering_: Noir's cryptographic strengths assist in preventing data omission, p-hacking, and data dredging.

## How It Works

See the Step-By-Step explanation in `README.md`

## How Noir Powers Glimpse

Noir is used to design the ZK circuits which perform participant and response authentication on-chain whilst preserving user anonymity. We make use of Noir's ability to compile down to a Solidity verifier contract by using the verifier in our smart-contracts. We also use Noir.JS in the web app.

## Limitations

Glimpse, although groundbreaking in its use of the Noir language, has its challenges. It currently doesn’t employ a full-fledged EdDSA, has certain inefficiencies in smart-contract generation, and offers only binary response options. The system's human validation relies on a basic whitelist, and there's an absence of differential privacy. Nonetheless, Glimpse's potential, rooted in Noir's prowess, heralds a new era of reinforced academic data integrity with refinements on the anvil.
