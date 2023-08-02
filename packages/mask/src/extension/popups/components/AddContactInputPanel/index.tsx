import { Icons } from '@masknet/icons'
import { MaskTextField, makeStyles } from '@masknet/theme'
import { openWindow } from '@masknet/shared-base-ui'
import { Box, Typography, useTheme, type BoxProps } from '@mui/material'
import { memo, useCallback } from 'react'

import { useI18N } from '../../../../utils/index.js'
import { ContactsContext } from '../../hook/useContactsContext.js'
import { AddContactModal } from '../../modals/modals.js'
import { explorerResolver } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    input: {
        flex: 1,
    },
    toText: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        fontWeight: 700,
        height: 40,
        width: 33,
        display: 'flex',
        alignItems: 'center',
    },
    receiverPanel: {
        display: 'flex',
        alignItems: 'flex-start',
    },
    inputText: {
        fontSize: 10,
        paddingRight: '0px !important',
    },
    save: {
        color: theme.palette.maskColor.main,
        marginRight: 4,
    },
    endAdornment: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(0.5),
    },
    receiver: {
        display: 'flex',
        alignItems: 'flex-start',
        color: theme.palette.maskColor.second,
        fontSize: 13,
    },
    validation: {
        color: theme.palette.maskColor.danger,
        fontSize: 14,
    },
    fieldWrapper: {
        flex: 1,
    },
    linkOut: {
        color: theme.palette.maskColor.main,
        marginLeft: 4,
        cursor: 'pointer',
    },
}))

const AddContactInputPanel = memo(function AddContactInputPanel(props: BoxProps) {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { address, receiver, setReceiver, ensName, receiverValidationMessage, registeredAddress } =
        ContactsContext.useContainer()

    const theme = useTheme()

    const openAddContactModal = useCallback(() => {
        return AddContactModal.openAndWaitForClose({
            title: t('wallet_add_contact'),
            address,
            name: ensName,
        })
    }, [address, ensName])

    return (
        <Box padding={2} {...props} className={cx(classes.receiverPanel, props.className)}>
            <Typography className={classes.toText}>{t('popups_wallet_transfer_to')}</Typography>
            <div className={classes.fieldWrapper}>
                <MaskTextField
                    placeholder={t('wallet_transfer_placeholder')}
                    value={receiver}
                    onChange={(ev) => setReceiver(ev.target.value)}
                    wrapperProps={{ className: classes.input }}
                    InputProps={{
                        spellCheck: false,
                        endAdornment:
                            !receiverValidationMessage && (registeredAddress || receiver) ? (
                                <div className={classes.endAdornment} onClick={openAddContactModal}>
                                    <Typography className={classes.save}>{t('save')}</Typography>
                                    <Icons.AddUser size={18} color={theme.palette.maskColor.main} />
                                </div>
                            ) : undefined,
                        classes: { input: classes.inputText },
                    }}
                />
                {receiverValidationMessage || registeredAddress ? (
                    <Typography className={receiverValidationMessage ? classes.validation : classes.receiver} mt={1}>
                        {receiverValidationMessage || registeredAddress}
                        {receiverValidationMessage ? null : (
                            <Icons.LinkOut
                                size={18}
                                className={classes.linkOut}
                                onClick={() =>
                                    openWindow(explorerResolver.addressLink(chainId, registeredAddress ?? ''))
                                }
                            />
                        )}
                    </Typography>
                ) : null}
            </div>
        </Box>
    )
})

export default AddContactInputPanel