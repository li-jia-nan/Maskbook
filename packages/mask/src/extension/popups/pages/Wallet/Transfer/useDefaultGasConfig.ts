import { NetworkPluginID } from '@masknet/shared-base'
import { useGasOptions, useWeb3Others } from '@masknet/web3-hooks-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export function useDefaultGasConfig(chainId: ChainId, gasLimit: string) {
    const Others = useWeb3Others()
    const isSupportEIP1559 = Others.chainResolver.isFeatureSupported(chainId, 'EIP1559')
    const { data: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })

    const gasOption = gasOptions?.[GasOptionType.SLOW]

    if (!gasOption) return
    return isSupportEIP1559
        ? {
              gasOptionType: GasOptionType.SLOW,
              gas: gasLimit,
              maxFeePerGas: gasOption.suggestedMaxFeePerGas,
              maxPriorityFeePerGas: gasOption.suggestedMaxPriorityFeePerGas,
          }
        : {
              gasOptionType: GasOptionType.SLOW,
              gas: gasLimit,
              gasPrice: gasOption.suggestedMaxFeePerGas,
          }
}
