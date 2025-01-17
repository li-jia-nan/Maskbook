import { SourceType } from '@masknet/web3-shared-base'
import {
    ChainId,
    type SchemaType,
    type ProviderType,
    type NetworkType,
    type MessageRequest,
    type MessageResponse,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-evm'
import { HubNonFungibleAPI_Base } from '../../Base/apis/HubNonFungibleAPI.js'
import { HubOptionsAPI } from './HubOptionsAPI.js'
import type { HubOptions } from '../types/index.js'
import type { AuthorizationAPI, NonFungibleTokenAPI, TokenListAPI } from '../../../entry-types.js'
import { AlchemyEVM } from '../../../Alchemy/index.js'
import { ApprovalAPI } from '../../../Approval/index.js'
import { ChainbaseNonFungibleToken } from '../../../Chainbase/index.js'
import { Gem } from '../../../Gem/index.js'
import { GoPlusAuthorization } from '../../../GoPlusLabs/index.js'
import { NFTScanNonFungibleTokenEVM } from '../../../NFTScan/index.js'
import { OpenSea } from '../../../OpenSea/index.js'
import { R2D2TokenList } from '../../../R2D2/index.js'
import { Rabby } from '../../../Rabby/index.js'
import { SimpleHashEVM } from '../../../SimpleHash/index.js'
import { X2Y2 } from '../../../X2Y2/index.js'
import { ZerionNonFungibleToken } from '../../../Zerion/index.js'
import { Zora } from '../../../Zora/index.js'

export class HubNonFungibleAPI extends HubNonFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    private Approval_ = new ApprovalAPI()
    protected override HubOptions = new HubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions) {
        const options = this.HubOptions.fill(initial)
        return this.getPredicateProviders<
            | AuthorizationAPI.Provider<ChainId>
            | NonFungibleTokenAPI.Provider<ChainId, SchemaType>
            | TokenListAPI.Provider<ChainId, SchemaType>
        >(
            {
                [SourceType.X2Y2]: X2Y2,
                [SourceType.Chainbase]: ChainbaseNonFungibleToken,
                [SourceType.Zerion]: ZerionNonFungibleToken,
                [SourceType.NFTScan]: NFTScanNonFungibleTokenEVM,
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Approval]: this.Approval_,
                [SourceType.Alchemy_EVM]: AlchemyEVM,
                [SourceType.Zora]: Zora,
                [SourceType.Gem]: Gem,
                [SourceType.GoPlus]: GoPlusAuthorization,
                [SourceType.Rabby]: Rabby,
                [SourceType.R2D2]: R2D2TokenList,
                [SourceType.SimpleHash]: SimpleHashEVM,
            },
            options.chainId === ChainId.Mainnet
                ? [
                      X2Y2,
                      SimpleHashEVM,
                      NFTScanNonFungibleTokenEVM,
                      ZerionNonFungibleToken,
                      OpenSea,
                      AlchemyEVM,
                      Zora,
                      Gem,
                      this.Approval_,
                      GoPlusAuthorization,
                      Rabby,
                      R2D2TokenList,
                  ]
                : [
                      SimpleHashEVM,
                      NFTScanNonFungibleTokenEVM,
                      ZerionNonFungibleToken,
                      AlchemyEVM,
                      OpenSea,
                      Zora,
                      this.Approval_,
                      Gem,
                      GoPlusAuthorization,
                      Rabby,
                      R2D2TokenList,
                  ],
            initial,
        )
    }
}
