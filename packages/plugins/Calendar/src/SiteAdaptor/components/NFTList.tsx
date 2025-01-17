import React, { useMemo, type ReactNode, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { EmptyStatus, LoadingStatus } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { IconButton, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { formatDate } from './EventList.js'
import { CountdownTimer } from './CountDownTimer.js'
import { useCalendarTrans } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '506px',
        width: '100%',
        overflowY: 'scroll',
        position: 'relative',
        gap: '10px',
        '&::-webkit-scrollbar': {
            width: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.maskColor.secondaryLine,
            borderRadius: '99px',
        },
        marginBottom: '50px',
    },
    paddingWrap: {
        paddingRight: '12px',
    },
    empty: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 12,
        color: theme.palette.maskColor.second,
        whiteSpace: 'nowrap',
    },
    eventCard: {
        display: 'flex',
        padding: '8px 0',
        flexDirection: 'column',
        gap: '8px',
        fontWeight: 700,
        lineHeight: '16px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    eventHeader: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
    },
    projectWrap: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        color: theme.palette.maskColor.main,
    },
    projectName: {
        color: theme.palette.maskColor.main,
        fontSize: '12px',
        fontWeight: 700,
        lineHeight: '16px',
    },
    logo: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
    },
    eventTitle: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    second: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    poster: {
        borderRadius: '8px',
        width: '100%',
        height: '156px',
        objectFit: 'cover',
    },
    dateDiv: {
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        padding: '10px 0',
    },
    socialLinks: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
}))

interface NFTListProps {
    list: Record<string, any[]>
    isLoading: boolean
    empty: boolean
    dateString: string
}

const socialIcons: Record<string, ReactNode> = {
    twitter: <Icons.TwitterX size={18} />,
    discord: <Icons.DiscordRoundBlack size={20} color="#000" />,
    website: <Icons.WebBlack size={20} />,
}

const sortPlat = (_: any, b: { type: string }) => {
    if (b.type === 'website') return -1
    else return 0
}

export function NFTList({ list, isLoading, empty, dateString }: NFTListProps) {
    const { classes, cx } = useStyles()
    const t = useCalendarTrans()
    const listRef = useRef<HTMLDivElement>(null)
    const listAfterDate = useMemo(() => {
        const listAfterDate: string[] = []
        for (const key in list) {
            if (new Date(key) >= new Date(dateString)) {
                listAfterDate.push(key)
            }
        }
        return listAfterDate
    }, [list, dateString])
    useEffect(() => {
        if (listRef.current)
            listRef.current.scrollTo({
                top: 0,
            })
    }, [listRef, list])
    return (
        <div className={classes.container} ref={listRef}>
            <div className={classes.paddingWrap}>
                {isLoading && !list?.length ? (
                    <div className={cx(classes.empty, classes.eventTitle)}>
                        <LoadingStatus />
                    </div>
                ) : !empty && listAfterDate.length ? (
                    listAfterDate.map((key) => {
                        return (
                            <div key={key}>
                                <Typography className={classes.dateDiv}>
                                    {format(new Date(key), 'MMM dd,yyy')}
                                </Typography>
                                {list[key].map((v) => (
                                    <div
                                        className={classes.eventCard}
                                        key={v.eventTitle}
                                        onClick={() => {
                                            window.open(v.event_url)
                                        }}>
                                        <div className={classes.eventHeader}>
                                            <div className={classes.projectWrap}>
                                                <img src={v.project.logo} className={classes.logo} alt="logo" />
                                                <Typography className={classes.projectName}>
                                                    {v.project.name}
                                                </Typography>
                                            </div>
                                        </div>
                                        <Typography className={classes.eventTitle}>{v.project.description}</Typography>
                                        <div className={classes.eventHeader}>
                                            <CountdownTimer targetDate={new Date(v.event_date)} />
                                            <div className={classes.socialLinks}>
                                                {v.project.links
                                                    .sort(sortPlat)
                                                    .map((platform: { type: string; url: string }) => {
                                                        return (
                                                            <IconButton
                                                                style={{ width: '20px', height: '20px' }}
                                                                key={platform.type}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    window.open(platform.url)
                                                                }}>
                                                                {socialIcons[platform.type]}
                                                            </IconButton>
                                                        )
                                                    })}
                                            </div>
                                        </div>
                                        <div className={classes.eventHeader}>
                                            <Typography className={classes.second}>{t.total()}</Typography>
                                            <Typography className={classes.eventTitle}>
                                                {Number(v.ext_info.nft_info.total).toLocaleString('en-US')}
                                            </Typography>
                                        </div>
                                        <div className={classes.eventHeader}>
                                            <Typography className={classes.second}>{t.price()}</Typography>
                                            <Typography className={classes.eventTitle}>
                                                {v.ext_info.nft_info.token}
                                            </Typography>
                                        </div>
                                        <div className={classes.eventHeader}>
                                            <Typography className={classes.second}>{t.date()}</Typography>
                                            <Typography className={classes.eventTitle}>
                                                {formatDate(v.event_date)}
                                            </Typography>
                                        </div>
                                        <img className={classes.poster} src={v.poster_url} alt="poster" />
                                    </div>
                                ))}
                            </div>
                        )
                    })
                ) : (
                    <EmptyStatus className={classes.empty}>{t.empty_status()}</EmptyStatus>
                )}
            </div>
        </div>
    )
}
