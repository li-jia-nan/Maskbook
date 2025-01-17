import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Button, Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useNextID_Trans } from '../../locales/index.js'
import { PersonaSelectPanel } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    button: {
        display: 'inline-flex',
        gap: theme.spacing(1),
        minWidth: 254,
        borderRadius: '20px',
        width: 'fit-content !important',
    },
    unchecked: {
        '& circle': {
            stroke: theme.palette.maskColor.white,
        },
    },
}))

interface CreatePersonaActionProps {
    disabled: boolean
    onCreate(): void
}

export const CreatePersonaAction = memo<CreatePersonaActionProps>(({ disabled, onCreate }) => {
    const t = useNextID_Trans()
    const { classes } = useStyles()

    return (
        <>
            <Stack flex={1} px={1.25} justifyContent="flex-start" width="100%" boxSizing="border-box">
                <Typography fontWeight={400} fontSize={14}>
                    {t.create_persona_intro()}
                </Typography>
            </Stack>
            <Stack direction="row" justifyContent="center" alignItems="center">
                <Button color="primary" disabled={disabled} className={classes.button} onClick={onCreate}>
                    <Icons.Identity size={18} />
                    {t.create_persona()}
                </Button>
            </Stack>
        </>
    )
})

export const SelectConnectPersonaAction = memo(() => {
    const { classes } = useStyles()
    return (
        <>
            <Stack p={1.25} pb={0} width="100%" boxSizing="border-box">
                <PersonaSelectPanel classes={{ unchecked: classes.unchecked, button: classes.button }} />
            </Stack>
        </>
    )
})

interface AddWalletPersonaActionProps {
    disabled: boolean
    onAddWallet(): void
}

export const AddWalletPersonaAction = memo<AddWalletPersonaActionProps>(({ onAddWallet }) => {
    const t = useNextID_Trans()
    const { classes } = useStyles()
    return (
        <>
            <Stack flex={1} px={1.25} justifyContent="flex-start" width="100%" boxSizing="border-box">
                <Typography fontWeight={400} fontSize={14}>
                    {t.add_wallet_intro()}
                </Typography>
            </Stack>
            <Stack direction="row" justifyContent="center">
                <Button color="primary" variant="contained" onClick={onAddWallet} className={classes.button}>
                    <Icons.Wallet size={16} />
                    {t.add_wallet_button()}
                </Button>
            </Stack>
        </>
    )
})

export const OtherLackWalletAction = memo(() => {
    const t = useNextID_Trans()
    return (
        <Stack justifyContent="center" alignItems="center" flex={1}>
            <Typography fontWeight={400} fontSize={14}>
                {t.others_lack_wallet()}
            </Typography>
        </Stack>
    )
})
