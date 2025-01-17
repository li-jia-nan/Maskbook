import { isNull } from 'lodash-es'
import { ProfileIdentifier, type SocialIdentity } from '@masknet/shared-base'
import { Twitter } from '@masknet/web3-providers'
import type { SiteAdaptor } from '@masknet/types'
import { twitterBase } from '../base.js'

/**
 * @link https://help.twitter.com/en/managing-your-account/twitter-username-rules
 */
export const usernameValidator: NonNullable<SiteAdaptor.Utils['isValidUsername']> = (name: string) => {
    for (const v of [/(twitter|admin)/i, /.{16,}/, /\W/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }
    if (name.length < 4) return false
    return true
}

export async function getUserIdentity(twitterId: string): Promise<SocialIdentity | undefined> {
    const user = await Twitter.getUserByScreenName(twitterId)
    if (!user) return

    return {
        identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, user.screenName).unwrapOr(undefined),
        nickname: user.nickname,
        avatar: user.avatarURL,
        bio: user.bio,
        homepage: user.homepage,
    }
}

export function getUserId(ele: HTMLElement) {
    return ele?.querySelector('a[href][role=link]')?.getAttribute('href')?.slice(1)
}
