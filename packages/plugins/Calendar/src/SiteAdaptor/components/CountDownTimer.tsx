import React, { useCallback, useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useCalendarTrans } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    timer: {
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '16px',
        background: theme.palette.maskColor.bg,
        color: theme.palette.maskColor.main,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
    },
}))

interface CountDownTimerProps {
    targetDate: Date
}

export function CountdownTimer({ targetDate }: CountDownTimerProps) {
    const calculateRemainingTime = useCallback(
        (targetDate: Date) => {
            const currentDate = new Date()
            const difference = differenceInSeconds(targetDate, currentDate)
            return difference > 0 ? difference : 0
        },
        [targetDate],
    )

    const [remainingTime, setRemainingTime] = useState(() => calculateRemainingTime(targetDate))

    const { classes } = useStyles()
    const t = useCalendarTrans()

    useEffect(() => {
        const interval = setInterval(() => {
            const newRemainingTime = calculateRemainingTime(targetDate)
            setRemainingTime(newRemainingTime)

            if (newRemainingTime === 0) {
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    const days = Math.floor(remainingTime / (60 * 60 * 24))
    const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((remainingTime % (60 * 60)) / 60)
    const seconds = remainingTime % 60

    return (
        <Typography className={classes.timer}>
            {remainingTime === 0 ? t.expired() : `${days}d :${hours}h :${minutes}m :${seconds}s`}
        </Typography>
    )
}
