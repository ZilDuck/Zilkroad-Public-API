# Zilkroad Public API

You should be running on node version 16 or zilliqa-js falls over.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

## nvm install 16.17
nvm use 16.17 
```

## Cache Times

#### Data likely to change (30 seconds)

- wallets
- nfts
- wallet-activities
- collection
- collection-stats
- collection-ranks
- user-stats
- skinny-user-stats
- site-stats
- user-fungible
- marketplace

#### Data unlikely to change (15 minutes)

- advert
- search
- fungible-price-lookup
- metadata

#### Data never changes (1 hour)

- primary-sales
- calendar
- report

#### Never cache because it's useless (X)

- order
- health
