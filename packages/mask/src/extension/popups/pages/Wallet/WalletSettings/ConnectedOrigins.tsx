import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import { useMaskSharedTrans } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { useConnectedOrigins } from '../../../hooks/useConnectedOrigins.js'

export function ConnectedOrigins() {
    const { t } = useMaskSharedTrans()
    const theme = useTheme()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { data: origins } = useConnectedOrigins()

    return (
        <ListItem className={classes.item} onClick={() => navigate(PopupRoutes.ConnectedSites)}>
            <Box className={classes.itemBox}>
                <Icons.Appendices size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('popups_wallet_connected_sites')}</Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Typography className={classes.itemText}>{origins ? origins.size : 0}</Typography>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
