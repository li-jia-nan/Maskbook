import { Grid, Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'

import type { FungibleTokenDetailed } from '../../types.js'

import { FarmTokenDetailed } from './FarmTokenDetailed.js'
import { makeStyles } from '@masknet/theme'

export const useStyles = makeStyles()((theme) => {
    const isDarkMode = theme.palette.mode === 'dark'
    return {
        accordion: {
            marginBottom: '20px',
            width: '100%',
            background: 'transparent',
            ':first-of-type': {
                borderRadius: 0,
            },
            ':before': {
                height: 0,
                opacity: 0,
            },
        },
        accordionSummary: {
            margin: 0,
            padding: 0,
        },
        accordionSummaryContent: {
            margin: '0px!important',
        },
        accordionDetails: {
            marginTop: '8px',
            padding: '8px',
            background: isDarkMode ? '#15171A' : theme.palette.background.default,
            borderRadius: '4px',
        },
        container: {
            fontWeight: 400,
        },
    }
})

export interface AccordionFarmProps extends React.PropsWithChildren<{}> {
    rewardToken?: FungibleTokenDetailed
    referredToken?: FungibleTokenDetailed
    totalValue: number
}

export function AccordionFarm({ rewardToken, referredToken, totalValue, children }: AccordionFarmProps) {
    const { classes } = useStyles()

    return (
        <Accordion className={classes.accordion}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                classes={{
                    root: classes.accordionSummary,
                    content: classes.accordionSummaryContent,
                }}>
                <Grid container className={classes.container}>
                    <Grid item xs={8}>
                        <FarmTokenDetailed token={referredToken} />
                    </Grid>
                    <Grid item xs={4} display="flex" alignItems="center">
                        {Number.parseFloat(totalValue.toFixed(5))} {rewardToken?.symbol || '-'}
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>{children}</AccordionDetails>
        </Accordion>
    )
}
