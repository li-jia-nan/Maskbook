import { CollectionList, type CollectionListProps } from '@masknet/shared'
import { EMPTY_ENTRY, EMPTY_LIST, NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount, useWeb3State } from '@masknet/web3-hooks-base'
import { Typography } from '@mui/material'
import { forwardRef, memo, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import urlcat from 'urlcat'
import { useSubscription } from 'use-subscription'
import { useMaskSharedTrans } from '../../../../../../utils/index.js'
import { useParamTab } from '../../../../hooks/index.js'
import { WalletAssetTabs } from '../../type.js'

const gridProps = {
    columns: 'repeat(auto-fill, minmax(20%, 1fr))',
    gap: '8px',
}
const useStyles = makeStyles()((theme) => ({
    importNft: {
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
        textAlign: 'center',
    },
}))

function useAdditionalAssets() {
    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const collectionMap = useSubscription(Token?.nonFungibleCollectionMap ?? EMPTY_ENTRY)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const additionalAssets = useMemo(() => {
        const collections = collectionMap[account?.toLowerCase()]
        if (!collections) return EMPTY_LIST
        return collections.flatMap((collection) => {
            const { contract } = collection
            const tokens = collection.tokenIds.map((tokenId) => {
                return {
                    tokenId,
                    chainId: contract.chainId,
                    ownerId: account,
                    address: contract.address,
                    contract,
                    metadata: {
                        chainId: contract.chainId,
                        name: contract.name,
                        tokenId,
                        symbol: contract.symbol,
                    },
                    collection: {
                        name: contract.name,
                        symbol: contract.symbol,
                    },
                } as Web3Helper.NonFungibleTokenScope<void, NetworkPluginID.PLUGIN_EVM>
            })
            return tokens
        })
    }, [collectionMap, account])
    return additionalAssets
}

interface Props {
    onAddToken: (assetTab: WalletAssetTabs) => void
    scrollTargetRef: CollectionListProps['scrollElementRef']
}

export const WalletCollections = memo<Props>(
    forwardRef<HTMLDivElement, Props>(function WalletCollections({ onAddToken, scrollTargetRef }, ref) {
        const { t } = useMaskSharedTrans()
        const { classes } = useStyles()
        const [currentTab] = useParamTab<WalletAssetTabs>(WalletAssetTabs.Tokens)
        const [, setParams] = useSearchParams()
        const additionalAssets = useAdditionalAssets()
        const navigate = useNavigate()
        const handleItemClick = useCallback(
            (asset: Web3Helper.NonFungibleTokenAll) => {
                const path = urlcat(PopupRoutes.CollectibleDetail, {
                    chainId: asset.chainId,
                    address: asset.address,
                    id: asset.tokenId,
                })
                navigate(path, { state: { asset } })
            },
            [navigate],
        )
        const handleCollectionChange = useCallback(
            (id: string | undefined) => {
                const SEARCH_KEY = 'collectionId'
                setParams(
                    (params) => {
                        if (!id) params.delete(SEARCH_KEY)
                        else params.set(SEARCH_KEY, id)
                        return params.toString()
                    },
                    { replace: true },
                )
            },
            [setParams],
        )

        const collectiblesEmptyText = (
            <>
                <Typography component="div">{t('do_not_see_your_nft')}</Typography>
                <Typography className={classes.importNft} role="button" onClick={() => onAddToken(currentTab)}>
                    {t('import_nft')}
                </Typography>
            </>
        )
        return (
            <CollectionList
                ref={ref}
                gridProps={gridProps}
                disableSidebar
                disableWindowScroll
                scrollElementRef={scrollTargetRef}
                emptyText={collectiblesEmptyText}
                additionalAssets={additionalAssets}
                onItemClick={handleItemClick}
                onCollectionChange={handleCollectionChange}
            />
        )
    }),
)
