import { Trans } from 'react-i18next'
import type { Plugin } from '@masknet/plugin-infra'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { Icons } from '@masknet/icons'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { VCentDialog } from './TweetDialog.js'
import { base } from '../base.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: Component,
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans i18nKey="description" ns={base.ID} />,
            name: <Trans i18nKey="name" ns={base.ID} />,
            marketListSortingPriority: 10,
            tutorialLink: 'https://realmasknetwork.notion.site/27424923ee454a4a9b0ed16fc5cb93d0',
            icon: <Icons.Valuables size={36} />,
        },
    ],
    wrapperProps: {
        icon: (
            <Icons.Valuables
                size={24}
                style={{ filter: 'drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.2))' }}
                variant="light"
            />
        ),
        title: <Trans i18nKey="name" ns={base.ID} />,
    },
}

export default site

function Component() {
    const tweetAddress = usePostInfoDetails.postID() as string | null

    if (!tweetAddress) return null
    if (!location.href.includes(`/status/${tweetAddress}`)) return null
    return (
        <DefaultWeb3ContextProvider value={{ chainId: ChainId.Mainnet }}>
            <VCentDialog tweetAddress={tweetAddress} />
        </DefaultWeb3ContextProvider>
    )
}
