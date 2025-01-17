import { timeout } from '@masknet/kit'
import { attemptUntil } from '@masknet/web3-shared-base'
import {
    getSettings,
    getDefaultUserSettings,
    getUserSettings,
    getUserViaTwitterIdentity,
    getUserNFTAvatar,
    getUserNFTContainer,
    getComputedUserSettings,
    getUserByScreenName,
    getUserByScreenNameShow,
    staleUserByScreenName,
    staleUserByScreenNameShow,
    staleUserViaIdentity,
    createTweet,
    uploadMedia,
    updateProfileImage,
} from './apis/index.js'
import type { TwitterBaseAPI } from '../entry-types.js'

export class Twitter {
    static getAvatarId(avatarURL?: string) {
        if (!avatarURL) return ''
        const match = new URL(avatarURL).pathname.match(/^\/profile_images\/(\d+)/)
        return match ? match[1] : ''
    }

    static getSettings() {
        return getSettings()
    }

    static async getUserSettings() {
        const defaults = getDefaultUserSettings()
        const computed = getComputedUserSettings()

        try {
            const userSettings = await timeout(getUserSettings(), 5000, 'Timeout to get twitter user settings.')

            return {
                ...defaults,
                ...computed,
                ...userSettings,
            }
        } catch {
            return {
                ...defaults,
                ...computed,
            }
        }
    }

    static async getUserNftContainer(screenName: string) {
        return await attemptUntil<TwitterBaseAPI.NFT | undefined>(
            [
                async () => {
                    const response = await getUserNFTContainer(screenName)
                    const result = response?.data.user?.result
                    if (!result?.has_nft_avatar) throw new Error(`User ${screenName} doesn't have NFT avatar.`)

                    return {
                        address: result.nft_avatar_metadata.smart_contract.address,
                        token_id: result.nft_avatar_metadata.token_id,
                    }
                },
                async () => {
                    const response = await getUserNFTAvatar(screenName)
                    const result = response.data.user?.result
                    if (!result?.has_nft_avatar) throw new Error(`User ${screenName} doesn't have NFT avatar.`)
                    return {
                        address: result.nft_avatar_metadata.smart_contract.address,
                        token_id: result.nft_avatar_metadata.token_id,
                    }
                },
            ],
            undefined,
        )
    }

    static async uploadMedia(image: File | Blob): Promise<TwitterBaseAPI.MediaResponse> {
        return uploadMedia(image)
    }

    static async updateProfileImage(
        screenName: string,
        media_id_str: string,
    ): Promise<TwitterBaseAPI.AvatarInfo | undefined> {
        return updateProfileImage(screenName, media_id_str)
    }

    static async getUserByScreenName(
        screenName: string,
        checkNFTAvatar?: boolean,
    ): Promise<TwitterBaseAPI.User | null> {
        if (!screenName) return null
        if (checkNFTAvatar) return getUserByScreenName(screenName)
        return attemptUntil<TwitterBaseAPI.User | null>(
            [
                () => getUserByScreenNameShow(screenName),
                () => getUserByScreenName(screenName),
                () => getUserViaTwitterIdentity(screenName),
            ],
            null,
        )
    }

    static async staleUserByScreenName(screenName: string): Promise<void> {
        await staleUserByScreenName(screenName)
        await staleUserByScreenNameShow(screenName)
        await staleUserViaIdentity(screenName)
    }

    static async createTweet(tweet: TwitterBaseAPI.Tweet) {
        const response = await createTweet(tweet)
        return response.rest_id
    }
}
