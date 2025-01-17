import { memo, useMemo, useState } from 'react'
import { noop } from 'lodash-es'
import { Flags } from '@masknet/flags'
import { makeStyles } from '@masknet/theme'
import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { useThemeSettings } from '../../../../components/DataSource/useActivatedUI.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { TipButtonStyle } from '../../constant.js'
import { normalFollowButtonSelector as selector } from '../../utils/selector.js'
import type { SocialIdentity } from '@masknet/shared-base'
import { getUserIdentity } from '../../utils/user.js'
import { isVerifiedUser } from '../../utils/AvatarType.js'

function getTwitterId(ele: HTMLElement) {
    const profileLink = ele.closest('[data-testid="UserCell"]')?.querySelector('a[role="link"]')
    if (!profileLink) return
    return profileLink.getAttribute('href')?.slice(1)
}

export function injectTipsButtonOnFollowButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(
        watcher.useForeach((ele) => {
            let remover = noop
            const remove = () => remover()

            const run = async () => {
                const twitterId = getTwitterId(ele)
                if (!twitterId) return
                const proxy = DOMProxy({
                    afterShadowRootInit: Flags.shadowRootInit,
                })
                proxy.realCurrent = ele

                const isVerified = isVerifiedUser(ele)
                const identity = await getUserIdentity(twitterId)
                if (!identity) return

                const root = attachReactTreeWithContainer(proxy.beforeShadow, { signal })
                root.render(isVerified ? <FollowButtonTipsSlot identity={identity} /> : <div />)
                remover = root.destroy
            }

            run()
            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: remove,
            }
        }),
        signal,
    )
}

const useStyles = makeStyles()((theme) => ({
    disabled: {
        display: 'none',
    },
    slot: {
        height: 36,
        width: 36,
        position: 'absolute',
        left: -10,
        top: 1,
        transform: 'translate(-100%)',
    },
}))

interface Props {
    identity: SocialIdentity
}

const FollowButtonTipsSlot = memo(({ identity }: Props) => {
    const themeSetting = useThemeSettings()
    const tipStyle = TipButtonStyle[themeSetting.size]
    const { classes, cx } = useStyles()

    const [disabled, setDisabled] = useState(true)

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )
        return (
            <Component
                identity={identity?.identifier}
                buttonSize={tipStyle.buttonSize}
                iconSize={tipStyle.iconSize}
                slot={Plugin.SiteAdaptor.TipsSlot.FollowButton}
                onStatusUpdate={setDisabled}
            />
        )
    }, [identity?.identifier, tipStyle.buttonSize, tipStyle.iconSize])

    if (!identity?.identifier) return null

    return <span className={cx(classes.slot, disabled ? classes.disabled : null)}>{component}</span>
})
