import { NameServiceID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { first } from 'lodash-es'
import type { FollowModuleTypedData, LensBaseAPI } from '../entry-types.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { LENS_ROOT_API } from './constants.js'

export class Lens {
    static readonly id = NameServiceID.Lens
    static async getProfileByHandle(handle: string): Promise<LensBaseAPI.Profile> {
        const { data } = await fetchJSON<{ data: { profile: LensBaseAPI.Profile } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    query Profile($handle: Handle) {
                        profile(request: { handle: $handle }) {
                            id
                            handle
                            ownedBy
                            name
                            picture {
                                ... on MediaSet {
                                    original {
                                        url
                                    }
                                }
                            }
                            stats {
                                totalFollowers
                                totalFollowing
                            }
                            followModule {
                                ... on FeeFollowModuleSettings {
                                    type
                                    contractAddress
                                    amount {
                                        asset {
                                            name
                                            symbol
                                            decimals
                                            address
                                        }
                                        value
                                    }
                                    recipient
                                }
                                ... on ProfileFollowModuleSettings {
                                    type
                                }
                                ... on RevertFollowModuleSettings {
                                    type
                                }
                            }
                        }
                    }
                `,
                variables: { handle },
            }),
        })
        return data.profile
    }

    static async queryDefaultProfileByAddress(address: string) {
        if (!isValidAddress(address)) return
        const { data } = await fetchJSON<{ data: { defaultProfile?: LensBaseAPI.Profile } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query DefaultProfile {
                  defaultProfile(request: { ethereumAddress: "${address}"}) {
                    id
                    name
                    ownedBy
                    handle
                    picture {
                      ... on MediaSet {
                        original {
                          url
                          mimeType
                        }
                      }
                    }
                    stats {
                      totalFollowers
                      totalFollowing
                    }
                    followModule {
                      ... on FeeFollowModuleSettings {
                        type
                        contractAddress
                        amount {
                          asset {
                            name
                            symbol
                            decimals
                            address
                          }
                          value
                        }
                        recipient
                      }
                      ... on ProfileFollowModuleSettings {
                       type
                      }
                      ... on RevertFollowModuleSettings {
                       type
                      }
                    }
                  }
                }`,
            }),
        })
        return data.defaultProfile
    }
    static async reverse(address: string) {
        if (!isValidAddress(address)) return
        type Response = { data: { defaultProfile?: Pick<LensBaseAPI.Profile, 'id' | 'name' | 'handle'> } }
        const { data } = await fetchJSON<Response>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    query handleOfDefaultProfile($address: EthereumAddress!) {
                        defaultProfile(request: { ethereumAddress: $address }) {
                            id
                            name
                            handle
                        }
                    }
                `,
                variables: { address },
            }),
        })
        return data.defaultProfile?.handle
    }

    static async queryProfilesByAddress(address: string) {
        if (!isValidAddress(address)) return []
        const { data } = await fetchJSON<{ data: { profiles: { items: LensBaseAPI.Profile[] } } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query Profiles {
                profiles(request: { ownedBy: ["${address}"], limit: 10 }) {
                  items {
                    id
                    name
                    picture {
                      ... on MediaSet {
                        original {
                          url
                          mimeType
                        }
                      }
                    }
                    handle
                    ownedBy
                    stats {
                      totalFollowers
                      totalFollowing

                    }
                    followModule {
                      ... on FeeFollowModuleSettings {
                        type
                        amount {
                          asset {
                            symbol
                            name
                            decimals
                            address
                          }
                          value
                        }
                        recipient
                      }
                      ... on ProfileFollowModuleSettings {
                       type
                      }
                      ... on RevertFollowModuleSettings {
                       type
                      }
                    }
                  }
                }
              }`,
            }),
        })

        return data.profiles.items
    }

    static async queryFollowStatus(address: string, profileId: string) {
        if (!isValidAddress(address) || !profileId) return false

        const { data } = await fetchJSON<{ data: { doesFollow: LensBaseAPI.DoesFollow[] } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query DoesFollow {
                    doesFollow(request: {
                      followInfos: [
                        {
                          followerAddress: "${address}",
                          profileId: "${profileId}"
                        }
                      ]
                }) {
                  followerAddress
                  profileId
                  follows
                }
              }`,
            }),
        })

        if (!data.doesFollow.length) return false

        const result: LensBaseAPI.DoesFollow | undefined = data.doesFollow.find((x) =>
            isSameAddress(x.followerAddress, address),
        )

        return result?.follows
    }

    static async queryChallenge(address: string) {
        if (!isValidAddress(address)) return ''
        const { data } = await fetchJSON<{ data: { challenge: LensBaseAPI.Challenge } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query Challenge {
                  challenge(request: { address: "${address}" }) {
                    text
                  }
                }`,
            }),
        })

        return data.challenge.text
    }

    static async authenticate(address: string, signature: string) {
        if (!isValidAddress(address) || !signature) return
        const { data } = await fetchJSON<{ data: { authenticate: LensBaseAPI.Authenticate } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `mutation Authenticate {
                  authenticate(
                    request: {
                      address: "${address}"
                      signature: "${signature}"
                    }
                  ) {
                    accessToken
                    refreshToken
                  }
                }
                `,
            }),
        })

        return data.authenticate
    }

    static async refresh(refreshToken: string) {
        if (!refreshToken) return
        const { data } = await fetchJSON<{ data: { refresh: LensBaseAPI.Authenticate } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `mutation Refresh {
                  refresh(request: {
                    refreshToken: "${refreshToken}"
                  }) {
                    accessToken
                    refreshToken
                  }
                }
              `,
            }),
        })

        return data.refresh
    }

    static async createFollowTypedData(
        profileId: string,
        options: {
            token: string
            followModule?: FollowModuleTypedData
        },
    ) {
        if (!profileId) return

        let followModule = ''
        if (options.followModule?.profileFollowModule) {
            followModule = `followModule: { profileFollowModule: { profileId: "${options.followModule.profileFollowModule.profileId}" } }`
        } else if (options.followModule?.feeFollowModule) {
            followModule = `followModule: {
              feeFollowModule: {
                amount: {
                   currency: "${options.followModule.feeFollowModule.currency}",
                   value: "${options.followModule.feeFollowModule.value}"
                }
              }
            }`
        }
        const { data } = await fetchJSON<{ data: { createFollowTypedData: LensBaseAPI.CreateFollowTypedData } }>(
            LENS_ROOT_API,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': options?.token ? `Bearer ${options.token}` : '',
                },
                body: JSON.stringify({
                    query: `mutation CreateFollowTypedData {
                      createFollowTypedData(
                        request: { follow: [{ profile: "${profileId}", ${followModule} }] }
                      ) {
                        id
                        expiresAt
                        typedData {
                          domain {
                            name
                            chainId
                            version
                            verifyingContract
                          }
                          types {
                            FollowWithSig {
                              name
                              type
                            }
                          }
                          value {
                            nonce
                            deadline
                            profileIds
                            datas
                          }
                        }
                      }
                    }
                  `,
                }),
            },
        )

        return data.createFollowTypedData
    }

    static async createUnfollowTypedData(profileId: string, options: { token: string }) {
        if (!profileId) return
        const { data } = await fetchJSON<{ data: { createUnfollowTypedData: LensBaseAPI.CreateUnfollowTypedData } }>(
            LENS_ROOT_API,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': options?.token ? `Bearer ${options.token}` : '',
                },
                body: JSON.stringify({
                    query: `mutation CreateUnfollowTypedData {
                      createUnfollowTypedData(request:{
                        profile: "${profileId}"
                      }) {
                        id
                        expiresAt
                        typedData {
                          types {
                            BurnWithSig {
                              name
                              type
                            }
                          }
                          domain {
                            version
                            chainId
                            name
                            verifyingContract
                          }
                          value {
                            nonce
                            deadline
                            tokenId
                          }
                        }
                      }
                    }
                `,
                }),
            },
        )

        return data.createUnfollowTypedData
    }

    static async followWithProxyAction(profileId: string, options: { token: string }) {
        if (!profileId) return
        const { data } = await fetchJSON<{ data: { proxyAction: string } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': options?.token ? `Bearer ${options.token}` : '',
            },
            body: JSON.stringify({
                query: `mutation ProxyAction {
                  proxyAction(request: { follow: { freeFollow: { profileId: "${profileId}" } } })
                }
                `,
            }),
        })

        return data.proxyAction
    }

    static async queryProxyStatus(proxyActionId: string, options: { token: string }) {
        if (!proxyActionId) return
        const { data } = await fetchJSON<{ data: { proxyActionStatus: LensBaseAPI.ProxyActionStatus } }>(
            LENS_ROOT_API,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': options?.token ? `Bearer ${options.token}` : '',
                },
                body: JSON.stringify({
                    query: `query ProxyStatus {
                      proxyActionStatus(proxyActionId: "${proxyActionId}") {
                        ... on ProxyActionError{
                          reason
                          lastKnownTxId
                          __typename
                        }
                        ... on ProxyActionStatusResult {
                          txHash
                          txId
                          status
                          __typename
                        }
                        ... on ProxyActionQueued {
                          queuedAt
                          __typename
                        }
                      }
                    }`,
                }),
            },
        )

        return data.proxyActionStatus
    }

    static async broadcast(
        id: string,
        signature: string,
        options?: {
            token: string
            fetcher: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<unknown>
        },
    ) {
        if (!id || !options?.token || !signature) return
        const { data } = (await options.fetcher(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': options?.token ? `Bearer ${options.token}` : '',
            },
            body: JSON.stringify({
                query: `mutation Broadcast {
                      broadcast(
                        request: {
                          id: "${id}"
                          signature: "${signature}"
                        }
                      ) {
                        ... on RelayerResult {
                          txHash
                          __typename
                        }
                        ... on RelayError {
                          reason
                          __typename
                        }
                        __typename
                      }
                    }
                    `,
            }),
        })) as { data: { broadcast: LensBaseAPI.Broadcast } }

        return data.broadcast
    }

    static async queryApprovedModuleAllowanceAmount(
        currency: string,
        options?: {
            token: string
        },
    ) {
        if (!options?.token) return
        const { data } = await fetchJSON<{
            data: { approvedModuleAllowanceAmount: LensBaseAPI.ApprovedModuleAllowanceAmount[] }
        }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': options?.token ? `Bearer ${options.token}` : '',
            },
            body: JSON.stringify({
                query: `query ApprovedModuleAllowanceAmount {
              approvedModuleAllowanceAmount(request: { currencies: "${currency}", followModules: [FeeFollowModule] }) {
                currency
                module
                allowance
                contractAddress
              }
            }`,
            }),
        })

        return first(data.approvedModuleAllowanceAmount)
    }

    static async queryTransactionPublicationId(txId: string) {
        const result = await fetchJSON<{
            data: { dataAvailabilityTransaction?: LensBaseAPI.TransactionPublication }
        }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    query TransactionPublicationId($txId: String!) {
                        dataAvailabilityTransaction(request: { id: $txId }) {
                            ... on DataAvailabilityPost {
                                ...DAPostFields
                                __typename
                            }
                        }
                    }
                    fragment DAPostFields on DataAvailabilityPost {
                        publicationId
                        __typename
                    }
                `,
                variables: { txId },
            }),
        })

        return result?.data?.dataAvailabilityTransaction?.publicationId
    }
}
