import { getEnumAsArray } from '@masknet/kit'
import { type StorageItem, NameServiceID, InMemoryStorages, type NetworkPluginID } from '@masknet/shared-base'
import { attemptUntil, type NameServiceState as Web3NameServiceState } from '@masknet/web3-shared-base'
import type { NameServiceAPI, WalletAPI } from '../../../entry-types.js'

export class NameServiceState<
    DomainBook extends Record<string, string> = Record<string, string>,
    DomainBooks extends Record<NameServiceID, DomainBook> = Record<NameServiceID, DomainBook>,
> implements Web3NameServiceState
{
    public storage: StorageItem<DomainBooks> = null!

    constructor(
        protected context: WalletAPI.IOContext,
        protected options: {
            pluginID: NetworkPluginID
            isValidName(a: string): boolean
            isValidAddress(a: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const { storage } = InMemoryStorages.Web3.createSubScope(`${this.options.pluginID}_NameServiceV2`, {
            value: Object.fromEntries(getEnumAsArray(NameServiceID).map((x) => [x.value, {}])) as DomainBooks,
        })
        this.storage = storage.value
    }

    get ready() {
        return this.storage.initialized
    }

    get readyPromise() {
        return this.storage.initializedPromise
    }

    private async addName(id: NameServiceID, address: string, name: string) {
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.options.formatAddress(address)
        await this.storage.setValue({
            ...all,
            [id]: {
                ...all[id],
                [formattedAddress]: name,
                [name]: formattedAddress,
            },
        })
    }

    private async addAddress(id: NameServiceID, name: string, address: string) {
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.options.formatAddress(address)
        await this.storage.setValue({
            ...all,
            [id]: {
                ...all[id],
                [name]: formattedAddress,
                [formattedAddress]: name,
            },
        })
    }

    async lookup(name: string) {
        if (!name) return
        const callbacks = this.createResolvers().map((resolver) => {
            return async () => {
                const address = this.storage.value[resolver.id][name] || (await resolver.lookup?.(name))
                if (address && this.options.isValidAddress(address)) {
                    const formattedAddress = this.options.formatAddress(address)
                    await this.addAddress(resolver.id, name, formattedAddress)
                    return formattedAddress
                }
                return
            }
        })
        return attemptUntil(callbacks, undefined, () => false)
    }

    async reverse(address: string, domainOnly?: boolean) {
        if (!this.options.isValidAddress(address)) return
        const callbacks = this.createResolvers(domainOnly).map((resolver) => {
            return async () => {
                let name: string | undefined = this.storage.value[resolver.id][this.options.formatAddress(address)]
                if (!name) name = await resolver.reverse?.(address)
                if (name) {
                    await this.addName(resolver.id, address, name)
                    return name
                }
                return
            }
        })
        return attemptUntil(callbacks, undefined, (result) => !result)
    }

    async safeReverse(address: string, domainOnly?: boolean) {
        try {
            return await this.reverse(address, domainOnly)
        } catch {}
        return
    }

    createResolvers(domainOnly?: boolean): NameServiceAPI.Provider[] {
        throw new Error('Method not implemented.')
    }
}
