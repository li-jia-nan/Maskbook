import { identity, pickBy } from 'lodash-es'
import type { GasOptionType, Web3State } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier, PartialRequired } from '@masknet/shared-base'
import type { OthersAPI_Base } from './OthersAPI.js'

export interface ConnectionOptions_Base<ChainId, ProviderType, Transaction> {
    /** Designate the signer of the transaction. */
    account?: string
    /** Designate the sub-network id of the transaction. */
    chainId?: ChainId
    /** an abstract wallet has a owner */
    owner?: string
    /** persona identifier */
    identifier?: ECKeyIdentifier
    /** Designate the provider to handle the transaction. */
    providerType?: ProviderType
    /** Custom network rpc url. */
    providerURL?: string
    /** Gas payment token. */
    paymentToken?: string
    /** Only Support Mask Wallet, silent switch wallet */
    silent?: boolean
    /** Accessing data from chain directly w/o middleware, the default value is true  */
    readonly?: boolean
    /** Fragments to merge into the transaction. */
    overrides?: Partial<Transaction>
    /** Termination signal */
    signal?: AbortSignal
    /** Gas option type */
    gasOptionType?: GasOptionType
}

export abstract class ConnectionOptionsAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
> {
    constructor(private options?: ConnectionOptions_Base<ChainId, ProviderType, Transaction>) {}
    abstract readonly Web3StateRef: {
        readonly value: Web3State<
            ChainId,
            SchemaType,
            ProviderType,
            NetworkType,
            MessageRequest,
            MessageResponse,
            Transaction,
            TransactionParameter
        >
    }

    abstract readonly Web3Others: OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction>

    protected get defaults(): PartialRequired<
        ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
        'account' | 'chainId' | 'providerType'
    > {
        const others = this.Web3Others
        return {
            account: '',
            chainId: others.getDefaultChainId(),
            providerType: others.getDefaultProviderType(),
        }
    }

    protected get refs(): ConnectionOptions_Base<ChainId, ProviderType, Transaction> {
        const provider = this.Web3StateRef.value?.Provider
        if (!provider) return {}
        return {
            account: provider.account?.getCurrentValue(),
            chainId: provider.chainId?.getCurrentValue(),
            providerType: provider.providerType?.getCurrentValue(),
        }
    }

    fill(
        initials?: ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
        overrides?: Partial<Transaction>,
    ): PartialRequired<
        ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
        'account' | 'chainId' | 'providerType'
    > {
        return {
            ...this.defaults,
            ...this.refs,
            ...pickBy(this.options, identity),
            ...pickBy(initials, identity),
            overrides: {
                ...this.defaults.overrides,
                ...pickBy(this.refs?.overrides, identity),
                ...pickBy(this.options?.overrides, identity),
                ...pickBy(initials?.overrides, identity),
                ...pickBy(overrides, identity),
            },
        }
    }
}
