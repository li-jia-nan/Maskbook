import { useCallback, useEffect, useMemo } from 'react'
import { makeStyles, ActionButton, parseColor, ShadowRootTooltip, useDetectOverflow } from '@masknet/theme'
import { signMessage, type ChainId } from '@masknet/web3-shared-evm'
import { type RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { Card, Typography, Button, Box } from '@mui/material'
import {
    WalletConnectedBoundary,
    ChainBoundary,
    AssetPreviewer,
    NFTFallbackImage,
    TransactionConfirmModal,
    LoadingStatus,
    ReloadStatus,
} from '@masknet/shared'
import {
    useChainContext,
    useNetwork,
    useNetworkContext,
    useNonFungibleAsset,
    useWeb3Hub,
} from '@masknet/web3-hooks-base'
import { TokenType } from '@masknet/web3-shared-base'
import { usePostLink } from '@masknet/plugin-infra/content-script'
import { share } from '@masknet/plugin-infra/content-script/context'
import { NetworkPluginID, CrossIsolationMessages, Sniffings } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { Stack } from '@mui/system'
import { useRedPacketTrans } from '../locales/index.js'
import { useClaimNftRedpacketCallback } from './hooks/useClaimNftRedpacketCallback.js'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket.js'
import { useNftRedPacketContract } from './hooks/useNftRedPacketContract.js'

const useStyles = makeStyles<{ claimed: boolean; outdated: boolean }>()((theme, { claimed, outdated }) => ({
    root: {
        position: 'relative',
        width: '100%',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.spacing(2),
        padding: theme.spacing(1),
        background: 'transparent',
        justifyContent: 'space-between',
        position: 'relative',
        color: theme.palette.common.white,
        boxSizing: 'border-box',
        backgroundImage: claimed
            ? `url(${new URL('./assets/nftClaimedCover.png', import.meta.url)})`
            : `url(${new URL('./assets/cover.png', import.meta.url)})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        width: 'calc(100% - 32px)',
        margin: 'auto',
        marginBottom: outdated ? '12px' : 'auto',
        height: 335,
    },
    remain: {
        fontSize: 12,
        fontWeight: 600,
        color: theme.palette.common.white,
    },
    button: {
        backgroundColor: theme.palette.maskColor.dark,
        color: theme.palette.common.white,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
        margin: '0 !important',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between !important',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
    },
    buttonWrapper: {
        marginTop: 0,
        display: 'flex',
    },
    claimedTokenWrapper: {
        position: 'absolute',
        top: 80,
        right: 'clamp(10px, 5.6%, 30px)',
        borderRadius: 9,
        cursor: 'pointer',
    },
    tokenImageWrapper: {
        display: 'flex',
        overflow: 'hidden',
        alignItems: 'center',
        height: 126,
        width: 126,
        borderRadius: 8,
        transform: 'RedPacketTransY(6px)',
        '& > div': {
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
        },
    },
    claimedText: {
        fontSize: 12,
        fontWeight: 600,
    },
    badge: {
        width: 76,
        height: 27,
        display: 'flex',
        color: theme.palette.common.white,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: parseColor(theme.palette.common.black).setAlpha(0.5).toString(),
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
    },
    imgWrapper: {
        maxWidth: 180,
    },
    fallbackImage: {
        height: 160,
        width: 120,
    },
    description: {
        background: theme.palette.maskColor.primary,
        alignSelf: 'stretch',
        borderRadius: '0 0 8px 8px',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: 126,
        transform: 'RedPacketTransY(3px)',
        fontSize: 13,
        color: theme.palette.common.white,
        lineHeight: '36px',
        minHeight: '1em',
        textIndent: '8px',
    },
    hidden: {
        visibility: 'hidden',
    },
    tokenLabel: {
        width: 48,
        height: 48,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    messageBox: {
        width: '100%',
    },
    words: {
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        color: theme.palette.common.white,
        wordBreak: 'break-all',
        fontSize: 24,
        fontWeight: 700,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: '60%',
        minWidth: 300,
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            fontSize: 14,
        },
    },
    from: {
        fontSize: '14px',
        color: theme.palette.common.white,
        alignSelf: 'end',
        fontWeight: 500,
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            fontSize: 14,
            right: 12,
            bottom: 8,
        },
    },
    fallbackImageWrapper: {
        width: '100%',
        height: 126,
        background: theme.palette.common.white,
    },
}))
interface RedPacketNftProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNft({ payload }: RedPacketNftProps) {
    const t = useRedPacketTrans()

    const { pluginID } = useNetworkContext()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>(
        pluginID === NetworkPluginID.PLUGIN_EVM ? {} : { account: '' },
    )
    const {
        value: availability,
        loading,
        retry: retryAvailability,
        error: availabilityError,
    } = useAvailabilityNftRedPacket(payload.id, account, payload.chainId)

    const [{ loading: isClaiming }, claimCallback] = useClaimNftRedpacketCallback(
        payload.id,
        availability?.totalAmount,
        signMessage(account, payload.privateKey).signature ?? '',
    )
    const [showTooltip, textRef] = useDetectOverflow()

    useEffect(() => {
        retryAvailability()
    }, [account])
    const network = useNetwork(pluginID, payload.chainId)

    const outdated = !!(availability?.isClaimedAll || availability?.isCompleted || availability?.expired)
    const { classes, cx } = useStyles({ claimed: !!availability?.isClaimed, outdated })
    // #region on share
    const postLink = usePostLink()
    const shareText = useMemo(() => {
        const isOnTwitter = Sniffings.is_twitter_page
        const isOnFacebook = Sniffings.is_facebook_page
        const options = {
            sender: payload.senderName,
            payload: postLink.toString(),
            network: network?.name || '',
            account_promote: t.account_promote({
                context: isOnTwitter ? 'twitter' : isOnFacebook ? 'facebook' : 'default',
            }),
            interpolation: { escapeValue: false },
        } as const
        if (availability?.isClaimed) {
            return t.nft_share_claimed_message(options)
        }
        return t.nft_share_foreshow_message(options)
    }, [availability?.isClaimed, t, network?.name])

    const onShare = useCallback(() => {
        if (shareText) share?.(shareText)
    }, [shareText])
    // #endregion

    const openNFTDialog = useCallback(() => {
        if (!payload.chainId || !pluginID || !availability?.claimed_id || !availability?.token_address) return
        CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
            open: true,
            chainId: payload.chainId,
            pluginID,
            tokenId: availability.claimed_id,
            tokenAddress: availability.token_address,
        })
    }, [pluginID, payload.chainId, availability?.claimed_id, availability?.token_address])

    const { data: asset, isLoading: loadingAsset } = useNonFungibleAsset<'all'>(
        NetworkPluginID.PLUGIN_EVM,
        payload.contractAddress,
        availability?.claimed_id,
        {
            chainId: payload.chainId,
        },
    )
    const Hub = useWeb3Hub(pluginID, {
        account,
    })
    const nftRedPacketContract = useNftRedPacketContract(payload.chainId)
    const checkResult = useCallback(async () => {
        if (!nftRedPacketContract) return
        const availability = await nftRedPacketContract.methods.check_availability(payload.id).call({
            // check availability is ok w/o account
            from: account,
        })
        if (availability.claimed_id === '0') return

        const isOnTwitter = Sniffings.is_twitter_page
        const isOnFacebook = Sniffings.is_facebook_page
        const options = {
            sender: payload.senderName,
            payload: postLink.toString(),
            network: network?.name || '',
            account_promote: t.account_promote({
                context: isOnTwitter ? 'twitter' : isOnFacebook ? 'facebook' : 'default',
            }),
            interpolation: { escapeValue: false },
        } as const
        const shareText = t.nft_share_foreshow_message(options)
        const token = await Hub.getNonFungibleAsset(payload.contractAddress, availability.claimed_id)

        TransactionConfirmModal.open({
            shareText,
            amount: '1',
            nonFungibleTokenId: availability.claimed_id,
            nonFungibleTokenAddress: payload.contractAddress,
            tokenType: TokenType.NonFungible,
            messageTextForNFT: t.claim_nft_successful({
                name: token?.contract?.name || 'NFT',
            }),
            messageTextForFT: t.claim_token_successful({
                amount: '1',
                name: '',
            }),
            title: t.lucky_drop(),
            share,
        })
    }, [nftRedPacketContract, payload.id, account, Hub])

    const claim = useCallback(async () => {
        const hash = await claimCallback()
        await checkResult()
        if (typeof hash === 'string') {
            retryAvailability()
        }
    }, [claimCallback, retryAvailability])

    if (availabilityError) return <ReloadStatus message={t.go_wrong()} onRetry={retryAvailability} />

    if (!availability || loading) return <LoadingStatus minHeight={148} iconSize={24} />

    return (
        <div className={classes.root}>
            <Card className={classes.card} component="article" elevation={0}>
                <img
                    src={new URL('./assets/nftLabel.png', import.meta.url).toString()}
                    className={classes.tokenLabel}
                />
                <Stack />

                <div className={classes.messageBox}>
                    <ShadowRootTooltip title={payload.message}>
                        <Typography className={classes.words} variant="h6">
                            {payload.message}
                        </Typography>
                    </ShadowRootTooltip>
                </div>
                <ShadowRootTooltip
                    title={showTooltip ? `${payload.contractName} #${availability.claimed_id}` : undefined}
                    placement="top"
                    disableInteractive
                    arrow
                    PopperProps={{
                        disablePortal: true,
                    }}>
                    <Box className={cx(classes.claimedTokenWrapper, !availability.isClaimed ? classes.hidden : '')}>
                        <Box className={classes.tokenImageWrapper} onClick={openNFTDialog}>
                            {loadingAsset ? null : (
                                <AssetPreviewer
                                    url={asset?.metadata?.imageURL || asset?.metadata?.mediaURL}
                                    classes={{
                                        root: classes.imgWrapper,
                                        fallbackImage: classes.fallbackImage,
                                    }}
                                    fallbackImage={
                                        <div className={classes.fallbackImageWrapper}>{NFTFallbackImage}</div>
                                    }
                                />
                            )}
                        </Box>

                        <div className={classes.description}>
                            <Typography className={classes.name} color="textPrimary" variant="body2" ref={textRef}>
                                {`${payload.contractName} #${availability.claimed_id}`}
                            </Typography>
                        </div>
                    </Box>
                </ShadowRootTooltip>

                <div className={classes.footer}>
                    {availability.isClaimed ? (
                        <Typography className={classes.claimedText}>
                            {t.got_nft({ name: payload.contractName || 'NFT' })}
                        </Typography>
                    ) : (
                        <Typography className={classes.remain}>
                            {t.claimed({ amount: `${availability.claimedAmount}/${availability.totalAmount}` })}
                        </Typography>
                    )}
                    <Typography variant="body1" className={classes.from}>
                        {t.from({ name: payload.senderName || '-' })}
                    </Typography>
                </div>

                {availability.isClaimed ? (
                    <div className={classes.badge}>
                        <Typography variant="body2" className={classes.badgeText}>
                            {t.claimed({ amount: '' })}
                        </Typography>
                    </div>
                ) : availability.isEnd ? (
                    <div className={classes.badge}>
                        <Typography variant="body2" className={classes.badgeText}>
                            {availability.expired ? t.expired() : t.completed()}
                        </Typography>
                    </div>
                ) : null}
            </Card>
            {outdated ? null : (
                <OperationFooter
                    chainId={payload.chainId}
                    isClaiming={isClaiming}
                    claimed={availability.isClaimed}
                    onShare={onShare}
                    claim={claim}
                />
            )}
        </div>
    )
}

interface OperationFooterProps {
    claimed: boolean
    isClaiming: boolean
    onShare(): void
    claim(): Promise<void>
    chainId: ChainId
}

function OperationFooter({ claimed, onShare, chainId, claim, isClaiming }: OperationFooterProps) {
    const { classes } = useStyles({ claimed, outdated: false })
    const t = useRedPacketTrans()

    return (
        <Box className={classes.buttonWrapper}>
            <Box sx={{ flex: 1, padding: 1.5 }}>
                <Button
                    variant="roundedDark"
                    startIcon={<Icons.Shared size={18} />}
                    className={classes.button}
                    fullWidth
                    onClick={onShare}>
                    {t.share()}
                </Button>
            </Box>
            {claimed ? null : (
                <Box sx={{ flex: 1, padding: 1.5 }}>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        ActionButtonPromiseProps={{ variant: 'roundedDark' }}
                        expectedChainId={chainId}>
                        <WalletConnectedBoundary
                            expectedChainId={chainId}
                            startIcon={<Icons.Wallet size={18} />}
                            classes={{
                                connectWallet: classes.button,
                            }}
                            ActionButtonProps={{ variant: 'roundedDark' }}>
                            <ActionButton
                                variant="roundedDark"
                                loading={isClaiming}
                                disabled={isClaiming}
                                onClick={claim}
                                className={classes.button}
                                fullWidth>
                                {isClaiming ? t.claiming() : t.claim()}
                            </ActionButton>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </Box>
            )}
        </Box>
    )
}
