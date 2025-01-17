import { keccak256, toChecksumAddress } from 'web3-utils'

export function getCreate2Address(fromAddress: string, salt: string, initCode: string): string {
    // Concatenate and hash the formula components
    const formula = ['0xff', fromAddress.toLowerCase(), salt, initCode].map((x) => x.slice(2)).join('')
    const addressBytes = keccak256(`0x${formula}`)

    // Get the last 20 bytes (40 characters) and prefix with 0x
    return toChecksumAddress(addressBytes.slice(-40))
}
